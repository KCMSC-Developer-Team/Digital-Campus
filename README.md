# KCMSC Digital Campus

Private institutional operating system for K C Model School & College. The public school website remains a separate application.

## Current implementation status

Implemented in this repository:
- Next.js App Router / TypeScript / Tailwind foundation.
- PostgreSQL data model for identity, multi-role assignments, organizational units, academic years, grades, sections, students, enrollments, guardians, staff, approvals, notifications, sessions, login attempts, and audit events/checkpoints.
- Database-backed credentials sign-in with scrypt password hashes, opaque random session tokens stored as SHA-256 hashes, HttpOnly cookies, server-side session resolution, account status checks, and sign-out.
- Login-attempt recording and a basic durable database-backed attempt limit.
- Seed catalog for the roles and permission vocabulary in `scripts/seed.mjs`.
- Role-aware dashboard navigation and limited read views for records when the account has a global scope. The initial IT Manager bootstrap does not receive audit access.
- Hash-chain audit helper and an audit writer intended to be called within a Prisma transaction.
- Explicit permission checks at the server page boundary.

Not yet production-complete:
- Section-scoped record filtering across every domain; this build intentionally does not expose student lists to scoped accounts until filtering is implemented.
- Account administration UI, invitation/reset flows, MFA, email verification, and recovery.
- Full admission lifecycle, document storage, timetabling engine, attendance entry/corrections, syllabus and class diary publishing, assignments, exams, results, governance actions, durable job queue, email delivery, audit verification/checkpoint export, and comprehensive tests.
- A committed initial Prisma migration. Create and review one against the configured PostgreSQL instance before deploying.

Do not load live student or guardian data until the outstanding record-level scope checks, migration, backup policy, audit verification, and security tests are reviewed.

## Requirements

- Node.js 22 LTS or a version supported by the locked Next.js release.
- PostgreSQL 15 or newer, reachable from the app host.
- A private `.env` file based on `.env.example`.

## Local setup

1. Install dependencies: `npm ci`
2. Set `DATABASE_URL` to a dedicated PostgreSQL database in `.env`.
3. Generate Prisma Client: `npm run db:generate`
4. For a new development database, review schema and run `npm run db:migrate -- --name init`.
5. Set the four `BOOTSTRAP_ADMIN_*` variables in `.env` to values for an institution-authorized administrator. Use a unique random password of at least 16 characters.
6. Run `npm run db:seed` once. It creates roles/permissions and the initial IT Manager account only if that account does not already exist. It refuses to overwrite an existing account.
7. Remove the `BOOTSTRAP_ADMIN_*` values from `.env` after seeding.
8. Start the app: `npm run dev`; open `http://localhost:3000`.

For production, generate and review a migration in development, commit it, and use `npm run db:deploy` during deployment. Do not run `prisma migrate dev` against production.

## Useful commands

- `npm run db:validate`
- `npm run db:generate`
- `npm run db:studio` (local trusted administrators only)
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

## Security notes

- Never commit `.env`, database credentials, bootstrap credentials, or production exports.
- The first seeded IT Manager has a global role-assignment scope to allow setup, but does not receive `audit.read` or student-directory permissions. Review and reduce setup privileges after creating individually assigned accounts.
- The audit chain is tamper-evident only when writers are serialized and verification/checkpoints are protected independently. A database administrator could rewrite an unanchored chain. Do not describe it as tamper-proof.
- Rate limiting in this foundation is a basic database attempt counter. Before public deployment, add edge/network throttling and monitoring, trusted-proxy configuration, MFA for privileged accounts, secure headers, backup/restore drills, and a security review.
- `x-forwarded-for` is only trustworthy when the app is behind a known, correctly configured proxy. Configure that trust boundary before relying on IP-based abuse detection.
