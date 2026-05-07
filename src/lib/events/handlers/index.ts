import type { AppEventType, EventHandler } from "@/lib/events/types";
import { adminProductChangedHandlers } from "@/lib/events/handlers/admin-products";
import { favoriteAddedHandlers } from "@/lib/events/handlers/favorites";
import { inquiryCreatedHandlers } from "@/lib/events/handlers/inquiry";
import { savedBuildCreatedHandlers } from "@/lib/events/handlers/saved-builds";
import {
  adminProductWebhookHandlers,
  favoriteWebhookHandlers,
  inquiryWebhookHandlers,
  savedBuildWebhookHandlers,
} from "@/lib/events/handlers/webhooks";

export const eventHandlerRegistry: {
  [K in AppEventType]: EventHandler<K>[];
} = {
  "inquiry.created": [...inquiryCreatedHandlers, ...inquiryWebhookHandlers],
  "savedBuild.created": [...savedBuildCreatedHandlers, ...savedBuildWebhookHandlers],
  "favorite.added": [...favoriteAddedHandlers, ...favoriteWebhookHandlers],
  "adminProduct.changed": [
    ...adminProductChangedHandlers,
    ...adminProductWebhookHandlers,
  ],
};
