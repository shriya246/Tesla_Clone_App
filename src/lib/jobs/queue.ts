import "server-only";

import { BackgroundJobKind, Prisma } from "@prisma/client";

import { createBackgroundJob } from "@/lib/db/background-jobs";
import type { SendEmailOptions } from "@/lib/email/send-email";
import type { WebhookEventEnvelope } from "@/lib/webhooks/types";

function toJsonValue(value: unknown) {
  return value as Prisma.InputJsonValue;
}

export function enqueueBackgroundJob(input: {
  kind: BackgroundJobKind;
  payload: unknown;
  dedupeKey?: string;
  maxAttempts?: number;
  runAfter?: Date;
}) {
  return createBackgroundJob({
    kind: input.kind,
    payload: toJsonValue(input.payload),
    dedupeKey: input.dedupeKey,
    maxAttempts: input.maxAttempts,
    runAfter: input.runAfter,
  });
}

export function enqueueWebhookDeliveryJob(input: {
  endpointId: string;
  payload: WebhookEventEnvelope;
  dedupeKey: string;
}) {
  return enqueueBackgroundJob({
    kind: BackgroundJobKind.WEBHOOK_DELIVERY,
    payload: {
      endpointId: input.endpointId,
      payload: input.payload,
    },
    dedupeKey: input.dedupeKey,
    maxAttempts: 5,
  });
}

export function enqueueEmailDeliveryJob(input: {
  message: SendEmailOptions;
  dedupeKey: string;
}) {
  return enqueueBackgroundJob({
    kind: BackgroundJobKind.EMAIL_DELIVERY,
    payload: input.message,
    dedupeKey: input.dedupeKey,
    maxAttempts: 4,
  });
}

export function enqueueCacheInvalidationJob(input: {
  tags?: string[];
  paths?: string[];
  reason?: string;
  dedupeKey?: string;
}) {
  return enqueueBackgroundJob({
    kind: BackgroundJobKind.CACHE_INVALIDATION,
    payload: {
      tags: input.tags ?? [],
      paths: input.paths ?? [],
      reason: input.reason,
    },
    dedupeKey: input.dedupeKey,
    maxAttempts: 2,
  });
}
