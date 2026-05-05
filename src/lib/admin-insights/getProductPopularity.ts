import "server-only";

import { prisma } from "@/lib/prisma";
import { adminItemTypeLabels } from "@/lib/admin-labels";

import {
  buildAdminInsightProductKey,
  createEmptyAdminProductEngagement,
  getAdminProductCatalogBase,
  mergeAdminProductEngagement,
} from "@/lib/admin-insights/catalog";
import { compareNumbersDesc } from "@/lib/admin-insights/utils";
import type {
  AdminCategoryEngagementItem,
  AdminProductEngagementMetrics,
  AdminProductPopularityData,
  AdminProductListItem,
  FavoriteItemTypeValue,
} from "@/types";

function finalizeEngagementMetrics(metrics: AdminProductEngagementMetrics) {
  metrics.totalSignals =
    metrics.views + metrics.favorites + metrics.savedBuilds + metrics.inquiries;
  metrics.weightedScore =
    metrics.views +
    metrics.favorites * 3 +
    metrics.savedBuilds * 4 +
    metrics.inquiries * 2;

  return metrics;
}

function buildEmptyMetricsMap() {
  return new Map<string, AdminProductEngagementMetrics>();
}

function getMetricsEntry(
  index: Map<string, AdminProductEngagementMetrics>,
  key: string,
) {
  const existing = index.get(key);

  if (existing) {
    return existing;
  }

  const created = createEmptyAdminProductEngagement();
  index.set(key, created);

  return created;
}

function sortProductsByMetric(
  items: AdminProductListItem[],
  getMetric: (item: AdminProductListItem) => number,
) {
  return [...items]
    .filter((item) => getMetric(item) > 0)
    .sort((left, right) => {
      const metricDelta = compareNumbersDesc(getMetric(left), getMetric(right));

      if (metricDelta !== 0) {
        return metricDelta;
      }

      return left.title.localeCompare(right.title);
    });
}

export async function getProductPopularityIndex() {
  try {
    const [viewGroups, favoriteGroups, savedBuildGroups, inquiryGroups] =
      await Promise.all([
        prisma.recentlyViewed.groupBy({
          by: ["itemType", "itemSlug"],
          _sum: {
            viewCount: true,
          },
        }),
        prisma.favorite.groupBy({
          by: ["itemType", "itemSlug"],
          _count: {
            id: true,
          },
        }),
        prisma.savedBuild.groupBy({
          by: ["vehicleSlug"],
          _count: {
            id: true,
          },
        }),
        prisma.inquiry.groupBy({
          by: ["itemType", "productSlug"],
          where: {
            itemType: {
              not: null,
            },
            productSlug: {
              not: null,
            },
          },
          _count: {
            id: true,
          },
        }),
      ]);

    const index = buildEmptyMetricsMap();

    for (const group of viewGroups) {
      const metrics = getMetricsEntry(
        index,
        buildAdminInsightProductKey(group.itemType, group.itemSlug),
      );

      metrics.views = group._sum.viewCount ?? 0;
    }

    for (const group of favoriteGroups) {
      const metrics = getMetricsEntry(
        index,
        buildAdminInsightProductKey(group.itemType, group.itemSlug),
      );

      metrics.favorites = group._count.id;
    }

    for (const group of savedBuildGroups) {
      const metrics = getMetricsEntry(
        index,
        buildAdminInsightProductKey("VEHICLE", group.vehicleSlug),
      );

      metrics.savedBuilds = group._count.id;
    }

    for (const group of inquiryGroups) {
      if (!group.itemType || !group.productSlug) {
        continue;
      }

      const metrics = getMetricsEntry(
        index,
        buildAdminInsightProductKey(group.itemType, group.productSlug),
      );

      metrics.inquiries = group._count.id;
    }

    for (const [key, metrics] of index.entries()) {
      index.set(key, finalizeEngagementMetrics(metrics));
    }

    return index;
  } catch {
    return buildEmptyMetricsMap();
  }
}

export async function getProductPopularity(): Promise<AdminProductPopularityData> {
  const [catalogBase, engagementIndex] = await Promise.all([
    getAdminProductCatalogBase(),
    getProductPopularityIndex(),
  ]);
  const items = mergeAdminProductEngagement(catalogBase, engagementIndex);
  const activeProducts = items.filter((item) => item.engagement.totalSignals > 0);
  const topViewedVehicles = sortProductsByMetric(
    items.filter((item) => item.itemType === "VEHICLE"),
    (item) => item.engagement.views,
  ).slice(0, 5);
  const topViewedProducts = sortProductsByMetric(
    items,
    (item) => item.engagement.views,
  ).slice(0, 6);
  const mostFavoritedItems = sortProductsByMetric(
    items,
    (item) => item.engagement.favorites,
  ).slice(0, 6);
  const mostSavedBuildVehicles = sortProductsByMetric(
    items.filter((item) => item.itemType === "VEHICLE"),
    (item) => item.engagement.savedBuilds,
  ).slice(0, 5);
  const categoryTotals = new Map<FavoriteItemTypeValue, AdminCategoryEngagementItem>();

  for (const item of items) {
    const existing = categoryTotals.get(item.itemType);

    if (existing) {
      existing.views += item.engagement.views;
      existing.favorites += item.engagement.favorites;
      existing.savedBuilds += item.engagement.savedBuilds;
      existing.inquiries += item.engagement.inquiries;
      existing.totalSignals += item.engagement.totalSignals;
      existing.weightedScore += item.engagement.weightedScore;
      continue;
    }

    categoryTotals.set(item.itemType, {
      itemType: item.itemType,
      label: adminItemTypeLabels[item.itemType],
      views: item.engagement.views,
      favorites: item.engagement.favorites,
      savedBuilds: item.engagement.savedBuilds,
      inquiries: item.engagement.inquiries,
      totalSignals: item.engagement.totalSignals,
      weightedScore: item.engagement.weightedScore,
    });
  }

  return {
    totalTrackedViews: items.reduce(
      (sum, item) => sum + item.engagement.views,
      0,
    ),
    totalFavorites: items.reduce(
      (sum, item) => sum + item.engagement.favorites,
      0,
    ),
    totalSavedBuilds: items.reduce(
      (sum, item) => sum + item.engagement.savedBuilds,
      0,
    ),
    totalProductInquiries: items.reduce(
      (sum, item) => sum + item.engagement.inquiries,
      0,
    ),
    activeProducts: activeProducts.length,
    topViewedVehicles,
    topViewedProducts,
    mostFavoritedItems,
    mostSavedBuildVehicles,
    topCategories: [...categoryTotals.values()].sort(
      (left, right) =>
        compareNumbersDesc(left.weightedScore, right.weightedScore) ||
        left.label.localeCompare(right.label),
    ),
    productEngagementTable: [...activeProducts].sort(
      (left, right) =>
        compareNumbersDesc(
          left.engagement.weightedScore,
          right.engagement.weightedScore,
        ) || left.title.localeCompare(right.title),
    ),
  };
}
