import { describe, expect, it } from 'vitest';
import { chainAuditEvent, verifyAuditChain, type ChainedAuditPayload } from '../src/lib/audit/integrity';

const first = { eventId: 'evt-1', occurredAt: '2026-10-12T12:00:00.000Z', actorId: 'u1', action: 'student.create', resourceType: 'Student', resourceId: 's1', outcome: 'SUCCESS' as const };
const second = { eventId: 'evt-2', occurredAt: '2026-10-12T12:01:00.000Z', actorId: 'u1', action: 'student.update', resourceType: 'Student', resourceId: 's1', outcome: 'SUCCESS' as const, changes: { status: ['APPLICANT', 'ENROLLED'] } };

describe('audit integrity chain', () => {
  it('verifies a valid chain', () => {
    const a = chainAuditEvent(first);
    const b = chainAuditEvent(second, a.eventHash);
    expect(verifyAuditChain([a, b])).toEqual({ valid: true, invalidIndex: null });
  });
  it('detects payload tampering', () => {
    const a = chainAuditEvent(first);
    const tampered = { ...a, action: 'audit.export' } as ChainedAuditPayload;
    expect(verifyAuditChain([tampered])).toEqual({ valid: false, invalidIndex: 0 });
  });
  it('detects a missing or reordered event', () => {
    const a = chainAuditEvent(first);
    const b = chainAuditEvent(second, a.eventHash);
    expect(verifyAuditChain([b])).toEqual({ valid: false, invalidIndex: 0 });
  });
});
