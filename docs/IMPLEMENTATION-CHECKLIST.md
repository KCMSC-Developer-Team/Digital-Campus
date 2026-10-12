# Implementation checklist

## Phase 1 — Foundation
- [x] Inspect available workspace; no existing application repository was present.
- [x] Create initial Next.js/TypeScript/Tailwind project configuration.
- [x] Define minimal base styling and accessible landing state.
- [x] Draft initial Prisma identity, academic structure, approval, notification, and audit models.
- [x] Add pure permission helper with scoped checks.
- [x] Add audit hash-chain helper and helper-level unit tests.
- [x] Document current architecture and permission baseline.
- [ ] Install dependencies and verify compatibility.
- [ ] Run Prisma schema validation and generate a reviewed initial migration.
- [ ] Select and integrate authentication provider.
- [ ] Implement database-backed role and scope resolution.
- [ ] Implement transactional audit writer and protected audit reader/export routes.
- [ ] Add route-level authorization and IDOR tests.
- [ ] Configure CI and verify lint, typecheck, tests, and production build.

## Phase 2 — Admissions and people
- [ ] Admission application lifecycle and document handling.
- [ ] Student number allocation with transaction-safe uniqueness.
- [ ] Enrollment approval and account activation.
- [ ] Guardian relationship verification.
- [ ] Staff and teaching assignments.
- [ ] Scoped, paginated student directory.

## Phases 3–6
- [ ] Timetable constraints and versioned publication.
- [ ] Syllabus, class diary, assignments, attendance, examinations, and results.
- [ ] Governance approvals and global audit interface.
- [ ] Durable job queue, email delivery, failure monitoring, guardian portal, optional finance.

No unchecked item should be represented as complete in product UI or release notes.
