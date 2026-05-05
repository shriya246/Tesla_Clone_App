import { describe, expect, it } from "vitest";

import type { RecommendationCatalogItem } from "@/lib/recommendations/types";
import {
  buildRecommendationKey,
  extractVehicleBucketTokens,
  scoreRecommendationCandidate,
  tokenizeRecommendationText,
} from "@/lib/recommendations/utils";

function createCandidate(
  input: Pick<RecommendationCatalogItem, "itemType" | "key" | "tokens">,
) {
  return input;
}

describe("recommendation utilities", () => {
  it("normalizes recommendation text into useful discovery tokens", () => {
    const tokens = tokenizeRecommendationText(
      "Charging Bundle built for home and away",
      "Portable chargers and travel-ready utility",
    );

    expect(tokens).toContain("charging");
    expect(tokens).toContain("bundle");
    expect(tokens).toContain("portable");
    expect(tokens).toContain("utility");
    expect(tokens).not.toContain("home");
    expect(tokens).not.toContain("built");
  });

  it("derives range, performance, and utility buckets from vehicle specs", () => {
    const tokens = extractVehicleBucketTokens([
      { label: "Range", value: "Up to 405 mi" },
      { label: "0-60 mph", value: "3.8 sec" },
      { label: "Drive", value: "Available AWD" },
      { label: "Seating", value: "Up to 7" },
      { label: "Cargo", value: "Flexible rear storage" },
    ]);

    expect(tokens).toEqual(
      expect.arrayContaining([
        "range-long",
        "performance-quick",
        "drive-awd",
        "utility-family",
        "utility-cargo",
      ]),
    );
  });

  it("scores catalog candidates higher when they align with active user and item context", () => {
    const profileCategoryWeights = new Map([
      ["VEHICLE", 4],
      ["SHOP_PRODUCT", 1],
    ] as const);
    const profileTokenWeights = new Map([
      ["range-long", 3],
      ["performance-quick", 2],
      ["family", 1],
    ]);
    const seedCategoryWeights = new Map([["VEHICLE", 4]] as const);
    const seedTokenWeights = new Map([
      ["range-long", 4],
      ["performance-quick", 3],
    ]);

    const vehicleCandidate = createCandidate({
      itemType: "VEHICLE",
      key: buildRecommendationKey("VEHICLE", "model-s"),
      tokens: ["range-long", "performance-quick", "family"],
    });
    const accessoryCandidate = createCandidate({
      itemType: "SHOP_PRODUCT",
      key: buildRecommendationKey("SHOP_PRODUCT", "wall-connector"),
      tokens: ["charging", "home"],
    });

    const vehicleScore = scoreRecommendationCandidate({
      candidate: vehicleCandidate,
      currentItemType: "VEHICLE",
      preferredItemTypes: ["VEHICLE"],
      profileCategoryWeights,
      profileTokenWeights,
      seedCategoryWeights,
      seedTokenWeights,
    });
    const accessoryScore = scoreRecommendationCandidate({
      candidate: accessoryCandidate,
      currentItemType: "VEHICLE",
      preferredItemTypes: ["VEHICLE"],
      profileCategoryWeights,
      profileTokenWeights,
      seedCategoryWeights,
      seedTokenWeights,
    });

    expect(vehicleScore).toBeGreaterThan(accessoryScore);
  });
});
