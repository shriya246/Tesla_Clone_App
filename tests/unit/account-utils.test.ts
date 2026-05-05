import { describe, expect, it } from "vitest";

import {
  getInquiryContextTitle,
  getMessagePreview,
  getProductHrefForItem,
  sortBuildsForVehicleContinuity,
} from "@/lib/account/utils";
import type { SavedBuildData } from "@/types";

function createSavedBuild(
  id: string,
  vehicleSlug: string,
  updatedAt: string,
): SavedBuildData {
  return {
    id,
    userId: "user_123",
    vehicleSlug,
    vehicleTitle: vehicleSlug.toUpperCase(),
    vehicleImage: "/images/test.jpg",
    vehiclePrice: "$49,990",
    buildLabel: `${vehicleSlug} build`,
    selectedOptions: {
      trim: {
        key: "trim",
        label: "Trim",
        optionId: "trim-long-range",
        optionLabel: "Long Range",
        description: "Long range configuration",
        priceDelta: 0,
      },
      range: {
        key: "range",
        label: "Range",
        optionId: "range-extended",
        optionLabel: "Extended Range",
        description: "Extended battery range",
        priceDelta: 3000,
      },
      exteriorColor: {
        key: "exteriorColor",
        label: "Exterior",
        optionId: "stealth-grey",
        optionLabel: "Stealth Grey",
        description: "Dark premium finish",
        priceDelta: 0,
      },
      interior: {
        key: "interior",
        label: "Interior",
        optionId: "black",
        optionLabel: "All Black",
        description: "Black interior",
        priceDelta: 0,
      },
    },
    createdAt: new Date("2026-05-01T00:00:00.000Z"),
    updatedAt: new Date(updatedAt),
    estimatedPrice: "$52,990",
    buildHref: `/account/builds/${id}`,
    configureHref: `/vehicles/${vehicleSlug}/configure?build=${id}`,
  };
}

describe("account continuity utilities", () => {
  it("maps product item types to public detail routes", () => {
    expect(getProductHrefForItem("VEHICLE", "model-y")).toBe(
      "/vehicles/model-y",
    );
    expect(getProductHrefForItem("ENERGY_PRODUCT", "powerwall")).toBe(
      "/energy/powerwall",
    );
    expect(getProductHrefForItem("SHOP_PRODUCT", "wall-connector")).toBe(
      "/shop/wall-connector",
    );
  });

  it("builds readable inquiry titles and trims long message previews", () => {
    expect(
      getInquiryContextTitle({
        typeLabel: "Product inquiry",
        catalogTitle: "Wall Connector",
      }),
    ).toBe("Product inquiry for Wall Connector");

    const preview = getMessagePreview(
      "This is a long inquiry message that should be shortened for account history previews without losing the main point.",
      42,
    );

    expect(preview).toHaveLength(42);
    expect(preview.endsWith("...")).toBe(true);
  });

  it("prioritizes builds from the active vehicle before other saved builds", () => {
    const builds = [
      createSavedBuild("build_a", "model-3", "2026-05-03T00:00:00.000Z"),
      createSavedBuild("build_b", "model-y", "2026-05-01T00:00:00.000Z"),
      createSavedBuild("build_c", "model-y", "2026-05-04T00:00:00.000Z"),
    ];

    const sorted = sortBuildsForVehicleContinuity(builds, "model-y");

    expect(sorted.map((build) => build.id)).toEqual([
      "build_c",
      "build_b",
      "build_a",
    ]);
  });
});
