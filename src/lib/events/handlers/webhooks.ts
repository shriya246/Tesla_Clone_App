import type { AppEventType, EventHandler } from "@/lib/events/types";
import { dispatchEventWebhooks } from "@/lib/webhooks";

function createWebhookHandler<TType extends AppEventType>(): EventHandler<TType> {
  return {
    id: "deliver-configured-webhooks",
    handle: (event) => dispatchEventWebhooks(event),
  };
}

export const inquiryWebhookHandlers: EventHandler<"inquiry.created">[] = [
  createWebhookHandler<"inquiry.created">(),
];

export const savedBuildWebhookHandlers: EventHandler<"savedBuild.created">[] = [
  createWebhookHandler<"savedBuild.created">(),
];

export const favoriteWebhookHandlers: EventHandler<"favorite.added">[] = [
  createWebhookHandler<"favorite.added">(),
];

export const adminProductWebhookHandlers: EventHandler<"adminProduct.changed">[] = [
  createWebhookHandler<"adminProduct.changed">(),
];
