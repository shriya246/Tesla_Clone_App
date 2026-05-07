import "server-only";

import type { WebhookEventEnvelope } from "@/lib/webhooks/types";
import { createWebhookSignature } from "@/lib/webhooks/signature";
import type {
  WebhookDeliveryResult,
  WebhookEndpointConfig,
} from "@/lib/webhooks/types";

const WEBHOOK_TIMEOUT_MS = 8000;

export async function sendWebhook(input: {
  endpoint: WebhookEndpointConfig;
  payload: WebhookEventEnvelope;
}): Promise<WebhookDeliveryResult> {
  const timestamp = Date.now().toString();
  const body = JSON.stringify(input.payload);
  const headers = new Headers({
    "content-type": "application/json",
    "user-agent": "tesla-inspired-webhooks/1.0",
    "x-tesla-inspired-delivery": input.payload.id,
    "x-tesla-inspired-event": input.payload.type,
    "x-tesla-inspired-timestamp": timestamp,
  });

  for (const [headerName, headerValue] of Object.entries(
    input.endpoint.headers ?? {},
  )) {
    headers.set(headerName, headerValue);
  }

  if (input.endpoint.secret) {
    const signature = createWebhookSignature({
      secret: input.endpoint.secret,
      timestamp,
      body,
    });

    headers.set("x-tesla-inspired-signature", signature);
  }

  try {
    const response = await fetch(input.endpoint.url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });

    if (response.ok) {
      return {
        endpointId: input.endpoint.id,
        ok: true,
        statusCode: response.status,
        message: `Delivered ${input.payload.type} to ${input.endpoint.id}.`,
      };
    }

    const responseBody = await response.text().catch(() => "");
    const trimmedBody = responseBody.trim();

    return {
      endpointId: input.endpoint.id,
      ok: false,
      statusCode: response.status,
      message: trimmedBody
        ? `Webhook endpoint ${input.endpoint.id} responded with ${response.status}: ${trimmedBody.slice(0, 180)}`
        : `Webhook endpoint ${input.endpoint.id} responded with ${response.status}.`,
    };
  } catch (error) {
    return {
      endpointId: input.endpoint.id,
      ok: false,
      message:
        error instanceof Error
          ? `Webhook endpoint ${input.endpoint.id} failed: ${error.message}`
          : `Webhook endpoint ${input.endpoint.id} failed unexpectedly.`,
    };
  }
}
