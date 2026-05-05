import { describe, expect, it } from "vitest";

import {
  buildAdminInsightProductKey,
  createEmptyAdminProductEngagement,
} from "@/lib/admin-insights/catalog";
import {
  averageFromTotal,
  buildRecentDayBuckets,
  compareNumbersDesc,
} from "@/lib/admin-insights/utils";

describe("admin insight utilities", () => {
  it("builds stable product insight keys", () => {
    expect(buildAdminInsightProductKey("VEHICLE", "model-y")).toBe(
      "VEHICLE:model-y",
    );
  });

  it("creates empty engagement metrics with zeroed counters", () => {
    expect(createEmptyAdminProductEngagement()).toEqual({
      views: 0,
      favorites: 0,
      savedBuilds: 0,
      inquiries: 0,
      totalSignals: 0,
      weightedScore: 0,
    });
  });

  it("builds recent day buckets and averages safely", () => {
    const buckets = buildRecentDayBuckets(14);

    expect(buckets).toHaveLength(14);
    expect(buckets.every((bucket) => bucket.count === 0)).toBe(true);
    expect(averageFromTotal(9, 2)).toBe(4.5);
    expect(averageFromTotal(0, 0)).toBe(0);
  });

  it("sorts counts in descending order", () => {
    expect(compareNumbersDesc(3, 8)).toBe(5);
  });
});
