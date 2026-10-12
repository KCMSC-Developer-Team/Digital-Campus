'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { createSession, destroySession } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/password';
import { appendAuditEvent } from '@/lib/audit/write';

const loginSchema = z.object({ identifier: z.string().trim().min(1).max(254), password: z.string().min(1).max(256) });
const genericFailure = 'Invalid sign-in details, or this account is not active.';
const digest = (value: string) => createHash('sha256').update(value).digest('hex');

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({ identifier: formData.get('identifier'), password: formData.get('password') });
  if (!parsed.success) redirect('/login?error=invalid');
  const identifier = parsed.data.identifier.toLowerCase();
  const headerStore = await headers();
  const ip = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
  const ipHash = ip ? digest(ip) : null;
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const recent = await prisma.loginAttempt.count({ where: { occurredAt: { gte: since }, OR: [{ identifier }, ...(ipHash ? [{ ipHash }] : [])] } });
  if (recent >= 10) redirect('/login?error=limited');

  const user = await prisma.user.findFirst({ where: { OR: [{ username: identifier }, { email: identifier }, { phoneE164: identifier }] } });
  const passwordValid = await verifyPassword(parsed.data.password, user?.passwordHash ?? null);
  const success = Boolean(user && passwordValid && user.status === 'ACTIVE');
  await prisma.loginAttempt.create({ data: { identifier, userId: user?.id, succeeded: success, ipHash } });
  if (!success || !user) {
    await prisma.$transaction(async (tx) => appendAuditEvent(tx, { actorId: user?.id ?? null, action: 'auth.login', resourceType: 'User', resourceId: user?.id ?? null, outcome: 'DENIED', reason: 'Invalid credentials or inactive account' }));
    redirect(`/login?error=${recent >= 7 ? 'limited' : 'invalid'}`);
  }

  await createSession(user.id);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await appendAuditEvent(tx, { actorId: user.id, action: 'auth.login', resourceType: 'User', resourceId: user.id });
  });
  redirect('/dashboard');
}

export async function logoutAction() {
  const { getCurrentUser } = await import('@/lib/auth/session');
  const user = await getCurrentUser();
  await destroySession();
  if (user) await prisma.$transaction(async (tx) => appendAuditEvent(tx, { actorId: user.id, action: 'auth.logout', resourceType: 'User', resourceId: user.id }));
  redirect('/login?message=signed-out');
}
