import "server-only";

import { getUserFavorites } from "@/lib/db/favorites";
import { getInquiriesByUser } from "@/lib/db/inquiries";
import { getSavedBuildsByUser } from "@/lib/db/saved-builds";

import type {
  RecommendationCatalogItem,
  RecommendationUserProfile,
} from "@/lib/recommendations/types";
import {
  addWeight,
  buildRecommendationKey,
  extractSavedBuildTokens,
} from "@/lib/recommendations/utils";
import { getRecentlyViewedSignalsByUser } from "@/lib/recommendations/trackRecentlyViewed";

function addSeedSignals(input: {
  profile: RecommendationUserProfile;
  item: RecommendationCatalogItem;
  weight: number;
  extraTokens?: string[];
}) {
  addWeight(input.profile.categoryWeights, input.item.itemType, input.weight);

  for (const token of input.item.tokens) {
    addWeight(input.profile.tokenWeights, token, input.weight);
  }

  for (const token of input.extraTokens ?? []) {
    addWeight(input.profile.tokenWeights, token, input.weight * 0.75);
  }

  input.profile.interactedKeys.add(input.item.key);
}

export async function buildUserRecommendationProfile(
  userId: string,
  catalog: RecommendationCatalogItem[],
): Promise<RecommendationUserProfile> {
  const catalogMap = new Map(
    catalog.map((item) => [buildRecommendationKey(item.itemType, item.slug), item]),
  );
  const [favorites, recentlyViewed, savedBuilds, inquiries] = await Promise.all([
    getUserFavorites(userId),
    getRecentlyViewedSignalsByUser(userId),
    getSavedBuildsByUser(userId),
    getInquiriesByUser(userId),
  ]);

  const profile: RecommendationUserProfile = {
    hasSignals: false,
    interactedKeys: new Set<string>(),
    favoriteKeys: new Set<string>(),
    recentKeys: new Set<string>(),
    savedBuildKeys: new Set<string>(),
    categoryWeights: new Map(),
    tokenWeights: new Map(),
    favoriteSeeds: [],
    recentSeeds: [],
    savedBuildSeeds: [],
    inquirySeeds: [],
  };

  for (const favorite of favorites) {
    const key = buildRecommendationKey(favorite.itemType, favorite.itemSlug);
    const item = catalogMap.get(key);

    if (!item) {
      continue;
    }

    const weight = 5;
    profile.favoriteSeeds.push({
      itemType: item.itemType,
      slug: item.slug,
      weight,
    });
    profile.favoriteKeys.add(key);
    addSeedSignals({
      profile,
      item,
      weight,
    });
  }

  for (const recentItem of recentlyViewed) {
    const key = buildRecommendationKey(recentItem.itemType, recentItem.itemSlug);
    const item = catalogMap.get(key);

    if (!item) {
      continue;
    }

    const isFresh =
      Date.now() - recentItem.lastViewedAt.getTime() < 1000 * 60 * 60 * 24 * 7;
    const weight = 1.75 + Math.min(recentItem.viewCount, 4) * 0.45 + (isFresh ? 0.5 : 0);
    profile.recentSeeds.push({
      itemType: item.itemType,
      slug: item.slug,
      weight,
    });
    profile.recentKeys.add(key);
    addSeedSignals({
      profile,
      item,
      weight,
    });
  }

  for (const build of savedBuilds) {
    const key = buildRecommendationKey("VEHICLE", build.vehicleSlug);
    const item = catalogMap.get(key);

    if (!item) {
      continue;
    }

    const weight = 5.5;
    const extraTokens = extractSavedBuildTokens(build.selectedOptions);
    profile.savedBuildSeeds.push({
      itemType: "VEHICLE",
      slug: build.vehicleSlug,
      weight,
      extraTokens,
    });
    profile.savedBuildKeys.add(key);
    addSeedSignals({
      profile,
      item,
      weight,
      extraTokens,
    });
  }

  for (const inquiry of inquiries) {
    if (!inquiry.itemType || !inquiry.productSlug) {
      continue;
    }

    const key = buildRecommendationKey(inquiry.itemType, inquiry.productSlug);
    const item = catalogMap.get(key);

    if (!item) {
      continue;
    }

    const weight = 3.75;
    profile.inquirySeeds.push({
      itemType: item.itemType,
      slug: item.slug,
      weight,
    });
    addSeedSignals({
      profile,
      item,
      weight,
    });
  }

  profile.hasSignals =
    profile.favoriteSeeds.length > 0 ||
    profile.recentSeeds.length > 0 ||
    profile.savedBuildSeeds.length > 0 ||
    profile.inquirySeeds.length > 0;

  return profile;
}
