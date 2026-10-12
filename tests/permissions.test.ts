import { describe, expect, it } from 'vitest';
import { canReadGlobalAudit, isAuthorized, type AuthorizationContext } from '../src/lib/auth/permissions';

const teacher: AuthorizationContext = {
  userId: 'user-teacher',
  assignments: [{ role: 'TEACHER', permissions: ['student.read', 'marks.enter'], scopes: ['section:2026-10-A'], active: true }],
};

describe('authorization policy', () => {
  it('allows an explicitly granted permission within scope', () => {
    expect(isAuthorized(teacher, { permission: 'student.read', requiredScope: 'section:2026-10-A' })).toBe(true);
  });
  it('denies access outside assigned scope', () => {
    expect(isAuthorized(teacher, { permission: 'student.read', requiredScope: 'section:2026-10-B' })).toBe(false);
  });
  it('does not infer global audit access from a teacher role', () => {
    expect(canReadGlobalAudit(teacher)).toBe(false);
  });
  it('denies anonymous or inactive assignments', () => {
    expect(isAuthorized(null, { permission: 'student.read' })).toBe(false);
    expect(isAuthorized({ userId: 'u', assignments: [{ role: 'X', permissions: ['student.read'], scopes: ['*'], active: false }] }, { permission: 'student.read' })).toBe(false);
  });
});
