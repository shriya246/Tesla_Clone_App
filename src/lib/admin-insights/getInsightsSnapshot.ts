import "server-only";

import { cacheRevalidateSeconds, cacheTags, createCachedQuery } from "@/lib/cache";
import { getProductPopularity } from "@/lib/admin-insights/getProductPopularity";
import { getSearchTrends } from "@/lib/admin-insights/getSearchTrends";
import type { AdminInsightsSnapshot } from "@/types";

async function getInsightsSnapshotUncached(): Promise<AdminInsightsSnapshot> {
  const [productPopularity, searchTrends] = await Promise.all([
    getProductPopularity(),
    getSearchTrends(),
  ]);

  return {
    topViewedProduct: productPopularity.topViewedProducts[0] ?? null,
    topFavoritedProduct: productPopularity.mostFavoritedItems[0] ?? null,
    topSearchQuery: searchTrends.topQueries[0] ?? null,
  };
}

export const getInsightsSnapshot = createCachedQuery(
  getInsightsSnapshotUncached,
  ["admin-insights:snapshot:v2"],
  {
    revalidate: cacheRevalidateSeconds.adminInsights,
    tags: [
      cacheTags.account,
      cacheTags.adminInsights,
      cacheTags.catalog,
      cacheTags.search,
    ],
  },
);
