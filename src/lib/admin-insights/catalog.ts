import "server-only";

import {
  getAdminProductCategoryFromItemType,
  getAdminProductEditorHref,
  getProductHref,
} from "@/lib/admin-products";
import { isRemoteMediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import type {
  AdminProductCollection,
  AdminProductEngagementMetrics,
  AdminProductListItem,
  FavoriteItemTypeValue,
} from "@/types";

export function buildAdminInsightProductKey(
  itemType: FavoriteItemTypeValue,
  slug: string,
) {
  return `${itemType}:${slug}`;
}

export function createEmptyAdminProductEngagement(): AdminProductEngagementMetrics {
  return {
    views: 0,
    favorites: 0,
    savedBuilds: 0,
    inquiries: 0,
    totalSignals: 0,
    weightedScore: 0,
  };
}

export async function getAdminProductCatalogBase(): Promise<AdminProductListItem[]> {
  try {
    const [vehicles, energyProducts, shopProducts] = await Promise.all([
      prisma.vehicle.findMany({
        orderBy: {
          title: "asc",
        },
        select: {
          id: true,
          slug: true,
          title: true,
          subtitle: true,
          image: true,
          price: true,
          updatedAt: true,
        },
      }),
      prisma.energyProduct.findMany({
        orderBy: {
          title: "asc",
        },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          image: true,
          updatedAt: true,
        },
      }),
      prisma.shopProduct.findMany({
        orderBy: {
          title: "asc",
        },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          image: true,
          price: true,
          updatedAt: true,
        },
      }),
    ]);

    return [
      ...vehicles.map((vehicle) => ({
        id: vehicle.id,
        category: getAdminProductCategoryFromItemType("VEHICLE"),
        itemType: "VEHICLE" as const,
        categoryLabel: "Vehicle",
        title: vehicle.title,
        slug: vehicle.slug,
        href: getProductHref("VEHICLE", vehicle.slug),
        adminHref: getAdminProductEditorHref(
          getAdminProductCategoryFromItemType("VEHICLE"),
          vehicle.id,
        ),
        summary: vehicle.subtitle,
        image: vehicle.image,
        isRemoteImage: isRemoteMediaUrl(vehicle.image),
        price: vehicle.price,
        updatedAt: vehicle.updatedAt,
        engagement: createEmptyAdminProductEngagement(),
      })),
      ...energyProducts.map((product) => ({
        id: product.id,
        category: getAdminProductCategoryFromItemType("ENERGY_PRODUCT"),
        itemType: "ENERGY_PRODUCT" as const,
        categoryLabel: "Energy",
        title: product.title,
        slug: product.slug,
        href: getProductHref("ENERGY_PRODUCT", product.slug),
        adminHref: getAdminProductEditorHref(
          getAdminProductCategoryFromItemType("ENERGY_PRODUCT"),
          product.id,
        ),
        summary: product.description,
        image: product.image,
        isRemoteImage: isRemoteMediaUrl(product.image),
        updatedAt: product.updatedAt,
        engagement: createEmptyAdminProductEngagement(),
      })),
      ...shopProducts.map((product) => ({
        id: product.id,
        category: getAdminProductCategoryFromItemType("SHOP_PRODUCT"),
        itemType: "SHOP_PRODUCT" as const,
        categoryLabel: "Shop",
        title: product.title,
        slug: product.slug,
        href: getProductHref("SHOP_PRODUCT", product.slug),
        adminHref: getAdminProductEditorHref(
          getAdminProductCategoryFromItemType("SHOP_PRODUCT"),
          product.id,
        ),
        summary: product.description,
        image: product.image,
        isRemoteImage: isRemoteMediaUrl(product.image),
        price: product.price,
        updatedAt: product.updatedAt,
        engagement: createEmptyAdminProductEngagement(),
      })),
    ];
  } catch {
    return [];
  }
}

export function mergeAdminProductEngagement(
  items: AdminProductListItem[],
  engagementIndex: Map<string, AdminProductEngagementMetrics>,
) {
  return items.map((item) => ({
    ...item,
    engagement:
      engagementIndex.get(buildAdminInsightProductKey(item.itemType, item.slug)) ??
      item.engagement,
  }));
}

export function groupAdminProductCollection(
  items: AdminProductListItem[],
): AdminProductCollection {
  const vehicles: AdminProductListItem[] = [];
  const energyProducts: AdminProductListItem[] = [];
  const shopProducts: AdminProductListItem[] = [];

  for (const item of items) {
    if (item.category === "vehicles") {
      vehicles.push(item);
      continue;
    }

    if (item.category === "energy") {
      energyProducts.push(item);
      continue;
    }

    shopProducts.push(item);
  }

  return {
    vehicles,
    energyProducts,
    shopProducts,
    totalCount: items.length,
  };
}
