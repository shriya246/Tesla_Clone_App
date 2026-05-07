import "server-only";

import { getProductPopularityIndex } from "@/lib/admin-insights";
import { getProductRankingOverrideMap } from "@/lib/db/product-ranking-overrides";
import { getRankingConfig } from "@/lib/recommendations/getRankingConfig";
import {
  getRecommendationCatalog,
  getRecommendationCatalogMap,
  toRecommendationDisplayItem,
} from "@/lib/recommendations/catalog";
import { scoreRecommendationCandidate } from "@/lib/recommendations/scoreItem";
import { buildUserRecommendationProfile } from "@/lib/recommendations/signals";
import type {
  GetRecommendedItemsInput,
  RankedRecommendationCandidate,
  RecommendationCatalogItem,
  RecommendationDebugItem,
  RecommendationSeedInput,
} from "@/lib/recommendations/types";
import {
  addWeight,
  buildRecommendationKey,
  tokenizeRecommendationText,
} from "@/lib/recommendations/utils";

interface RecommendationSeedContext {
  seedKeys: Set<string>;
  categoryWeights: Map<RecommendationSeedInput["itemType"], number>;
  tokenWeights: Map<string, number>;
}

export interface RecommendationRankingContext {
  catalog: RecommendationCatalogItem[];
  config: Awaited<ReturnType<typeof getRankingConfig>>;
  profile: Awaited<ReturnType<typeof buildUserRecommendationProfile>> | null;
  popularityScoreMap: Map<string, number>;
  maxPopularityScore: number;
  overrideMap: Awaited<ReturnType<typeof getProductRankingOverrideMap>>;
  now: Date;
}

function buildSeedContext(
  seeds: RecommendationSeedInput[],
  catalogMap: Map<string, RecommendationCatalogItem>,
): RecommendationSeedContext {
  const seedKeys = new Set<string>();
  const categoryWeights = new Map<RecommendationSeedInput["itemType"], number>();
  const tokenWeights = new Map<string, number>();

  for (const seed of seeds) {
    const key = buildRecommendationKey(seed.itemType, seed.slug);
    const item = catalogMap.get(key);

    if (!item) {
      continue;
    }

    const weight = seed.weight ?? 3;
    seedKeys.add(key);
    addWeight(categoryWeights, item.itemType, weight);

    for (const token of item.tokens) {
      addWeight(tokenWeights, token, weight);
    }

    for (const token of tokenizeRecommendationText(...(seed.extraTokens ?? []))) {
      addWeight(tokenWeights, token, weight * 0.65);
    }
  }

  return {
    seedKeys,
    categoryWeights,
    tokenWeights,
  };
}

async function buildPopularityScoreMap() {
  const popularityIndex = await getProductPopularityIndex();
  const popularityScoreMap = new Map<string, number>();
  let maxPopularityScore = 0;

  for (const [key, metrics] of popularityIndex.entries()) {
    popularityScoreMap.set(key, metrics.weightedScore);
    maxPopularityScore = Math.max(maxPopularityScore, metrics.weightedScore);
  }

  return {
    popularityScoreMap,
    maxPopularityScore,
  };
}

export async function getRecommendationRankingContext(input?: {
  userId?: string | null;
  catalog?: RecommendationCatalogItem[];
}) {
  const catalog = input?.catalog ?? (await getRecommendationCatalog());
  const [config, overrideMap, popularity] = await Promise.all([
    getRankingConfig(),
    getProductRankingOverrideMap(),
    buildPopularityScoreMap(),
  ]);
  const profile =
    input?.userId
      ? await buildUserRecommendationProfile(input.userId, catalog, config)
      : null;

  return {
    catalog,
    config,
    profile,
    popularityScoreMap: popularity.popularityScoreMap,
    maxPopularityScore: popularity.maxPopularityScore,
    overrideMap,
    now: new Date(),
  } satisfies RecommendationRankingContext;
}

export async function rankRecommendationCandidates(
  input: GetRecommendedItemsInput & {
    allowFallbackWithoutSignals?: boolean;
    catalog?: RecommendationCatalogItem[];
  },
): Promise<RankedRecommendationCandidate[]> {
  const catalog = input.catalog ?? (await getRecommendationCatalog());
  const catalogMap =
    input.catalog
      ? new Map(input.catalog.map((item) => [item.key, item] as const))
      : await getRecommendationCatalogMap();
  const rankingContext = await getRecommendationRankingContext({
    userId: input.userId,
    catalog,
  });
  const seeds = [
    ...(input.currentItem ? [input.currentItem] : []),
    ...(input.seeds ?? []),
  ];
  const seedContext = buildSeedContext(seeds, catalogMap);

  if (!rankingContext.profile?.hasSignals && seeds.length === 0 && !input.allowFallbackWithoutSignals) {
    return [];
  }

  const excludedKeys = new Set(input.excludeItemKeys ?? []);

  if (!input.includeInteractedItems) {
    for (const key of rankingContext.profile?.interactedKeys ?? []) {
      excludedKeys.add(key);
    }
  }

  for (const key of seedContext.seedKeys) {
    excludedKeys.add(key);
  }

  const currentItemType = input.currentItem?.itemType;
  const preferredItemTypes = [
    ...(input.preferredItemTypes ?? []),
    ...seedContext.categoryWeights.keys(),
  ];

  return catalog
    .filter((candidate) => !excludedKeys.has(candidate.key))
    .map((candidate) => {
      const score = scoreRecommendationCandidate({
        candidate,
        config: rankingContext.config,
        profile: rankingContext.profile,
        currentItemType,
        preferredItemTypes,
        seedCategoryWeights: seedContext.categoryWeights,
        seedTokenWeights: seedContext.tokenWeights,
        override: rankingContext.overrideMap.get(candidate.key) ?? null,
        popularityScore: rankingContext.popularityScoreMap.get(candidate.key) ?? 0,
        maxPopularityScore: rankingContext.maxPopularityScore,
        now: rankingContext.now,
      });

      return {
        candidate,
        score: score.score,
        breakdown: score.breakdown,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.candidate.title.localeCompare(right.candidate.title);
    });
}

export function toRecommendationDebugItem(
  entry: RankedRecommendationCandidate,
): RecommendationDebugItem {
  const item = toRecommendationDisplayItem(entry.candidate);

  return {
    ...item,
    itemType: entry.candidate.itemType,
    slug: entry.candidate.slug,
    score: entry.score,
    reasons: entry.breakdown.reasons,
    scoreBreakdown: entry.breakdown.components,
    pinned: entry.breakdown.pinned,
    boostScore: entry.breakdown.boostScore,
  };
}

export async function getRecommendationDebugPreview(input?: {
  userId?: string | null;
  limit?: number;
}) {
  const ranked = await rankRecommendationCandidates({
    userId: input?.userId,
    limit: input?.limit,
    allowFallbackWithoutSignals: true,
    includeInteractedItems: true,
  });

  return ranked.slice(0, input?.limit ?? 5).map(toRecommendationDebugItem);
}
