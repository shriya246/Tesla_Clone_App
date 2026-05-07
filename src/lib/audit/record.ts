import "server-only";

import * as Sentry from "@sentry/nextjs";
import { AuditAction, Prisma } from "@prisma/client";
import type { UserRole } from "@prisma/client";

import { createAuditLog } from "@/lib/db/audit-logs";

export interface AuditActor {
  userId?: string | null;
  email?: string | null;
  role?: UserRole | null;
}

export interface RecordAuditLogInput {
  action: AuditAction;
  actor?: AuditActor;
  entity: {
    type: string;
    id?: string | null;
  };
  message: string;
  metadata?: Record<string, unknown>;
  requestId?: string;
}

function toJsonValue(value: unknown) {
  return value as Prisma.InputJsonValue;
}

export function recordAuditLog(input: RecordAuditLogInput) {
  return createAuditLog({
    action: input.action,
    entityType: input.entity.type,
    entityId: input.entity.id,
    message: input.message,
    metadata: input.metadata ? toJsonValue(input.metadata) : undefined,
    requestId: input.requestId,
    actorUserId: input.actor?.userId ?? undefined,
    actorEmail: input.actor?.email ?? undefined,
    actorRole: input.actor?.role ?? undefined,
  });
}

export async function recordAuditLogSafely(input: RecordAuditLogInput) {
  try {
    return await recordAuditLog(input);
  } catch (error) {
    Sentry.captureException(error);
    console.error("Failed to record audit log.", error);

    return null;
  }
}
