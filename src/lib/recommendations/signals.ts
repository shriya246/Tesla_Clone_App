import "server-only";

import { getUserFavorites } from "@/lib/db/favorites";
import { getInquiriesByUser } from "@/lib/db/inquiries";
import { getSavedBuildsByUser } from "@/lib/db/saved-builds";
import type { RecommendationRankingConfigValues } from "@/lib/recommendations/config";

import type {
  RecommendationCatalogItem,
  RecommendationSignalMap,
  RecommendationUserProfile,
} from "@/lib/recommendations/types";
import {
  addWeight,
  buildRecommendationKey,
  extractSavedBuildTokens,
} from "@/lib/recommendations/utils";
import { getRecentlyViewedSignalsByUser } from "@/lib/recommendations/trackRecentlyViewed";

function createSignalMap(): RecommendationSignalMap {
  return {
    categoryWeights: new Map(),
    tokenWeights: new Map(),
  };
}

function addSeedSignals(input: {
  profile: RecommendationUserProfile;
  item: RecommendationCatalogItem;
  weight: number;
  extraTokens?: string[];
  target: RecommendationSignalMap;
}) {
  addWeight(input.target.categoryWeights, input.item.itemType, input.weight);
  addWeight(input.profile.categoryWeights, input.item.itemType, input.weight);

  for (const token of input.item.tokens) {
    addWeight(input.target.tokenWeights, token, input.weight);
    addWeight(input.profile.tokenWeights, token, input.weight);
  }

  for (const token of input.extraTokens ?? []) {
    addWeight(input.target.tokenWeights, token, input.weight * 0.75);
    addWeight(input.profile.tokenWeights, token, input.weight * 0.75);
  }

  input.profile.interactedKeys.add(input.item.key);
}

export async function buildUserRecommendationProfile(
  userId: string,
  catalog: RecommendationCatalogItem[],
  config: RecommendationRankingConfigValues,
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
    favoriteSignals: createSignalMap(),
    recentSignals: createSignalMap(),
    savedBuildSignals: createSignalMap(),
    inquirySignals: createSignalMap(),
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

    const weight = 1;
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
      target: profile.favoriteSignals,
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
    const weight =
      1 +
      Math.min(recentItem.viewCount, 4) * 0.25 +
      (isFresh ? config.recentViewRecencyBonus : 0);
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
      target: profile.recentSignals,
    });
  }

  for (const build of savedBuilds) {
    const key = buildRecommendationKey("VEHICLE", build.vehicleSlug);
    const item = catalogMap.get(key);

    if (!item) {
      continue;
    }

    const weight = 1;
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
      target: profile.savedBuildSignals,
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

    const weight = 1;
    profile.inquirySeeds.push({
      itemType: item.itemType,
      slug: item.slug,
      weight,
    });
    addSeedSignals({
      profile,
      item,
      weight,
      target: profile.inquirySignals,
    });
  }

  profile.hasSignals =
    profile.favoriteSeeds.length > 0 ||
    profile.recentSeeds.length > 0 ||
    profile.savedBuildSeeds.length > 0 ||
    profile.inquirySeeds.length > 0;

  return profile;
}
