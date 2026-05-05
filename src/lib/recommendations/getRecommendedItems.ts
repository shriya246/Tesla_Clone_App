import "server-only";

import { buildUserRecommendationProfile } from "@/lib/recommendations/signals";

import {
  getRecommendationCatalog,
  getRecommendationCatalogMap,
  toRecommendationDisplayItem,
} from "@/lib/recommendations/catalog";
import type {
  GetRecommendedItemsInput,
  RecommendationCatalogItem,
  RecommendationSeedInput,
} from "@/lib/recommendations/types";
import {
  addWeight,
  buildRecommendationKey,
  scoreRecommendationCandidate,
  tokenizeRecommendationText,
} from "@/lib/recommendations/utils";

function buildSeedContext(
  seeds: RecommendationSeedInput[],
  catalogMap: Map<string, RecommendationCatalogItem>,
) {
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

export async function getRecommendedItems(input: GetRecommendedItemsInput) {
  const limit = input.limit ?? 3;
  const catalog = await getRecommendationCatalog();
  const catalogMap = await getRecommendationCatalogMap();
  const profile =
    input.userId ? await buildUserRecommendationProfile(input.userId, catalog) : null;
  const seeds = [
    ...(input.currentItem ? [input.currentItem] : []),
    ...(input.seeds ?? []),
  ];
  const seedContext = buildSeedContext(seeds, catalogMap);

  if (!profile?.hasSignals && seeds.length === 0) {
    return [];
  }

  const excludedKeys = new Set(input.excludeItemKeys ?? []);

  if (!input.includeInteractedItems) {
    for (const key of profile?.interactedKeys ?? []) {
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

  const scoredResults = catalog
    .filter((candidate) => !excludedKeys.has(candidate.key))
    .map((candidate) => ({
      candidate,
      score: scoreRecommendationCandidate({
        candidate,
        currentItemType,
        preferredItemTypes,
        profileCategoryWeights: profile?.categoryWeights,
        profileTokenWeights: profile?.tokenWeights,
        seedCategoryWeights: seedContext.categoryWeights,
        seedTokenWeights: seedContext.tokenWeights,
        recentKeys: profile?.recentKeys,
        favoriteKeys: profile?.favoriteKeys,
      }),
    }))
    .filter((entry) => entry.score > 0.2)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.candidate.title.localeCompare(right.candidate.title);
    });

  const selectedKeys = new Set<string>();
  const selectedItems = scoredResults.flatMap((entry) => {
    if (selectedKeys.has(entry.candidate.key) || selectedKeys.size >= limit) {
      return [];
    }

    selectedKeys.add(entry.candidate.key);

    return [toRecommendationDisplayItem(entry.candidate)];
  });

  if (selectedItems.length >= limit) {
    return selectedItems;
  }

  const fallbackTypes = new Set(preferredItemTypes);

  if (currentItemType) {
    fallbackTypes.add(currentItemType);
  }

  for (const candidate of catalog) {
    if (
      selectedKeys.size >= limit ||
      selectedKeys.has(candidate.key) ||
      excludedKeys.has(candidate.key)
    ) {
      continue;
    }

    if (fallbackTypes.size > 0 && !fallbackTypes.has(candidate.itemType)) {
      continue;
    }

    selectedKeys.add(candidate.key);
    selectedItems.push(toRecommendationDisplayItem(candidate));
  }

  if (selectedItems.length >= limit) {
    return selectedItems;
  }

  for (const candidate of catalog) {
    if (
      selectedKeys.size >= limit ||
      selectedKeys.has(candidate.key) ||
      excludedKeys.has(candidate.key)
    ) {
      continue;
    }

    selectedKeys.add(candidate.key);
    selectedItems.push(toRecommendationDisplayItem(candidate));
  }

  return selectedItems;
}
