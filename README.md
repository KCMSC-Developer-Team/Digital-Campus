# KCMSC Digital Campus

Private institutional operations platform for K C Model School & College, Bangladesh. The public school website remains a separate application.

## Current implementation status

This repository is a new foundation scaffold created because no existing application repository was present in the available workspace. It is **not production-ready** and does not yet provide authentication, protected dashboards, admission workflows, or live institutional data.

Implemented in this foundation:
- Next.js App Router and strict TypeScript project setup.
- Minimal responsive base page and centralized CSS tokens.
- Initial normalized Prisma models for identity, roles/permissions, academic years, grades, sections, students, enrollments, guardians, staff, approvals, notifications, and audit records.
- Pure permission-policy helper with scope checks.
- Audit hash-chain helper and unit tests for the helper functions.
- Environment variable template without credentials.

Not yet implemented or verified:
- Authentication/session provider and account activation.
- Database migrations applied to PostgreSQL.
- Persistence-integrated authorization and audit transactions.
- Admission-to-account-provisioning workflow.
- Audit reader/writer separation, protected checkpoints, and independent backup storage.
- Background job queue, email delivery, private file storage, operational dashboards, and deployment.

## Requirements

- Node.js 22+
- PostgreSQL 15+
- npm

## Local setup

1. Copy `.env.example` to `.env` and set a local PostgreSQL `DATABASE_URL` and a strong random `AUTH_SECRET`.
2. Install dependencies with `npm install`.
3. Generate Prisma Client with `npm run db:generate`.
4. Validate the schema with `npm run db:validate`.
5. After reviewing the schema, create a development migration with `npm run db:migrate:dev`.
6. Run `npm run dev`.

Do not point development commands at production. Never use database reset commands against production.

## Quality checks

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run db:validate`
- `npm run build`

These commands must be run after dependencies are installed. Passing helper tests does not establish that authorization is correctly enforced by application routes; route-level security tests are still required.

## Deployment outline

1. Provision separate staging and production PostgreSQL databases with least-privilege credentials.
2. Configure HTTPS and DNS for `campus.kcmsc.edu.bd` at the deployment provider.
3. Set environment variables in the hosting control plane, never in source control.
4. Run reviewed migrations with `npm run db:migrate:deploy` as a release step.
5. Deploy the application and verify health checks, authentication, access boundaries, and rollback readiness.
6. Configure encrypted, independent backups and test restoration before onboarding real records.

Production deployment is blocked until authentication, route-level authorization, migrations, audit persistence/integrity, backups, monitoring, and the relevant tests are implemented and verified.
