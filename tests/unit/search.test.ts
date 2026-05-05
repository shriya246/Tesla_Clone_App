import { describe, expect, it } from "vitest";

import {
  getShopProductSearchFields,
  getVehicleSearchFields,
} from "@/lib/search/fields";
import {
  buildSearchableText,
  filterAndSortCollection,
  parsePriceValue,
  parseSearchSort,
  parseSearchType,
  sanitizeSearchQuery,
} from "@/lib/search/utils";
import type { ShopProductData, VehicleData } from "@/types";

describe("search utilities", () => {
  it("sanitizes query text and preserves words", () => {
    expect(sanitizeSearchQuery("  Model   Y  ")).toBe("Model Y");
  });

  it("parses search type and sort fallbacks", () => {
    expect(parseSearchType("vehicle")).toBe("vehicle");
    expect(parseSearchType("unsupported")).toBe("all");
    expect(parseSearchSort("price-asc", "featured")).toBe("price-asc");
    expect(parseSearchSort("unsupported", "featured")).toBe("featured");
  });

  it("parses formatted prices into sortable numbers", () => {
    expect(parsePriceValue("$74,990")).toBe(74990);
    expect(parsePriceValue("$475")).toBe(475);
    expect(parsePriceValue("Contact for pricing")).toBeNull();
  });

  it("builds searchable text from nested fragments", () => {
    expect(
      buildSearchableText("Model Y", ["Long Range", ["All-Wheel Drive"]]),
    ).toBe("Model Y Long Range All-Wheel Drive");
  });

  it("prioritizes title matches for relevance sorting", () => {
    const items = [
      {
        title: "Wall Connector",
        description: "Home charging solution",
        slug: "wall-connector",
        type: "shop" as const,
        updatedAt: new Date("2026-04-01T10:00:00.000Z"),
      },
      {
        title: "Charging Bundle",
        description: "Includes Wall Connector essentials",
        slug: "charging-bundle",
        type: "shop" as const,
        updatedAt: new Date("2026-04-05T10:00:00.000Z"),
      },
    ];

    const results = filterAndSortCollection(
      items,
      {
        query: "wall connector",
        sort: "relevance",
      },
      (item) => ({
        ...item,
        body: item.description,
      }),
    );

    expect(results.map((item) => item.title)).toEqual([
      "Wall Connector",
      "Charging Bundle",
    ]);
  });

  it("sorts priced items before unpriced items", () => {
    const items = [
      {
        title: "Powerwall",
        description: "Battery storage",
        slug: "powerwall",
        type: "energy" as const,
      },
      {
        title: "Mobile Charger",
        description: "Portable charging",
        slug: "mobile-charger",
        type: "shop" as const,
        price: "$300",
      },
      {
        title: "Wall Connector",
        description: "Home charging",
        slug: "wall-connector",
        type: "shop" as const,
        price: "$475",
      },
    ];

    const results = filterAndSortCollection(
      items,
      {
        sort: "price-asc",
      },
      (item) => ({
        ...item,
        body: item.description,
      }),
    );

    expect(results.map((item) => item.title)).toEqual([
      "Mobile Charger",
      "Wall Connector",
      "Powerwall",
    ]);
  });

  it("creates rich search fields for vehicles and shop products", () => {
    const vehicle: VehicleData = {
      slug: "model-s",
      title: "Model S",
      subtitle: "Flagship sedan",
      longDescription: "A premium EV for long-distance confidence.",
      price: "$74,990",
      image: "/images/model-s.jpg",
      primaryButton: "Order Now",
      secondaryButton: "Learn More",
      specs: [{ label: "Range", value: "405 mi" }],
      highlights: [
        {
          title: "Long-distance confidence",
          description: "Built for range and comfort.",
        },
      ],
    };
    const shopProduct: ShopProductData = {
      slug: "wall-connector",
      title: "Wall Connector",
      description: "Home charging solution",
      longDescription: "A sleek dedicated charger for everyday use.",
      price: "$475",
      image: "/images/wall-connector.jpg",
      primaryButton: "Add to Bag",
      secondaryButton: "Learn More",
      badge: "Best Seller",
      highlights: [
        {
          title: "Home-ready charging",
          description: "Purpose-built for overnight routines.",
        },
      ],
      specs: [{ label: "Use Case", value: "Home charging" }],
    };

    const vehicleFields = getVehicleSearchFields(vehicle);
    const shopFields = getShopProductSearchFields(shopProduct);

    expect(vehicleFields.body).toContain("405 mi");
    expect(vehicleFields.description).toBe("Flagship sedan");
    expect(shopFields.body).toContain("Best Seller");
    expect(shopFields.price).toBe("$475");
  });
});
