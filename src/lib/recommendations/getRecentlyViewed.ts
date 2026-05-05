import "server-only";

import { getRecommendationCatalogMap, toRecommendationDisplayItem } from "@/lib/recommendations/catalog";
import { buildRecommendationKey } from "@/lib/recommendations/utils";
import { getRecentlyViewedSignalsByUser } from "@/lib/recommendations/trackRecentlyViewed";

export async function getRecentlyViewed(userId: string, limit = 4) {
  const [catalogMap, recentlyViewed] = await Promise.all([
    getRecommendationCatalogMap(),
    getRecentlyViewedSignalsByUser(userId, limit),
  ]);

  return recentlyViewed.flatMap((item) => {
    const catalogItem = catalogMap.get(
      buildRecommendationKey(item.itemType, item.itemSlug),
    );

    return catalogItem ? [toRecommendationDisplayItem(catalogItem)] : [];
  });
}
