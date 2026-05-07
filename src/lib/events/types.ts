import type { UserRole } from "@prisma/client";

import type {
  AdminProductCategory,
  AutomationRunStatusValue,
  FavoriteItemTypeValue,
  InquiryItemTypeValue,
  InquiryTypeValue,
} from "@/types";

export interface EventActor {
  userId?: string;
  email?: string | null;
  role?: UserRole | null;
}

export type EventEntityType = "INQUIRY" | "SAVED_BUILD" | "FAVORITE" | "PRODUCT";
export const appEventTypes = [
  "inquiry.created",
  "savedBuild.created",
  "favorite.added",
  "adminProduct.changed",
] as const;

export interface EventEntityReference {
  type: EventEntityType;
  id: string;
}

export interface AppEventMap {
  "inquiry.created": {
    inquiryId: string;
    userId?: string;
    type: InquiryTypeValue;
    itemType?: InquiryItemTypeValue;
    productSlug?: string;
    email: string;
    phone?: string;
    message: string;
  };
  "savedBuild.created": {
    buildId: string;
    userId: string;
    vehicleSlug: string;
    buildHref: string;
    configureHref: string;
  };
  "favorite.added": {
    favoriteId: string;
    userId: string;
    itemType: FavoriteItemTypeValue;
    itemSlug: string;
  };
  "adminProduct.changed": {
    action: "created" | "updated" | "deleted";
    adminUserId: string;
    category: AdminProductCategory;
    itemType: FavoriteItemTypeValue;
    productId: string;
    slug: string;
    previousSlug?: string;
  };
}

export type AppEventType = (typeof appEventTypes)[number];

export interface AppEvent<TType extends AppEventType = AppEventType> {
  id: string;
  type: TType;
  occurredAt: Date;
  actor?: EventActor;
  entity: EventEntityReference;
  payload: AppEventMap[TType];
}

export interface EventHandlerResult {
  status?: AutomationRunStatusValue;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface EventHandler<TType extends AppEventType = AppEventType> {
  id: string;
  handle: (event: AppEvent<TType>) => Promise<EventHandlerResult | void>;
}

export interface PublishEventInput<TType extends AppEventType> {
  type: TType;
  actor?: EventActor;
  entity: EventEntityReference;
  payload: AppEventMap[TType];
}

export interface PublishEventLogEntry {
  handler: string;
  status: AutomationRunStatusValue;
  message: string;
}

export interface PublishEventResult {
  eventId: string;
  type: AppEventType;
  handledCount: number;
  failureCount: number;
  logs: PublishEventLogEntry[];
}
