import "server-only";

import { Prisma } from "@prisma/client";

import {
  getAdminProductCategoryConfig,
  getAdminProductCategoryFromItemType,
  type AdminProductCategoryConfig,
} from "@/lib/admin-products";
import { prisma } from "@/lib/prisma";
import {
  formatJsonInput,
  getAdminProductFormDefaults,
  type AdminProductFormValues,
  type PersistedAdminProductInput,
} from "@/lib/validations/admin-product";

function toJson<T>(value: T): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export class AdminProductNotFoundError extends Error {
  constructor() {
    super("Product not found.");
  }
}

function getVehicleFormData(record: {
  title: string;
  slug: string;
  image: string;
  subtitle: string;
  description: string;
  price: string;
  primaryButton: string;
  secondaryButton: string;
  specs: Prisma.JsonValue;
  highlights: Prisma.JsonValue;
}): AdminProductFormValues {
  return {
    itemType: "VEHICLE",
    title: record.title,
    slug: record.slug,
    image: record.image,
    subtitle: record.subtitle,
    description: record.description,
    longDescription: "",
    price: record.price,
    primaryButton: record.primaryButton,
    secondaryButton: record.secondaryButton,
    badge: "",
    specsInput: formatJsonInput(record.specs),
    highlightsInput: formatJsonInput(record.highlights),
    detailFeaturesInput: "[]",
  };
}

function getEnergyFormData(record: {
  title: string;
  slug: string;
  image: string;
  description: string;
  longDescription: string;
  primaryButton: string;
  secondaryButton: string;
  highlights: Prisma.JsonValue;
  detailFeatures: Prisma.JsonValue;
}): AdminProductFormValues {
  return {
    itemType: "ENERGY_PRODUCT",
    title: record.title,
    slug: record.slug,
    image: record.image,
    subtitle: "",
    description: record.description,
    longDescription: record.longDescription,
    price: "",
    primaryButton: record.primaryButton,
    secondaryButton: record.secondaryButton,
    badge: "",
    specsInput: "[]",
    highlightsInput: formatJsonInput(record.highlights),
    detailFeaturesInput: formatJsonInput(record.detailFeatures),
  };
}

function getShopFormData(record: {
  title: string;
  slug: string;
  image: string;
  description: string;
  longDescription: string;
  price: string;
  primaryButton: string;
  secondaryButton: string;
  badge: string | null;
  highlights: Prisma.JsonValue;
  detailFeatures: Prisma.JsonValue | null;
}): AdminProductFormValues {
  return {
    itemType: "SHOP_PRODUCT",
    title: record.title,
    slug: record.slug,
    image: record.image,
    subtitle: "",
    description: record.description,
    longDescription: record.longDescription,
    price: record.price,
    primaryButton: record.primaryButton,
    secondaryButton: record.secondaryButton,
    badge: record.badge ?? "",
    specsInput: "[]",
    highlightsInput: formatJsonInput(record.highlights),
    detailFeaturesInput: formatJsonInput(record.detailFeatures ?? []),
  };
}

export function getAdminProductCreateDefaults(
  category: AdminProductCategoryConfig["category"],
) {
  return getAdminProductFormDefaults(
    getAdminProductCategoryConfig(category).itemType,
  );
}

export async function getAdminProductEditorData(
  category: AdminProductCategoryConfig["category"],
  id: string,
): Promise<AdminProductFormValues | null> {
  switch (category) {
    case "vehicles": {
      const record = await prisma.vehicle.findUnique({
        where: { id },
        select: {
          title: true,
          slug: true,
          image: true,
          subtitle: true,
          description: true,
          price: true,
          primaryButton: true,
          secondaryButton: true,
          specs: true,
          highlights: true,
        },
      });

      return record ? getVehicleFormData(record) : null;
    }
    case "energy": {
      const record = await prisma.energyProduct.findUnique({
        where: { id },
        select: {
          title: true,
          slug: true,
          image: true,
          description: true,
          longDescription: true,
          primaryButton: true,
          secondaryButton: true,
          highlights: true,
          detailFeatures: true,
        },
      });

      return record ? getEnergyFormData(record) : null;
    }
    case "shop": {
      const record = await prisma.shopProduct.findUnique({
        where: { id },
        select: {
          title: true,
          slug: true,
          image: true,
          description: true,
          longDescription: true,
          price: true,
          primaryButton: true,
          secondaryButton: true,
          badge: true,
          highlights: true,
          detailFeatures: true,
        },
      });

      return record ? getShopFormData(record) : null;
    }
  }
}

export async function createAdminProduct(input: PersistedAdminProductInput) {
  switch (input.itemType) {
    case "VEHICLE": {
      const record = await prisma.vehicle.create({
        data: {
          slug: input.slug,
          title: input.title,
          subtitle: input.subtitle ?? "",
          description: input.description,
          price: input.price ?? "",
          image: input.image,
          primaryButton: input.primaryButton,
          secondaryButton: input.secondaryButton,
          specs: toJson(input.specs),
          highlights: toJson(input.highlights),
        },
        select: {
          id: true,
          slug: true,
        },
      });

      return {
        id: record.id,
        slug: record.slug,
        category: getAdminProductCategoryFromItemType(input.itemType),
        itemType: input.itemType,
      };
    }
    case "ENERGY_PRODUCT": {
      const record = await prisma.energyProduct.create({
        data: {
          slug: input.slug,
          title: input.title,
          description: input.description,
          longDescription: input.longDescription ?? "",
          image: input.image,
          primaryButton: input.primaryButton,
          secondaryButton: input.secondaryButton,
          highlights: toJson(input.highlights),
          detailFeatures: toJson(input.detailFeatures),
        },
        select: {
          id: true,
          slug: true,
        },
      });

      return {
        id: record.id,
        slug: record.slug,
        category: getAdminProductCategoryFromItemType(input.itemType),
        itemType: input.itemType,
      };
    }
    case "SHOP_PRODUCT": {
      const record = await prisma.shopProduct.create({
        data: {
          slug: input.slug,
          title: input.title,
          description: input.description,
          longDescription: input.longDescription ?? "",
          image: input.image,
          price: input.price ?? "",
          primaryButton: input.primaryButton,
          secondaryButton: input.secondaryButton,
          badge: input.badge?.trim() ? input.badge.trim() : null,
          highlights: toJson(input.highlights),
          detailFeatures: toJson(input.detailFeatures),
        },
        select: {
          id: true,
          slug: true,
        },
      });

      return {
        id: record.id,
        slug: record.slug,
        category: getAdminProductCategoryFromItemType(input.itemType),
        itemType: input.itemType,
      };
    }
  }
}

export async function updateAdminProduct(
  category: AdminProductCategoryConfig["category"],
  id: string,
  input: PersistedAdminProductInput,
) {
  switch (category) {
    case "vehicles": {
      if (input.itemType !== "VEHICLE") {
        throw new Error("Vehicle payload is required for vehicle updates.");
      }

      const record = await prisma.vehicle.update({
        where: { id },
        data: {
          slug: input.slug,
          title: input.title,
          subtitle: input.subtitle ?? "",
          description: input.description,
          price: input.price ?? "",
          image: input.image,
          primaryButton: input.primaryButton,
          secondaryButton: input.secondaryButton,
          specs: toJson(input.specs),
          highlights: toJson(input.highlights),
        },
        select: {
          id: true,
          slug: true,
        },
      });

      return {
        id: record.id,
        slug: record.slug,
        category,
        itemType: input.itemType,
      };
    }
    case "energy": {
      if (input.itemType !== "ENERGY_PRODUCT") {
        throw new Error("Energy payload is required for energy updates.");
      }

      const record = await prisma.energyProduct.update({
        where: { id },
        data: {
          slug: input.slug,
          title: input.title,
          description: input.description,
          longDescription: input.longDescription ?? "",
          image: input.image,
          primaryButton: input.primaryButton,
          secondaryButton: input.secondaryButton,
          highlights: toJson(input.highlights),
          detailFeatures: toJson(input.detailFeatures),
        },
        select: {
          id: true,
          slug: true,
        },
      });

      return {
        id: record.id,
        slug: record.slug,
        category,
        itemType: input.itemType,
      };
    }
    case "shop": {
      if (input.itemType !== "SHOP_PRODUCT") {
        throw new Error("Shop payload is required for shop updates.");
      }

      const record = await prisma.shopProduct.update({
        where: { id },
        data: {
          slug: input.slug,
          title: input.title,
          description: input.description,
          longDescription: input.longDescription ?? "",
          image: input.image,
          price: input.price ?? "",
          primaryButton: input.primaryButton,
          secondaryButton: input.secondaryButton,
          badge: input.badge?.trim() ? input.badge.trim() : null,
          highlights: toJson(input.highlights),
          detailFeatures: toJson(input.detailFeatures),
        },
        select: {
          id: true,
          slug: true,
        },
      });

      return {
        id: record.id,
        slug: record.slug,
        category,
        itemType: input.itemType,
      };
    }
  }
}

export async function deleteAdminProduct(
  category: AdminProductCategoryConfig["category"],
  id: string,
) {
  switch (category) {
    case "vehicles": {
      const record = await prisma.vehicle.delete({
        where: { id },
        select: {
          id: true,
          slug: true,
        },
      });

      return {
        id: record.id,
        slug: record.slug,
        category,
        itemType: "VEHICLE" as const,
      };
    }
    case "energy": {
      const record = await prisma.energyProduct.delete({
        where: { id },
        select: {
          id: true,
          slug: true,
        },
      });

      return {
        id: record.id,
        slug: record.slug,
        category,
        itemType: "ENERGY_PRODUCT" as const,
      };
    }
    case "shop": {
      const record = await prisma.shopProduct.delete({
        where: { id },
        select: {
          id: true,
          slug: true,
        },
      });

      return {
        id: record.id,
        slug: record.slug,
        category,
        itemType: "SHOP_PRODUCT" as const,
      };
    }
  }
}
