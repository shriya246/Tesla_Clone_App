import "server-only";

import { cacheRevalidateSeconds, cacheTags, createCachedQuery } from "@/lib/cache";
import { getRecommendationConfigRecord } from "@/lib/db/recommendation-config";
import { mergeRecommendationRankingConfig } from "@/lib/recommendations/config";

export const getRankingConfig = createCachedQuery(async () => {
  const record = await getRecommendationConfigRecord();

  return mergeRecommendationRankingConfig(record);
}, ["recommendations:ranking-config:v2"], {
  revalidate: cacheRevalidateSeconds.recommendations,
  tags: [cacheTags.productRanking, cacheTags.recommendations, cacheTags.search],
});
