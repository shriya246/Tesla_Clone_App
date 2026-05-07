import "server-only";

import { getProductHref } from "@/lib/admin-products";
import { getInquiryByIdForIntegration } from "@/lib/db/inquiries";
import { getSavedBuildByIdForIntegration } from "@/lib/db/saved-builds";
import { getEnergyProductBySlug } from "@/lib/db/energy";
import { getShopProductBySlug } from "@/lib/db/shop";
import { getVehicleBySlug } from "@/lib/db/vehicles";
import type { AppEvent, AppEventType } from "@/lib/events";
import type {
  WebhookEventDataMap,
  WebhookEventEnvelope,
  WebhookFavoriteResource,
  WebhookProductResource,
  WebhookSavedBuildResource,
} from "@/lib/webhooks/types";

function toIsoString(value?: Date | null) {
  return value ? value.toISOString() : undefined;
}

async function getProductResource(input: {
  itemType: "VEHICLE" | "ENERGY_PRODUCT" | "SHOP_PRODUCT";
  slug: string;
}): Promise<WebhookProductResource | null> {
  if (input.itemType === "VEHICLE") {
    const vehicle = await getVehicleBySlug(input.slug);

    if (!vehicle) {
      return null;
    }

    return {
      itemType: "VEHICLE",
      slug: vehicle.slug,
      href: `/vehicles/${vehicle.slug}`,
      title: vehicle.title,
      description: vehicle.subtitle,
      image: vehicle.image,
      price: vehicle.price,
      createdAt: toIsoString(vehicle.createdAt),
      updatedAt: toIsoString(vehicle.updatedAt),
    };
  }

  if (input.itemType === "ENERGY_PRODUCT") {
    const product = await getEnergyProductBySlug(input.slug);

    if (!product) {
      return null;
    }

    return {
      itemType: "ENERGY_PRODUCT",
      slug: product.slug,
      href: `/energy/${product.slug}`,
      title: product.title,
      description: product.description,
      image: product.image,
      createdAt: toIsoString(product.createdAt),
      updatedAt: toIsoString(product.updatedAt),
    };
  }

  const product = await getShopProductBySlug(input.slug);

  if (!product) {
    return null;
  }

  return {
    itemType: "SHOP_PRODUCT",
    slug: product.slug,
    href: `/shop/${product.slug}`,
    title: product.title,
    description: product.description,
    image: product.image,
    price: product.price,
    badge: product.badge,
    createdAt: toIsoString(product.createdAt),
    updatedAt: toIsoString(product.updatedAt),
  };
}

async function buildInquiryData(
  event: AppEvent<"inquiry.created">,
): Promise<WebhookEventDataMap["inquiry.created"]> {
  const inquiry = await getInquiryByIdForIntegration(event.payload.inquiryId);

  if (!inquiry) {
    return {
      inquiry: {
        id: event.payload.inquiryId,
        type: event.payload.type,
        status: "UNKNOWN",
        priority: "UNKNOWN",
        name: "",
        email: event.payload.email,
        phone: event.payload.phone,
        message: event.payload.message,
        productSlug: event.payload.productSlug,
        itemType: event.payload.itemType,
        operationalTags: [],
        createdAt: event.occurredAt.toISOString(),
        userId: event.payload.userId,
      },
    };
  }

  return {
    inquiry: {
      id: inquiry.id,
      type: inquiry.type,
      status: inquiry.status,
      priority: inquiry.priority,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      message: inquiry.message,
      productSlug: inquiry.productSlug,
      itemType: inquiry.itemType,
      operationalTags: inquiry.operationalTags,
      createdAt: inquiry.createdAt.toISOString(),
      lastAutomatedAt: toIsoString(inquiry.lastAutomatedAt) ?? null,
      userId: inquiry.userId,
      userName: inquiry.user?.name,
      userEmail: inquiry.user?.email,
      userIntentLevel: inquiry.user?.intentLevel,
      recommendationEligible: inquiry.user?.recommendationEligible ?? false,
    },
  };
}

async function buildSavedBuildData(
  event: AppEvent<"savedBuild.created">,
): Promise<WebhookEventDataMap["savedBuild.created"]> {
  const savedBuild = await getSavedBuildByIdForIntegration(event.payload.buildId);

  if (!savedBuild) {
    return {
      savedBuild: {
        id: event.payload.buildId,
        userId: event.payload.userId,
        vehicleSlug: event.payload.vehicleSlug,
        vehicleTitle: "",
        vehicleImage: "",
        vehiclePrice: "",
        estimatedPrice: "",
        buildHref: event.payload.buildHref,
        configureHref: event.payload.configureHref,
        selectedOptions: {},
        createdAt: event.occurredAt.toISOString(),
        updatedAt: event.occurredAt.toISOString(),
      },
    };
  }

  const resource: WebhookSavedBuildResource = {
    id: savedBuild.id,
    userId: savedBuild.userId,
    vehicleSlug: savedBuild.vehicleSlug,
    vehicleTitle: savedBuild.vehicleTitle,
    vehicleImage: savedBuild.vehicleImage,
    vehiclePrice: savedBuild.vehiclePrice,
    buildLabel: savedBuild.buildLabel,
    estimatedPrice: savedBuild.estimatedPrice,
    buildHref: savedBuild.buildHref,
    configureHref: savedBuild.configureHref,
    selectedOptions: savedBuild.selectedOptions,
    createdAt: savedBuild.createdAt.toISOString(),
    updatedAt: savedBuild.updatedAt.toISOString(),
  };

  return {
    savedBuild: resource,
  };
}

async function buildFavoriteData(
  event: AppEvent<"favorite.added">,
): Promise<WebhookEventDataMap["favorite.added"]> {
  const favorite: WebhookFavoriteResource = {
    id: event.payload.favoriteId,
    userId: event.payload.userId,
    itemType: event.payload.itemType,
    itemSlug: event.payload.itemSlug,
  };
  const item = await getProductResource({
    itemType: event.payload.itemType,
    slug: event.payload.itemSlug,
  });

  return {
    favorite,
    item,
  };
}

async function buildAdminProductChangedData(
  event: AppEvent<"adminProduct.changed">,
): Promise<WebhookEventDataMap["adminProduct.changed"]> {
  const product =
    event.payload.action === "deleted"
      ? null
      : await getProductResource({
          itemType: event.payload.itemType,
          slug: event.payload.slug,
        });

  return {
    action: event.payload.action,
    productId: event.payload.productId,
    previousSlug: event.payload.previousSlug,
    itemType: event.payload.itemType,
    product:
      product ??
      (event.payload.action === "deleted"
        ? {
            itemType: event.payload.itemType,
            slug: event.payload.slug,
            href: getProductHref(event.payload.itemType, event.payload.slug),
            title: event.payload.slug,
            description: "Product record is no longer available after deletion.",
            image: "",
          }
        : null),
  };
}

export async function buildWebhookEventData<TType extends AppEventType>(
  event: AppEvent<TType>,
): Promise<WebhookEventDataMap[TType]> {
  switch (event.type) {
    case "inquiry.created":
      return (await buildInquiryData(
        event as AppEvent<"inquiry.created">,
      )) as WebhookEventDataMap[TType];
    case "savedBuild.created":
      return (await buildSavedBuildData(
        event as AppEvent<"savedBuild.created">,
      )) as WebhookEventDataMap[TType];
    case "favorite.added":
      return (await buildFavoriteData(
        event as AppEvent<"favorite.added">,
      )) as WebhookEventDataMap[TType];
    case "adminProduct.changed":
      return (await buildAdminProductChangedData(
        event as AppEvent<"adminProduct.changed">,
      )) as WebhookEventDataMap[TType];
    default:
      throw new Error(`Unsupported webhook event type: ${event.type}`);
  }
}

export async function buildWebhookEventEnvelope<TType extends AppEventType>(
  event: AppEvent<TType>,
): Promise<WebhookEventEnvelope<TType>> {
  return {
    id: event.id,
    type: event.type,
    version: "v1",
    source: "tesla-inspired-app",
    occurredAt: event.occurredAt.toISOString(),
    entity: {
      type: event.entity.type,
      id: event.entity.id,
    },
    actor: event.actor
      ? {
          userId: event.actor.userId,
          email: event.actor.email,
          role: event.actor.role,
        }
      : undefined,
    data: await buildWebhookEventData(event),
  };
}
