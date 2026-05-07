import "server-only";

import { z } from "zod";

import { env } from "@/lib/env";
import { appEventTypes } from "@/lib/events/types";
import type { AppEventType } from "@/lib/events";
import type { WebhookEndpointConfig } from "@/lib/webhooks/types";

const webhookEndpointSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Webhook endpoint ids are required.")
    .max(80, "Webhook endpoint ids are too long."),
  label: z.string().trim().max(120).optional(),
  url: z.string().trim().url("Webhook endpoint URLs must be valid URLs."),
  events: z
    .array(z.union([z.enum(appEventTypes), z.literal("*")]))
    .min(1, "At least one webhook event must be configured."),
  secret: z.string().trim().min(1).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  enabled: z.boolean().optional(),
});

const webhookRegistrySchema = z.array(webhookEndpointSchema);

export function getWebhookEndpointRegistry(): WebhookEndpointConfig[] {
  if (!env.WEBHOOK_ENDPOINTS_JSON) {
    return [];
  }

  try {
    const parsed = JSON.parse(env.WEBHOOK_ENDPOINTS_JSON);
    const endpoints = webhookRegistrySchema.parse(parsed);

    return endpoints.filter((endpoint) => endpoint.enabled !== false);
  } catch (error) {
    console.error("Failed to parse WEBHOOK_ENDPOINTS_JSON.", error);

    return [];
  }
}

export function getWebhookEndpointsForEvent(eventType: AppEventType) {
  return getWebhookEndpointRegistry().filter((endpoint) =>
    endpoint.events.includes("*") || endpoint.events.includes(eventType),
  );
}

export function getWebhookEndpointById(endpointId: string) {
  return getWebhookEndpointRegistry().find((endpoint) => endpoint.id === endpointId);
}

export function getWebhookRegistrySummary() {
  return getWebhookEndpointRegistry().map((endpoint) => ({
    id: endpoint.id,
    label: endpoint.label,
    url: endpoint.url,
    events: endpoint.events,
    enabled: endpoint.enabled !== false,
    hasSecret: Boolean(endpoint.secret),
    headerCount: Object.keys(endpoint.headers ?? {}).length,
  }));
}
