import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export const SESSION_COOKIE = "kcmsc_session";
const SESSION_DAYS = 12;
const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const hashIp = (ip: string | null) =>
  ip ? createHash("sha256").update(ip).digest("hex") : null;

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = headerStore.get("user-agent")?.slice(0, 300) ?? null;
  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
      userAgent,
      ipHash: hashIp(ip),
    },
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    priority: "high",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token)
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token || token.length > 100) {
    return null;
  }

  const now = new Date();

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
    include: {
      user: {
        include: {
          roleAssignments: {
            where: {
              revokedAt: null,
              startsAt: { lte: now },
              OR: [{ endsAt: null }, { endsAt: { gt: now } }],
            },
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (
    !session ||
    session.expiresAt <= now ||
    session.user.status !== "ACTIVE"
  ) {
    if (session) {
      await prisma.session.deleteMany({
        where: { id: session.id },
      });
    }

    return null;
  }

  return {
    id: session.user.id,
    displayName: session.user.displayName,
    email: session.user.email,
    username: session.user.username,
    roles: session.user.roleAssignments.map((assignment) => ({
      key: assignment.role.key,
      name: assignment.role.name,
      scopeType: assignment.scopeType,
      scopeId: assignment.scopeId,
      permissions: assignment.role.permissions.map(
        (rolePermission) => rolePermission.permission.key,
      ),
    })),
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requirePermission(
  permission: string,
  scope?: { type: string; id: string },
) {
  const user = await requireUser();
  const allowed = user.roles.some(
    (role) =>
      role.permissions.includes(permission) &&
      (!scope ||
        (role.scopeType === scope.type && role.scopeId === scope.id) ||
        (role.scopeType === "GLOBAL" && role.scopeId === "*")),
  );
  if (!allowed) redirect("/dashboard?error=forbidden");
  return user;
}
