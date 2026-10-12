import 'server-only';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { chainAuditEvent } from './integrity';

/** Call inside the same Prisma transaction as the mutation. */
export async function appendAuditEvent(tx: Prisma.TransactionClient, input: {
  actorId: string | null; action: string; resourceType: string; resourceId?: string | null;
  outcome?: 'SUCCESS' | 'DENIED' | 'FAILURE'; reason?: string | null; changes?: unknown;
}) {
  const last = await tx.auditEvent.findFirst({ orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }], select: { eventHash: true } });
  const payload = {
    eventId: randomUUID(), occurredAt: new Date().toISOString(), actorId: input.actorId,
    action: input.action, resourceType: input.resourceType, resourceId: input.resourceId ?? null,
    outcome: input.outcome ?? 'SUCCESS' as const, reason: input.reason ?? null,
    changes: input.changes ?? null,
  };
  const chained = chainAuditEvent(payload, last?.eventHash ?? '0'.repeat(64));
  await tx.auditEvent.create({ data: {
    id: chained.eventId, occurredAt: new Date(chained.occurredAt), actorId: chained.actorId,
    action: chained.action, resourceType: chained.resourceType, resourceId: chained.resourceId,
    outcome: chained.outcome, reason: chained.reason, changes: chained.changes as never,
    previousHash: chained.previousHash, eventHash: chained.eventHash,
  } });
}
