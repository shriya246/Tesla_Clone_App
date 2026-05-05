import { describe, expect, it } from "vitest";

import {
  parseGuestRecentlyViewedItems,
  upsertGuestRecentlyViewedItem,
} from "@/lib/recently-viewed/local";

describe("guest recently viewed helpers", () => {
  it("parses stored history safely", () => {
    expect(parseGuestRecentlyViewedItems(null)).toEqual([]);
    expect(parseGuestRecentlyViewedItems("not-json")).toEqual([]);
  });

  it("deduplicates entries and keeps the newest item first", () => {
    const nextItems = upsertGuestRecentlyViewedItem(
      [
        {
          itemType: "VEHICLE",
          slug: "model-3",
          title: "Model 3",
          description: "Sedan",
          href: "/vehicles/model-3",
          image: "/images/model-3.jpg",
          seenAt: "2026-05-03T00:00:00.000Z",
        },
      ],
      {
        itemType: "VEHICLE",
        slug: "model-3",
        title: "Model 3",
        description: "Sedan",
        href: "/vehicles/model-3",
        image: "/images/model-3.jpg",
      },
      "2026-05-04T00:00:00.000Z",
    );

    expect(nextItems).toHaveLength(1);
    expect(nextItems[0]?.seenAt).toBe("2026-05-04T00:00:00.000Z");
  });
});
