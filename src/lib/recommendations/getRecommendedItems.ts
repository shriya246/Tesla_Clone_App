import "server-only";

import { toRecommendationDisplayItem } from "@/lib/recommendations/catalog";
import { rankRecommendationCandidates } from "@/lib/recommendations/ranking";
import type {
  GetRecommendedItemsInput,
  RankedRecommendationCandidate,
} from "@/lib/recommendations/types";

function selectRecommendationEntries(
  rankedEntries: RankedRecommendationCandidate[],
  input: GetRecommendedItemsInput,
) {
  const limit = input.limit ?? 3;
  const selectedKeys = new Set<string>();
  const selectedEntries: RankedRecommendationCandidate[] = [];
  const currentItemType = input.currentItem?.itemType;
  const preferredTypes = new Set([
    ...(input.preferredItemTypes ?? []),
    ...(currentItemType ? [currentItemType] : []),
  ]);

  for (const entry of rankedEntries) {
    if (selectedEntries.length >= limit) {
      break;
    }

    if (entry.score <= 0.2 || selectedKeys.has(entry.candidate.key)) {
      continue;
    }

    selectedKeys.add(entry.candidate.key);
    selectedEntries.push(entry);
  }

  if (selectedEntries.length >= limit) {
    return selectedEntries;
  }

  for (const entry of rankedEntries) {
    if (
      selectedEntries.length >= limit ||
      selectedKeys.has(entry.candidate.key) ||
      (preferredTypes.size > 0 && !preferredTypes.has(entry.candidate.itemType))
    ) {
      continue;
    }

    selectedKeys.add(entry.candidate.key);
    selectedEntries.push(entry);
  }

  if (selectedEntries.length >= limit) {
    return selectedEntries;
  }

  for (const entry of rankedEntries) {
    if (selectedEntries.length >= limit || selectedKeys.has(entry.candidate.key)) {
      continue;
    }

    selectedKeys.add(entry.candidate.key);
    selectedEntries.push(entry);
  }

  return selectedEntries;
}

export async function getRecommendedItems(input: GetRecommendedItemsInput) {
  const rankedEntries = await rankRecommendationCandidates(input);

  return selectRecommendationEntries(rankedEntries, input).map((entry) =>
    toRecommendationDisplayItem(entry.candidate),
  );
}
