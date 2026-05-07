import "server-only";

import type { UserRole } from "@prisma/client";
import { z } from "zod";

import { getAdminProductCategoryFromItemType } from "@/lib/admin-products";
import { getAdminProductReferenceBySlug } from "@/lib/db/admin-products";
import {
  createAdminProductWithAutomation,
  updateAdminProductWithAutomation,
} from "@/lib/services/admin-products";
import type { PersistedAdminProductInput } from "@/lib/validations/admin-product";

const detailSpecSchema = z.object({
  label: z.string().trim().min(1),
  value: z.string().trim().min(1),
});

const detailFeatureSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

const baseProductImportSchema = z.object({
  itemType: z.enum(["VEHICLE", "ENERGY_PRODUCT", "SHOP_PRODUCT"]),
  title: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  image: z.string().trim().min(1),
  primaryButton: z.string().trim().min(2).max(80),
  secondaryButton: z.string().trim().min(2).max(80),
});

const vehicleImportSchema = baseProductImportSchema.extend({
  itemType: z.literal("VEHICLE"),
  subtitle: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1).max(5000),
  price: z.string().trim().min(1).max(120),
  specs: z.array(detailSpecSchema),
  highlights: z.array(detailFeatureSchema),
});

const energyImportSchema = baseProductImportSchema.extend({
  itemType: z.literal("ENERGY_PRODUCT"),
  description: z.string().trim().min(1).max(5000),
  longDescription: z.string().trim().min(1).max(10000),
  highlights: z.array(detailFeatureSchema),
  detailFeatures: z.array(detailFeatureSchema),
});

const shopImportSchema = baseProductImportSchema.extend({
  itemType: z.literal("SHOP_PRODUCT"),
  description: z.string().trim().min(1).max(5000),
  longDescription: z.string().trim().min(1).max(10000),
  price: z.string().trim().min(1).max(120),
  badge: z.string().trim().max(80).optional(),
  highlights: z.array(detailFeatureSchema),
  detailFeatures: z.array(detailSpecSchema),
});

export const productImportItemSchema = z.discriminatedUnion("itemType", [
  vehicleImportSchema,
  energyImportSchema,
  shopImportSchema,
]);

export const productImportPayloadSchema = z.object({
  mode: z.enum(["validate", "upsert"]).default("validate"),
  items: z.array(productImportItemSchema).min(1).max(100),
});

export type ProductImportItem = z.infer<typeof productImportItemSchema>;
export type ProductImportPayload = z.infer<typeof productImportPayloadSchema>;

interface AdminImportActor {
  userId: string;
  email?: string | null;
  role?: UserRole | null;
}

export interface ProductImportPreviewItem {
  index: number;
  itemType: ProductImportItem["itemType"];
  slug: string;
  action: "create" | "update";
}

export interface ProductImportApplyItem extends ProductImportPreviewItem {
  status: "applied" | "failed";
  id?: string;
  category?: string;
  error?: string;
}

function toPersistedAdminProductInput(
  item: ProductImportItem,
): PersistedAdminProductInput {
  if (item.itemType === "VEHICLE") {
    return {
      itemType: item.itemType,
      title: item.title,
      slug: item.slug,
      image: item.image,
      subtitle: item.subtitle,
      description: item.description,
      price: item.price,
      primaryButton: item.primaryButton,
      secondaryButton: item.secondaryButton,
      specs: item.specs,
      highlights: item.highlights,
      detailFeatures: [],
    };
  }

  if (item.itemType === "ENERGY_PRODUCT") {
    return {
      itemType: item.itemType,
      title: item.title,
      slug: item.slug,
      image: item.image,
      description: item.description,
      longDescription: item.longDescription,
      primaryButton: item.primaryButton,
      secondaryButton: item.secondaryButton,
      specs: [],
      highlights: item.highlights,
      detailFeatures: item.detailFeatures,
    };
  }

  return {
    itemType: item.itemType,
    title: item.title,
    slug: item.slug,
    image: item.image,
    description: item.description,
    longDescription: item.longDescription,
    price: item.price,
    primaryButton: item.primaryButton,
    secondaryButton: item.secondaryButton,
    badge: item.badge,
    specs: [],
    highlights: item.highlights,
    detailFeatures: item.detailFeatures,
  };
}

export function findDuplicateProductImportKeys(items: ProductImportItem[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    const key = `${item.itemType}:${item.slug}`;

    if (seen.has(key)) {
      duplicates.add(key);
      continue;
    }

    seen.add(key);
  }

  return [...duplicates];
}

export async function previewProductImport(items: ProductImportItem[]) {
  const previews: ProductImportPreviewItem[] = [];

  for (const [index, item] of items.entries()) {
    const existing = await getAdminProductReferenceBySlug(item.itemType, item.slug);

    previews.push({
      index,
      itemType: item.itemType,
      slug: item.slug,
      action: existing ? "update" : "create",
    });
  }

  return previews;
}

export async function applyProductImport(input: {
  actor: AdminImportActor;
  items: ProductImportItem[];
}) {
  const results: ProductImportApplyItem[] = [];

  for (const [index, item] of input.items.entries()) {
    const existing = await getAdminProductReferenceBySlug(item.itemType, item.slug);
    const action = existing ? "update" : "create";

    try {
      const category = getAdminProductCategoryFromItemType(item.itemType);
      const persistedInput = toPersistedAdminProductInput(item);

      if (existing) {
        const updated = await updateAdminProductWithAutomation({
          actor: input.actor,
          category,
          id: existing.id,
          input: persistedInput,
        });

        results.push({
          index,
          itemType: item.itemType,
          slug: item.slug,
          action,
          status: "applied",
          id: updated.id,
          category: updated.category,
        });
      } else {
        const created = await createAdminProductWithAutomation({
          actor: input.actor,
          category,
          input: persistedInput,
        });

        results.push({
          index,
          itemType: item.itemType,
          slug: item.slug,
          action,
          status: "applied",
          id: created.id,
          category: created.category,
        });
      }
    } catch (error) {
        results.push({
          index,
          itemType: item.itemType,
          slug: item.slug,
          action,
          status: "failed",
          error:
            error instanceof Error
            ? error.message
            : "Product import failed unexpectedly.",
      });
    }
  }

  return results;
}
