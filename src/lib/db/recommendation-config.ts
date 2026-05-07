import "server-only";

import { prisma } from "@/lib/prisma";
import {
  RECOMMENDATION_CONFIG_ID,
  type RecommendationRankingConfigData,
  type RecommendationRankingConfigValues,
} from "@/lib/recommendations/config";

function mapRecommendationConfigRecord(
  record: Awaited<ReturnType<typeof prisma.recommendationConfig.findUnique>>,
): RecommendationRankingConfigData | null {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    favoritesWeight: record.favoritesWeight,
    recentlyViewedWeight: record.recentlyViewedWeight,
    recentViewRecencyBonus: record.recentViewRecencyBonus,
    savedBuildWeight: record.savedBuildWeight,
    inquiryWeight: record.inquiryWeight,
    categoryAffinityWeight: record.categoryAffinityWeight,
    tokenAffinityWeight: record.tokenAffinityWeight,
    sameTypeWeight: record.sameTypeWeight,
    preferredTypeWeight: record.preferredTypeWeight,
    popularityWeight: record.popularityWeight,
    freshnessWeight: record.freshnessWeight,
    adminBoostWeight: record.adminBoostWeight,
    pinWeight: record.pinWeight,
    vehicleCategoryBoost: record.vehicleCategoryBoost,
    energyCategoryBoost: record.energyCategoryBoost,
    shopCategoryBoost: record.shopCategoryBoost,
    searchPopularityWeight: record.searchPopularityWeight,
    searchFreshnessWeight: record.searchFreshnessWeight,
    searchAdminBoostWeight: record.searchAdminBoostWeight,
    searchPinWeight: record.searchPinWeight,
    searchUserAffinityWeight: record.searchUserAffinityWeight,
    searchCategoryBoostWeight: record.searchCategoryBoostWeight,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function getRecommendationConfigRecord() {
  try {
    const record = await prisma.recommendationConfig.findUnique({
      where: {
        id: RECOMMENDATION_CONFIG_ID,
      },
    });

    return mapRecommendationConfigRecord(record);
  } catch {
    return null;
  }
}

export async function saveRecommendationConfig(
  input: RecommendationRankingConfigValues,
) {
  const record = await prisma.recommendationConfig.upsert({
    where: {
      id: RECOMMENDATION_CONFIG_ID,
    },
    update: input,
    create: {
      id: RECOMMENDATION_CONFIG_ID,
      ...input,
    },
  });

  return mapRecommendationConfigRecord(record);
}
