import "server-only";

import type { AppEvent } from "@/lib/events";
import { processBackgroundJobById } from "@/lib/jobs";
import { enqueueWebhookDeliveryJob } from "@/lib/jobs/queue";
import { buildWebhookEventEnvelope } from "@/lib/webhooks/payloads";
import { getWebhookEndpointsForEvent } from "@/lib/webhooks/registry";
import { sendWebhook } from "@/lib/webhooks/sendWebhook";
import type { WebhookDeliveryResult } from "@/lib/webhooks/types";

function summarizeDeliveries(input: {
  eventType: string;
  endpointCount: number;
  deliveries: WebhookDeliveryResult[];
  deliveryMode: "queued" | "direct-fallback";
}) {
  const successCount = input.deliveries.filter((delivery) => delivery.ok).length;
  const failureCount = input.deliveries.length - successCount;

  return {
    status:
      failureCount === 0
        ? ("SUCCESS" as const)
        : successCount > 0
          ? ("PARTIAL_FAILURE" as const)
          : ("FAILED" as const),
    message:
      failureCount === 0
        ? `Delivered ${input.eventType} to ${successCount} webhook endpoint${successCount === 1 ? "" : "s"}.`
        : `Delivered ${input.eventType} to ${successCount} webhook endpoint${successCount === 1 ? "" : "s"} with ${failureCount} failure${failureCount === 1 ? "" : "s"} queued for retry when possible.`,
    metadata: {
      endpointCount: input.endpointCount,
      successCount,
      failureCount,
      deliveryMode: input.deliveryMode,
      deliveries: input.deliveries,
    },
  };
}

export async function dispatchEventWebhooks(event: AppEvent) {
  const endpoints = getWebhookEndpointsForEvent(event.type);

  if (endpoints.length === 0) {
    return {
      status: "SUCCESS" as const,
      message: `No webhook endpoints are configured for ${event.type}.`,
      metadata: {
        endpointCount: 0,
      },
    };
  }

  const payload = await buildWebhookEventEnvelope(event);

  try {
    const jobs = await Promise.all(
      endpoints.map((endpoint) =>
        enqueueWebhookDeliveryJob({
          endpointId: endpoint.id,
          payload,
          dedupeKey: `webhook:${payload.id}:${endpoint.id}`,
        }),
      ),
    );
    const processedJobs = await Promise.all(
      jobs.map((job) => processBackgroundJobById(job.id)),
    );
    const deliveries: WebhookDeliveryResult[] = endpoints.map((endpoint, index) => {
      const job = jobs[index];
      const processedJob = processedJobs[index];
      const alreadyDelivered = job.status === "SUCCEEDED";
      const delivered = alreadyDelivered || processedJob.status === "SUCCEEDED";

      return {
        endpointId: endpoint.id,
        ok: delivered,
        message: delivered
          ? `Delivered ${payload.type} to ${endpoint.id}.`
          : processedJob.message,
      };
    });

    return summarizeDeliveries({
      eventType: event.type,
      endpointCount: endpoints.length,
      deliveries,
      deliveryMode: "queued",
    });
  } catch (error) {
    console.error(
      "Failed to enqueue webhook deliveries. Falling back to direct delivery.",
      error,
    );

    const deliveries = await Promise.all(
      endpoints.map((endpoint) =>
        sendWebhook({
          endpoint,
          payload,
        }),
      ),
    );

    return summarizeDeliveries({
      eventType: event.type,
      endpointCount: endpoints.length,
      deliveries,
      deliveryMode: "direct-fallback",
    });
  }
}
