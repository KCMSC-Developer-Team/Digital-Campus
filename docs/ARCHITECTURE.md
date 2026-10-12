# Architecture

## Current direction

Use a modular monolith with Next.js App Router, TypeScript, PostgreSQL, and Prisma. Keep domain logic server-side. Introduce domain services rather than embedding business rules in React components.

Suggested modules:
- `auth`: identity, sessions, account recovery, activation.
- `authorization`: permission vocabulary, role assignments, scope checks.
- `people`: students, guardians, staff, enrollment and assignment history.
- `academics`: academic years, grades, sections, subjects, teaching assignments.
- `admissions`: application review and enrollment provisioning.
- `approvals`: reusable state transition engine.
- `audit`: append-only application behavior, chain verification, checkpoints.
- `notifications`: in-app delivery and later transactional email/background jobs.
- `scheduling`, `syllabus`, `classroom`, `attendance`, `assessment`, `governance`, `reporting`.

## Trust boundaries

- Browser input is untrusted. Never accept client-supplied roles or scopes as authorization facts.
- Private record access must be checked against the requested record's relationship and scope on every server request.
- Private files must not live in public static directories.
- Logs must not contain passwords, session tokens, or unnecessary personal data.
- The public school website is a separate application and receives only intentionally published public data.

## Audit design

The initial helper computes a SHA-256 hash chain over canonical event payloads. A chain alone cannot prevent a database administrator from rewriting every row and recomputing hashes. Production integrity therefore requires restricted database privileges, independent signed or externally stored checkpoints, protected backups, and scheduled verification. Audit writes must be coupled transactionally to high-impact mutations.

## Authentication decision

Select and configure a maintained provider before protected routes are added. Student-ID onboarding must verify possession through an approved channel or supervised process; a phone number alone is not proof of identity. Privileged accounts should use stronger authentication where supported.
