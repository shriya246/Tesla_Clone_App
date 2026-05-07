import "server-only";

import { AuditAction, Prisma } from "@prisma/client";
import type { UserRole } from "@prisma/client";

import { recordAuditLogSafely } from "@/lib/audit";
import { getProductHref } from "@/lib/admin-products";
import { revalidateRankingCache } from "@/lib/cache";
import { createAutomationEventLog } from "@/lib/db/automation-event-logs";
import {
  deleteProductRankingOverride,
  saveProductRankingOverride,
} from "@/lib/db/product-ranking-overrides";
import { saveRecommendationConfig } from "@/lib/db/recommendation-config";
import type {
  ProductRankingOverrideData,
  RecommendationRankingConfigValues,
} from "@/lib/recommendations/config";

interface AdminActor {
  userId: string;
  email?: string | null;
  role?: UserRole | null;
}

const baseRankingPaths = [
  "/",
  "/search",
  "/account",
  "/admin",
  "/admin/insights",
  "/admin/ranking",
  "/vehicles",
  "/energy",
  "/shop",
];

function toJsonValue(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function revalidateRankingPaths(paths: string[]) {
  revalidateRankingCache(paths);
}

async function logRankingChange(input: {
  actor: AdminActor;
  eventType: string;
  entityType: string;
  entityId: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await createAutomationEventLog({
      eventType: input.eventType,
      entityType: input.entityType,
      entityId: input.entityId,
      handler: "admin-ranking-controls",
      status: "SUCCESS",
      message: input.message,
      metadata: input.metadata ? toJsonValue(input.metadata) : undefined,
      userId: input.actor.userId,
    });
  } catch (error) {
    console.error("Failed to write ranking automation log.", error);
  }
}

export async function updateRecommendationRankingConfig(input: {
  actor: AdminActor;
  values: RecommendationRankingConfigValues;
}) {
  const config = await saveRecommendationConfig(input.values);

  revalidateRankingPaths(baseRankingPaths);
  await logRankingChange({
    actor: input.actor,
    eventType: "admin.ranking-config.updated",
    entityType: "RANKING_CONFIG",
    entityId: config?.id ?? "default",
    message:
      "Updated recommendation and search ranking weights from the admin ranking controls.",
    metadata: {
      updatedFields: Object.keys(input.values),
    },
  });
  await recordAuditLogSafely({
    action: AuditAction.RANKING_CONFIG_UPDATED,
    actor: input.actor,
    entity: {
      type: "RANKING_CONFIG",
      id: config?.id ?? "default",
    },
    message:
      "Updated recommendation and search ranking weights from the admin ranking controls.",
    metadata: {
      updatedFields: Object.keys(input.values),
    },
  });

  return config;
}

export async function upsertProductRankingOverride(input: {
  actor: AdminActor;
  values: ProductRankingOverrideData;
}) {
  const override = await saveProductRankingOverride(input.values);
  const productPath = getProductHref(input.values.itemType, input.values.itemSlug);

  revalidateRankingPaths([...baseRankingPaths, productPath]);
  await logRankingChange({
    actor: input.actor,
    eventType: "admin.product-ranking-override.updated",
    entityType: "PRODUCT_RANKING_OVERRIDE",
    entityId: `${input.values.itemType}:${input.values.itemSlug}`,
    message:
      "Updated a product-level ranking override for recommendations and discovery surfaces.",
    metadata: {
      itemType: input.values.itemType,
      itemSlug: input.values.itemSlug,
      pinned: input.values.pinned,
      boostScore: input.values.boostScore,
    },
  });
  await recordAuditLogSafely({
    action: AuditAction.PRODUCT_RANKING_OVERRIDE_UPDATED,
    actor: input.actor,
    entity: {
      type: "PRODUCT_RANKING_OVERRIDE",
      id: `${input.values.itemType}:${input.values.itemSlug}`,
    },
    message: `Updated ranking override for ${input.values.itemType}:${input.values.itemSlug}.`,
    metadata: {
      itemType: input.values.itemType,
      itemSlug: input.values.itemSlug,
      pinned: input.values.pinned,
      boostScore: input.values.boostScore,
    },
  });

  return override;
}

export async function removeProductRankingOverrideAndRefresh(input: {
  actor: AdminActor;
  itemType: ProductRankingOverrideData["itemType"];
  itemSlug: string;
}) {
  await deleteProductRankingOverride({
    itemType: input.itemType,
    itemSlug: input.itemSlug,
  });

  const productPath = getProductHref(input.itemType, input.itemSlug);
  revalidateRankingPaths([...baseRankingPaths, productPath]);
  await logRankingChange({
    actor: input.actor,
    eventType: "admin.product-ranking-override.removed",
    entityType: "PRODUCT_RANKING_OVERRIDE",
    entityId: `${input.itemType}:${input.itemSlug}`,
    message:
      "Removed a product-level ranking override and reverted that item to the shared ranking rules.",
    metadata: {
      itemType: input.itemType,
      itemSlug: input.itemSlug,
    },
  });
  await recordAuditLogSafely({
    action: AuditAction.PRODUCT_RANKING_OVERRIDE_REMOVED,
    actor: input.actor,
    entity: {
      type: "PRODUCT_RANKING_OVERRIDE",
      id: `${input.itemType}:${input.itemSlug}`,
    },
    message: `Removed ranking override for ${input.itemType}:${input.itemSlug}.`,
    metadata: {
      itemType: input.itemType,
      itemSlug: input.itemSlug,
    },
  });
}
