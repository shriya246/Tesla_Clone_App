import "server-only";

import { BackgroundJobKind } from "@prisma/client";
import { z } from "zod";

import { revalidateCachePaths, revalidateCacheTags } from "@/lib/cache";
import { sendEmail } from "@/lib/email/send-email";
import type { BackgroundJobHandler } from "@/lib/jobs/types";
import { sendWebhook } from "@/lib/webhooks/sendWebhook";
import {
  getWebhookEndpointById,
} from "@/lib/webhooks/registry";
import type { WebhookEventEnvelope } from "@/lib/webhooks/types";

const emailJobPayloadSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email()).min(1)]),
  subject: z.string().min(1),
  html: z.string().min(1),
  text: z.string().min(1),
  replyTo: z.union([z.string(), z.array(z.string()).min(1)]).optional(),
});

const webhookDeliveryJobPayloadSchema = z.object({
  endpointId: z.string().min(1),
  payload: z
    .object({
      id: z.string().min(1),
      type: z.string().min(1),
      occurredAt: z.string().min(1),
      data: z.unknown(),
    })
    .passthrough(),
});

const cacheInvalidationPayloadSchema = z.object({
  tags: z.array(z.string().min(1)).default([]),
  paths: z.array(z.string().min(1)).default([]),
  reason: z.string().optional(),
});

function isRetryableWebhookStatus(statusCode?: number) {
  if (!statusCode) {
    return true;
  }

  return statusCode === 408 || statusCode === 409 || statusCode === 425 ||
    statusCode === 429 || statusCode >= 500;
}

const handleWebhookDelivery: BackgroundJobHandler = async (job) => {
  const payload = webhookDeliveryJobPayloadSchema.parse(job.payload);
  const endpoint = getWebhookEndpointById(payload.endpointId);

  if (!endpoint) {
    return {
      success: false,
      retryable: false,
      message: `Webhook endpoint ${payload.endpointId} is no longer configured.`,
    };
  }

  const result = await sendWebhook({
    endpoint,
    payload: payload.payload as unknown as WebhookEventEnvelope,
  });

  return {
    success: result.ok,
    retryable: !result.ok && isRetryableWebhookStatus(result.statusCode),
    message: result.message,
    metadata: {
      endpointId: result.endpointId,
      statusCode: result.statusCode,
    },
  };
};

const handleEmailDelivery: BackgroundJobHandler = async (job) => {
  const payload = emailJobPayloadSchema.parse(job.payload);
  const result = await sendEmail(payload);

  return {
    success: result.success,
    retryable: !result.success,
    message: result.success
      ? `Email delivered${result.emailId ? ` with provider id ${result.emailId}` : ""}.`
      : result.errorMessage ?? "Email delivery failed.",
    metadata: {
      emailId: result.emailId,
    },
  };
};

const handleCacheInvalidation: BackgroundJobHandler = async (job) => {
  const payload = cacheInvalidationPayloadSchema.parse(job.payload);
  const tags = revalidateCacheTags(payload.tags);
  const paths = revalidateCachePaths(payload.paths);

  return {
    success: true,
    message: `Revalidated ${tags.length} cache tags and ${paths.length} paths.`,
    metadata: {
      tags,
      paths,
      reason: payload.reason,
    },
  };
};

export const backgroundJobHandlers: Record<
  BackgroundJobKind,
  BackgroundJobHandler | undefined
> = {
  [BackgroundJobKind.WEBHOOK_DELIVERY]: handleWebhookDelivery,
  [BackgroundJobKind.EMAIL_DELIVERY]: handleEmailDelivery,
  [BackgroundJobKind.CACHE_INVALIDATION]: handleCacheInvalidation,
  [BackgroundJobKind.EXPORT_GENERATION]: undefined,
  [BackgroundJobKind.ANALYTICS_AGGREGATION]: undefined,
};
