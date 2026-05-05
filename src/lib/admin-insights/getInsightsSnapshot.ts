import "server-only";

import { getProductPopularity } from "@/lib/admin-insights/getProductPopularity";
import { getSearchTrends } from "@/lib/admin-insights/getSearchTrends";
import type { AdminInsightsSnapshot } from "@/types";

export async function getInsightsSnapshot(): Promise<AdminInsightsSnapshot> {
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
