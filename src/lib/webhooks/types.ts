import type { AppEventMap, AppEventType } from "@/lib/events/types";
import type { FavoriteItemTypeValue } from "@/types";

export interface WebhookEndpointConfig {
  id: string;
  label?: string;
  url: string;
  events: Array<AppEventType | "*">;
  secret?: string;
  headers?: Record<string, string>;
  enabled?: boolean;
}

export interface WebhookDeliveryResult {
  endpointId: string;
  ok: boolean;
  statusCode?: number;
  message: string;
}

export interface WebhookProductResource {
  itemType: FavoriteItemTypeValue;
  slug: string;
  href: string;
  title: string;
  description: string;
  image: string;
  price?: string;
  badge?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WebhookInquiryResource {
  id: string;
  type: AppEventMap["inquiry.created"]["type"];
  status: string;
  priority: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  productSlug?: string | null;
  itemType?: FavoriteItemTypeValue | null;
  operationalTags: string[];
  createdAt: string;
  lastAutomatedAt?: string | null;
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  userIntentLevel?: string | null;
  recommendationEligible?: boolean;
}

export interface WebhookSavedBuildResource {
  id: string;
  userId: string;
  vehicleSlug: string;
  vehicleTitle: string;
  vehicleImage: string;
  vehiclePrice: string;
  buildLabel?: string;
  estimatedPrice: string;
  buildHref: string;
  configureHref: string;
  selectedOptions: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookFavoriteResource {
  id: string;
  userId: string;
  itemType: FavoriteItemTypeValue;
  itemSlug: string;
  createdAt?: string;
}

export interface WebhookEventDataMap {
  "inquiry.created": {
    inquiry: WebhookInquiryResource;
  };
  "savedBuild.created": {
    savedBuild: WebhookSavedBuildResource;
  };
  "favorite.added": {
    favorite: WebhookFavoriteResource;
    item?: WebhookProductResource | null;
  };
  "adminProduct.changed": {
    action: AppEventMap["adminProduct.changed"]["action"];
    productId: string;
    previousSlug?: string;
    itemType: FavoriteItemTypeValue;
    product?: WebhookProductResource | null;
  };
}

export interface WebhookEventEnvelope<TType extends AppEventType = AppEventType> {
  id: string;
  type: TType;
  version: "v1";
  source: "tesla-inspired-app";
  occurredAt: string;
  entity: {
    type: string;
    id: string;
  };
  actor?: {
    userId?: string;
    email?: string | null;
    role?: string | null;
  };
  data: WebhookEventDataMap[TType];
}
