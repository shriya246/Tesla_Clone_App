import { describe, expect, it } from "vitest";

import {
  calculateSavedBuildEstimatedPrice,
  getSelectionIdsFromSavedBuild,
  getVehicleConfiguratorDefinition,
  resolveVehicleConfiguratorState,
} from "@/lib/configurator/vehicle-configurator";
import type { VehicleData } from "@/types";

const vehicleFixture: VehicleData = {
  slug: "model-y",
  title: "Model Y",
  subtitle: "Versatile electric crossover",
  longDescription: "A flexible daily EV with room for family and gear.",
  price: "$43,990",
  image: "/images/model-y.jpg",
  primaryButton: "Order Now",
  secondaryButton: "Learn More",
  specs: [
    { label: "Range", value: "330 mi" },
    { label: "Seating", value: "Up to 7" },
  ],
  highlights: [
    {
      title: "Travel-ready versatility",
      description: "Built for daily use and weekends away.",
    },
  ],
};

describe("vehicle configurator", () => {
  it("builds a default definition and resolves selections", () => {
    const definition = getVehicleConfiguratorDefinition(vehicleFixture);
    const state = resolveVehicleConfiguratorState(definition);

    expect(definition.vehicleSlug).toBe("model-y");
    expect(definition.groups).toHaveLength(4);
    expect(state.selectionIds.trim).toBe("long-range-awd");
    expect(state.selectedOptions.exteriorColor.optionLabel).toBe("Stealth Grey");
  });

  it("calculates estimated pricing from selected options", () => {
    const definition = getVehicleConfiguratorDefinition(vehicleFixture);
    const state = resolveVehicleConfiguratorState(definition, {
      trim: "performance",
      range: "sport-priority",
      exteriorColor: "ultra-red",
      interior: "cream",
    });

    expect(state.estimatedPrice).toBe("$57,490");
    expect(
      calculateSavedBuildEstimatedPrice(
        vehicleFixture.price ?? "$0",
        state.selectedOptions,
      ),
    ).toBe("$57,490");
  });

  it("reconstructs selection ids from a saved build snapshot", () => {
    const definition = getVehicleConfiguratorDefinition(vehicleFixture);
    const state = resolveVehicleConfiguratorState(definition, {
      trim: "performance",
      range: "sport-priority",
      exteriorColor: "deep-blue",
      interior: "black-and-white",
    });

    expect(getSelectionIdsFromSavedBuild(state.selectedOptions)).toEqual({
      trim: "performance",
      range: "sport-priority",
      exteriorColor: "deep-blue",
      interior: "black-and-white",
    });
  });
});
