import { createHash } from 'node:crypto';

export type AuditPayload = {
  eventId: string;
  occurredAt: string;
  actorId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  outcome: 'SUCCESS' | 'DENIED' | 'FAILURE';
  reason?: string | null;
  correlationId?: string | null;
  changes?: unknown;
};

export type ChainedAuditPayload = AuditPayload & {
  previousHash: string;
  eventHash: string;
};

const GENESIS_HASH = '0'.repeat(64);

/** Stable key ordering is required so a record hashes identically across verification runs. */
function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`).join(',')}}`;
}

export function hashAuditEvent(payload: AuditPayload, previousHash: string): string {
  return createHash('sha256').update(previousHash).update('\n').update(stableSerialize(payload)).digest('hex');
}

export function chainAuditEvent(payload: AuditPayload, previousHash = GENESIS_HASH): ChainedAuditPayload {
  return { ...payload, previousHash, eventHash: hashAuditEvent(payload, previousHash) };
}

export function verifyAuditChain(events: readonly ChainedAuditPayload[]): { valid: boolean; invalidIndex: number | null } {
  let expectedPrevious = GENESIS_HASH;
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    if (event.previousHash !== expectedPrevious) return { valid: false, invalidIndex: index };
    const { previousHash, eventHash, ...payload } = event;
    if (hashAuditEvent(payload, previousHash) !== eventHash) return { valid: false, invalidIndex: index };
    expectedPrevious = eventHash;
  }
  return { valid: true, invalidIndex: null };
}
