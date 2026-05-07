import { describe, expect, it } from "vitest";

import { mergeRecommendationRankingConfig } from "@/lib/recommendations/config";
import {
  getFreshnessScore,
  normalizePopularityScore,
  scoreRecommendationCandidate,
  scoreSearchDiscoveryAdjustment,
} from "@/lib/recommendations/scoreItem";
import type { RecommendationCatalogItem, RecommendationUserProfile } from "@/lib/recommendations/types";

function createEmptyProfile(): RecommendationUserProfile {
  return {
    hasSignals: true,
    interactedKeys: new Set<string>(),
    favoriteKeys: new Set<string>(),
    recentKeys: new Set<string>(),
    savedBuildKeys: new Set<string>(),
    categoryWeights: new Map(),
    tokenWeights: new Map(),
    favoriteSignals: {
      categoryWeights: new Map(),
      tokenWeights: new Map(),
    },
    recentSignals: {
      categoryWeights: new Map(),
      tokenWeights: new Map(),
    },
    savedBuildSignals: {
      categoryWeights: new Map(),
      tokenWeights: new Map(),
    },
    inquirySignals: {
      categoryWeights: new Map(),
      tokenWeights: new Map(),
    },
    favoriteSeeds: [],
    recentSeeds: [],
    savedBuildSeeds: [],
    inquirySeeds: [],
  };
}

function createCandidate(): RecommendationCatalogItem {
  return {
    itemType: "VEHICLE",
    slug: "model-y",
    key: "VEHICLE:model-y",
    title: "Model Y",
    description: "Versatile electric SUV",
    href: "/vehicles/model-y",
    image: "/images/model-y.jpg",
    eyebrow: "Vehicle",
    price: "$49,990",
    priceValue: 49990,
    tokens: ["family", "utility", "range-balanced", "drive-awd"],
    updatedAt: new Date("2026-05-01T00:00:00.000Z"),
  };
}

describe("recommendation ranking", () => {
  it("combines behavioral affinity with manual boosts and popularity", () => {
    const config = mergeRecommendationRankingConfig();
    const profile = createEmptyProfile();
    profile.favoriteSignals.categoryWeights.set("VEHICLE", 1);
    profile.favoriteSignals.tokenWeights.set("family", 2);
    profile.savedBuildSignals.tokenWeights.set("range-balanced", 1.5);

    const result = scoreRecommendationCandidate({
      candidate: createCandidate(),
      config,
      profile,
      currentItemType: "VEHICLE",
      preferredItemTypes: ["VEHICLE"],
      override: {
        itemType: "VEHICLE",
        itemSlug: "model-y",
        pinned: true,
        boostScore: 1.5,
      },
      popularityScore: 24,
      maxPopularityScore: 24,
      now: new Date("2026-05-06T00:00:00.000Z"),
    });

    expect(result.score).toBeGreaterThan(10);
    expect(result.breakdown.reasons).toContain(
      "Because the admin team pinned this item for visibility.",
    );
    expect(
      result.breakdown.components.find((component) => component.id === "favorites-affinity")?.score,
    ).toBeGreaterThan(0);
  });

  it("applies category boosts as a visible score adjustment", () => {
    const config = mergeRecommendationRankingConfig({
      vehicleCategoryBoost: 1.25,
    });
    const result = scoreRecommendationCandidate({
      candidate: createCandidate(),
      config,
      seedCategoryWeights: new Map([["VEHICLE", 3]]),
      seedTokenWeights: new Map([["drive-awd", 2]]),
      now: new Date("2026-05-06T00:00:00.000Z"),
    });

    const categoryBoost = result.breakdown.components.find(
      (component) => component.id === "category-boost",
    );

    expect(categoryBoost?.score).toBeGreaterThan(0);
    expect(result.breakdown.categoryBoostFactor).toBe(1.25);
  });

  it("keeps freshness and popularity normalized", () => {
    expect(normalizePopularityScore(0, 50)).toBe(0);
    expect(normalizePopularityScore(50, 50)).toBe(1);
    expect(getFreshnessScore(new Date("2026-05-05T00:00:00.000Z"), new Date("2026-05-06T00:00:00.000Z"))).toBeGreaterThan(0.9);
    expect(getFreshnessScore(new Date("2025-01-01T00:00:00.000Z"), new Date("2026-05-06T00:00:00.000Z"))).toBe(0);
  });

  it("builds smaller search tie-break adjustments from the same shared signals", () => {
    const config = mergeRecommendationRankingConfig();
    const profile = createEmptyProfile();
    profile.recentSignals.categoryWeights.set("VEHICLE", 1);
    profile.recentSignals.tokenWeights.set("utility", 1);

    const result = scoreSearchDiscoveryAdjustment({
      candidate: createCandidate(),
      config,
      profile,
      override: {
        itemType: "VEHICLE",
        itemSlug: "model-y",
        pinned: false,
        boostScore: 2,
      },
      popularityScore: 12,
      maxPopularityScore: 24,
      now: new Date("2026-05-06T00:00:00.000Z"),
    });

    expect(result.userAffinityScore).toBeGreaterThan(0);
    expect(result.adminBoostScore).toBe(config.searchAdminBoostWeight * 2);
    expect(result.popularityScore).toBeGreaterThan(0);
  });
});
