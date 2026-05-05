import "server-only";

import type {
  EnergyProduct as EnergyProductRecord,
  Prisma,
  ShopProduct as ShopProductRecord,
  Vehicle as VehicleRecord,
} from "@prisma/client";

import type {
  DetailFeature,
  DetailSpec,
  EnergyProductData,
  ShopProductData,
  VehicleData,
} from "@/types";
import { normalizeMediaUrl } from "@/lib/media";

function isJsonObject(
  value: Prisma.JsonValue,
): value is Record<string, Prisma.JsonValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getJsonString(value: Prisma.JsonValue | undefined) {
  return typeof value === "string" ? value : undefined;
}

function mapDetailSpecs(value: Prisma.JsonValue | null | undefined): DetailSpec[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!isJsonObject(entry)) {
      return [];
    }

    const label = getJsonString(entry.label);
    const mappedValue = getJsonString(entry.value);

    if (!label || !mappedValue) {
      return [];
    }

    return [
      {
        label,
        value: mappedValue,
      },
    ];
  });
}

function mapDetailFeatures(
  value: Prisma.JsonValue | null | undefined,
): DetailFeature[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!isJsonObject(entry)) {
      return [];
    }

    const title = getJsonString(entry.title);
    const description = getJsonString(entry.description);

    if (!title || !description) {
      return [];
    }

    return [
      {
        title,
        description,
      },
    ];
  });
}

export function mapVehicleRecord(record: VehicleRecord): VehicleData {
  return {
    slug: record.slug,
    title: record.title,
    subtitle: record.subtitle,
    longDescription: record.description,
    price: record.price,
    primaryButton: record.primaryButton,
    secondaryButton: record.secondaryButton,
    image: normalizeMediaUrl(record.image),
    specs: mapDetailSpecs(record.specs),
    highlights: mapDetailFeatures(record.highlights),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function mapEnergyProductRecord(
  record: EnergyProductRecord,
): EnergyProductData {
  return {
    slug: record.slug,
    title: record.title,
    description: record.description,
    longDescription: record.longDescription,
    image: normalizeMediaUrl(record.image),
    primaryButton: record.primaryButton,
    secondaryButton: record.secondaryButton,
    highlights: mapDetailFeatures(record.highlights),
    supportingFeatures: mapDetailFeatures(record.detailFeatures),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function mapShopProductRecord(record: ShopProductRecord): ShopProductData {
  return {
    slug: record.slug,
    title: record.title,
    description: record.description,
    longDescription: record.longDescription,
    price: record.price,
    image: normalizeMediaUrl(record.image),
    primaryButton: record.primaryButton,
    secondaryButton: record.secondaryButton,
    badge: record.badge ?? undefined,
    highlights: mapDetailFeatures(record.highlights),
    specs: mapDetailSpecs(record.detailFeatures),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
