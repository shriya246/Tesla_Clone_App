import {
  getCategoryBoostValue,
  type ProductRankingOverrideData,
  type RecommendationRankingConfigValues,
} from "@/lib/recommendations/config";
import type {
  RecommendationCatalogItem,
  RecommendationItemType,
  RecommendationScoreBreakdown,
  RecommendationScoreComponent,
  RecommendationSignalMap,
  RecommendationUserProfile,
} from "@/lib/recommendations/types";
import { getTokenOverlapScore } from "@/lib/recommendations/utils";

function buildScoreComponent(
  id: string,
  label: string,
  score: number,
  description: string,
): RecommendationScoreComponent {
  return {
    id,
    label,
    score,
    description,
  };
}

function getSignalAffinity(
  signalMap: RecommendationSignalMap | undefined,
  candidate: Pick<RecommendationCatalogItem, "itemType" | "tokens">,
  config: RecommendationRankingConfigValues,
) {
  if (!signalMap) {
    return 0;
  }

  return (
    (signalMap.categoryWeights.get(candidate.itemType) ?? 0) *
      config.categoryAffinityWeight +
    getTokenOverlapScore(candidate.tokens, signalMap.tokenWeights) *
      config.tokenAffinityWeight
  );
}

function sortComponentsDescending(components: RecommendationScoreComponent[]) {
  return [...components].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return left.label.localeCompare(right.label);
  });
}

function buildTopReasons(components: RecommendationScoreComponent[]) {
  return sortComponentsDescending(components)
    .filter((component) => component.score > 0)
    .slice(0, 3)
    .map((component) => component.description);
}

export function normalizePopularityScore(rawScore: number, maxScore: number) {
  if (!Number.isFinite(rawScore) || rawScore <= 0 || maxScore <= 0) {
    return 0;
  }

  return Math.min(1, Math.log1p(rawScore) / Math.log1p(maxScore));
}

export function getFreshnessScore(updatedAt?: Date | null, now = new Date()) {
  if (!updatedAt) {
    return 0;
  }

  const ageInDays =
    (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);

  if (!Number.isFinite(ageInDays) || ageInDays <= 0) {
    return 1;
  }

  return Math.max(0, 1 - ageInDays / 120);
}

export function getUserAffinityScore(input: {
  candidate: Pick<RecommendationCatalogItem, "itemType" | "tokens">;
  config: RecommendationRankingConfigValues;
  profile?: RecommendationUserProfile | null;
}) {
  const favoriteScore =
    getSignalAffinity(input.profile?.favoriteSignals, input.candidate, input.config) *
    input.config.favoritesWeight;
  const recentScore =
    getSignalAffinity(input.profile?.recentSignals, input.candidate, input.config) *
    input.config.recentlyViewedWeight;
  const savedBuildScore =
    getSignalAffinity(
      input.profile?.savedBuildSignals,
      input.candidate,
      input.config,
    ) * input.config.savedBuildWeight;
  const inquiryScore =
    getSignalAffinity(
      input.profile?.inquirySignals,
      input.candidate,
      input.config,
    ) * input.config.inquiryWeight;

  return {
    favoriteScore,
    recentScore,
    savedBuildScore,
    inquiryScore,
    total: favoriteScore + recentScore + savedBuildScore + inquiryScore,
  };
}

export function scoreRecommendationCandidate(input: {
  candidate: Pick<RecommendationCatalogItem, "itemType" | "key" | "tokens" | "updatedAt">;
  config: RecommendationRankingConfigValues;
  profile?: RecommendationUserProfile | null;
  currentItemType?: RecommendationItemType;
  preferredItemTypes?: RecommendationItemType[];
  seedCategoryWeights?: ReadonlyMap<RecommendationItemType, number>;
  seedTokenWeights?: ReadonlyMap<string, number>;
  override?: ProductRankingOverrideData | null;
  popularityScore?: number;
  maxPopularityScore?: number;
  now?: Date;
}) {
  const preferredTypes = new Set(input.preferredItemTypes ?? []);
  const userAffinity = getUserAffinityScore({
    candidate: input.candidate,
    config: input.config,
    profile: input.profile,
  });
  const contextAffinity =
    (input.seedCategoryWeights?.get(input.candidate.itemType) ?? 0) *
      input.config.categoryAffinityWeight +
    getTokenOverlapScore(
      input.candidate.tokens,
      input.seedTokenWeights ?? new Map<string, number>(),
    ) *
      input.config.tokenAffinityWeight;
  const sameTypeScore =
    input.currentItemType && input.candidate.itemType === input.currentItemType
      ? input.config.sameTypeWeight
      : 0;
  const preferredTypeScore = preferredTypes.has(input.candidate.itemType)
    ? input.config.preferredTypeWeight
    : 0;
  const normalizedPopularity = normalizePopularityScore(
    input.popularityScore ?? 0,
    input.maxPopularityScore ?? 0,
  );
  const popularityScore = normalizedPopularity * input.config.popularityWeight;
  const normalizedFreshness = getFreshnessScore(
    input.candidate.updatedAt,
    input.now,
  );
  const freshnessScore = normalizedFreshness * input.config.freshnessWeight;
  const adminBoostScore =
    (input.override?.boostScore ?? 0) * input.config.adminBoostWeight;
  const pinnedScore = input.override?.pinned ? input.config.pinWeight : 0;

  const components: RecommendationScoreComponent[] = [
    buildScoreComponent(
      "favorites-affinity",
      "Favorites affinity",
      userAffinity.favoriteScore,
      "Because you favorited similar items.",
    ),
    buildScoreComponent(
      "recently-viewed-affinity",
      "Recently viewed affinity",
      userAffinity.recentScore,
      "Because you recently explored similar products.",
    ),
    buildScoreComponent(
      "saved-build-affinity",
      "Saved build affinity",
      userAffinity.savedBuildScore,
      "Because your saved builds point toward this product.",
    ),
    buildScoreComponent(
      "inquiry-affinity",
      "Inquiry affinity",
      userAffinity.inquiryScore,
      "Because your past inquiry activity suggests this fit.",
    ),
    buildScoreComponent(
      "context-affinity",
      "Context affinity",
      contextAffinity,
      "Because it closely matches the current product context.",
    ),
    buildScoreComponent(
      "same-type-bonus",
      "Same type bonus",
      sameTypeScore,
      "Because it stays inside the same major catalog type.",
    ),
    buildScoreComponent(
      "preferred-type-bonus",
      "Preferred type bonus",
      preferredTypeScore,
      "Because it aligns with your strongest current category path.",
    ),
    buildScoreComponent(
      "popularity",
      "Popularity",
      popularityScore,
      "Because it is trending with other visitors.",
    ),
    buildScoreComponent(
      "freshness",
      "Freshness",
      freshnessScore,
      "Because it was updated recently in the catalog.",
    ),
    buildScoreComponent(
      "admin-boost",
      "Admin boost",
      adminBoostScore,
      "Because the admin team manually boosted this item.",
    ),
    buildScoreComponent(
      "pin-bonus",
      "Pin bonus",
      pinnedScore,
      "Because the admin team pinned this item for visibility.",
    ),
  ];

  const subtotal = components.reduce((sum, component) => sum + component.score, 0);
  const categoryBoostFactor = getCategoryBoostValue(
    input.candidate.itemType,
    input.config,
  );
  const categoryBoostAdjustment = subtotal * (categoryBoostFactor - 1);

  if (categoryBoostAdjustment !== 0) {
    components.push(
      buildScoreComponent(
        "category-boost",
        "Category boost",
        categoryBoostAdjustment,
        "Because this catalog category is currently boosted in ranking settings.",
      ),
    );
  }

  const totalScore = components.reduce((sum, component) => sum + component.score, 0);
  const breakdown: RecommendationScoreBreakdown = {
    totalScore,
    components: sortComponentsDescending(components),
    reasons: buildTopReasons(components),
    pinned: input.override?.pinned ?? false,
    boostScore: input.override?.boostScore ?? 0,
    categoryBoostFactor,
    normalizedPopularity,
    normalizedFreshness,
  };

  return {
    score: totalScore,
    breakdown,
  };
}

export function scoreSearchDiscoveryAdjustment(input: {
  candidate: Pick<RecommendationCatalogItem, "itemType" | "tokens" | "updatedAt">;
  config: RecommendationRankingConfigValues;
  profile?: RecommendationUserProfile | null;
  override?: ProductRankingOverrideData | null;
  popularityScore?: number;
  maxPopularityScore?: number;
  now?: Date;
}) {
  const userAffinity = getUserAffinityScore({
    candidate: input.candidate,
    config: input.config,
    profile: input.profile,
  }).total;
  const normalizedPopularity = normalizePopularityScore(
    input.popularityScore ?? 0,
    input.maxPopularityScore ?? 0,
  );
  const normalizedFreshness = getFreshnessScore(
    input.candidate.updatedAt,
    input.now,
  );
  const categoryBoostValue = getCategoryBoostValue(
    input.candidate.itemType,
    input.config,
  );

  return {
    userAffinityScore: userAffinity * input.config.searchUserAffinityWeight,
    popularityScore:
      normalizedPopularity * 100 * input.config.searchPopularityWeight,
    freshnessScore:
      normalizedFreshness * 100 * input.config.searchFreshnessWeight,
    adminBoostScore:
      (input.override?.boostScore ?? 0) * input.config.searchAdminBoostWeight,
    pinnedScore: input.override?.pinned ? input.config.searchPinWeight : 0,
    categoryBoostScore:
      (categoryBoostValue - 1) * 100 * input.config.searchCategoryBoostWeight,
  };
}
