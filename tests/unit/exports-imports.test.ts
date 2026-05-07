import { describe, expect, it } from "vitest";

import { serializeCsv } from "@/lib/exports/csv";
import { findDuplicateProductImportKeys } from "@/lib/imports/products";

describe("exports and imports foundation", () => {
  it("serializes CSV with escaped commas, quotes, and line breaks", () => {
    const csv = serializeCsv(
      [
        { key: "slug", label: "Slug" },
        { key: "description", label: "Description" },
      ],
      [
        {
          slug: "model-y",
          description: 'Family-focused, "fast"\nsecond line',
        },
      ],
    );

    expect(csv).toContain("Slug,Description");
    expect(csv).toContain('"Family-focused, ""fast""');
  });

  it("detects duplicate product import keys by item type and slug", () => {
    const duplicates = findDuplicateProductImportKeys([
      {
        itemType: "VEHICLE",
        title: "Model Y",
        slug: "model-y",
        image: "/images/model-y.jpg",
        subtitle: "Versatile utility",
        description: "Electric SUV",
        price: "$49,990",
        primaryButton: "Order Now",
        secondaryButton: "Learn More",
        specs: [],
        highlights: [],
      },
      {
        itemType: "VEHICLE",
        title: "Model Y Refresh",
        slug: "model-y",
        image: "/images/model-y-refresh.jpg",
        subtitle: "Updated utility",
        description: "Electric SUV refresh",
        price: "$51,990",
        primaryButton: "Order Now",
        secondaryButton: "Learn More",
        specs: [],
        highlights: [],
      },
    ]);

    expect(duplicates).toEqual(["VEHICLE:model-y"]);
  });
});
