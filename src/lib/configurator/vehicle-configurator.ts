import type {
  SavedBuildSelectedOptions,
  VehicleBuildSelectionIds,
  VehicleConfiguratorDefinition,
  VehicleConfiguratorOption,
  VehicleConfiguratorOptionGroup,
  VehicleConfiguratorState,
  VehicleData,
} from "@/types";
import { parsePriceValue } from "@/lib/search/utils";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function createTrimOptions(
  options: Array<{
    id: string;
    label: string;
    description: string;
    priceDelta: number;
    badge?: string;
  }>,
) {
  return options.map((option) => ({
    ...option,
  }));
}

const sharedExteriorOptions: VehicleConfiguratorOption[] = [
  {
    id: "stealth-grey",
    label: "Stealth Grey",
    description: "A deep graphite finish that keeps the silhouette understated.",
    priceDelta: 0,
    swatch: "#5f666e",
  },
  {
    id: "pearl-white",
    label: "Pearl White Multi-Coat",
    description: "A bright premium white with more depth in changing light.",
    priceDelta: 1500,
    swatch: "#f4f4f2",
  },
  {
    id: "deep-blue",
    label: "Deep Blue Metallic",
    description: "A cool metallic blue that shifts elegantly through the day.",
    priceDelta: 1500,
    swatch: "#223b61",
  },
  {
    id: "ultra-red",
    label: "Ultra Red",
    description: "A richer red finish tuned for contrast and road presence.",
    priceDelta: 2000,
    swatch: "#7d1018",
  },
  {
    id: "solid-black",
    label: "Solid Black",
    description: "A darker monochrome look with a more dramatic stance.",
    priceDelta: 1500,
    swatch: "#0f1012",
  },
];

const sharedInteriorOptions: VehicleConfiguratorOption[] = [
  {
    id: "all-black",
    label: "All Black",
    description: "A focused, performance-forward cabin with minimal distraction.",
    priceDelta: 0,
  },
  {
    id: "black-and-white",
    label: "Black and White",
    description: "A brighter premium cabin with more contrast across the dash and seats.",
    priceDelta: 1000,
  },
  {
    id: "cream",
    label: "Cream",
    description: "A warmer interior palette designed to feel calmer and more lounge-like.",
    priceDelta: 1500,
  },
];

const vehicleSpecificGroups: Record<
  string,
  Pick<
    Record<VehicleConfiguratorOptionGroup["key"], VehicleConfiguratorOption[]>,
    "trim" | "range"
  >
> = {
  "model-s": {
    trim: createTrimOptions([
      {
        id: "dual-motor-awd",
        label: "Dual Motor AWD",
        description: "Balanced long-distance capability with premium grand-touring character.",
        priceDelta: 0,
      },
      {
        id: "plaid",
        label: "Plaid",
        description: "Higher-output tri-motor setup for maximum acceleration and drama.",
        priceDelta: 15000,
        badge: "Performance",
      },
    ]),
    range: [
      {
        id: "touring-range",
        label: "Touring Range Setup",
        description: "Prioritizes long-range confidence and calmer daily efficiency.",
        priceDelta: 0,
      },
      {
        id: "dynamic-response",
        label: "Dynamic Response Package",
        description: "Sharper chassis feel and acceleration-biased tuning for spirited use.",
        priceDelta: 6500,
      },
    ],
  },
  "model-3": {
    trim: createTrimOptions([
      {
        id: "rear-wheel-drive",
        label: "Rear-Wheel Drive",
        description: "The cleanest, most efficient entry into the Tesla-inspired lineup.",
        priceDelta: 0,
      },
      {
        id: "long-range-awd",
        label: "Long Range AWD",
        description: "Adds all-weather confidence and more daily flexibility.",
        priceDelta: 9000,
      },
      {
        id: "performance",
        label: "Performance",
        description: "A sharper setup tuned for faster response and more visual intent.",
        priceDelta: 14500,
        badge: "Track Inspired",
      },
    ]),
    range: [
      {
        id: "daily-range",
        label: "Daily Range Focus",
        description: "Keeps the configuration efficient for commuting and regular road trips.",
        priceDelta: 0,
      },
      {
        id: "acceleration-boost",
        label: "Acceleration Boost",
        description: "Adds more immediacy to launches without changing the overall cabin feel.",
        priceDelta: 2000,
      },
    ],
  },
  "model-x": {
    trim: createTrimOptions([
      {
        id: "all-wheel-drive",
        label: "All-Wheel Drive",
        description: "Three-row utility with strong range and everyday confidence.",
        priceDelta: 0,
      },
      {
        id: "plaid",
        label: "Plaid",
        description: "Maximum output with a more dramatic top-end performance character.",
        priceDelta: 18000,
        badge: "Performance",
      },
    ]),
    range: [
      {
        id: "family-touring",
        label: "Family Touring Setup",
        description: "Optimized for calmer road-trip behavior and passenger comfort.",
        priceDelta: 0,
      },
      {
        id: "active-lifestyle",
        label: "Active Lifestyle Setup",
        description: "Leans into quicker response and more assertive road manners.",
        priceDelta: 5000,
      },
    ],
  },
  "model-y": {
    trim: createTrimOptions([
      {
        id: "long-range-awd",
        label: "Long Range AWD",
        description: "Versatile all-weather configuration with broad everyday appeal.",
        priceDelta: 0,
      },
      {
        id: "performance",
        label: "Performance",
        description: "A more aggressive setup that gives the crossover a stronger edge.",
        priceDelta: 7000,
        badge: "Performance",
      },
    ]),
    range: [
      {
        id: "range-priority",
        label: "Range Priority",
        description: "Best suited to longer family drives and more efficient weekly use.",
        priceDelta: 0,
      },
      {
        id: "sport-priority",
        label: "Sport Priority",
        description: "Adds faster response and a more alert driving feel.",
        priceDelta: 3000,
      },
    ],
  },
  cybertruck: {
    trim: createTrimOptions([
      {
        id: "all-wheel-drive",
        label: "All-Wheel Drive",
        description: "The practical all-electric truck setup for utility and travel.",
        priceDelta: 0,
      },
      {
        id: "cyberbeast",
        label: "Cyberbeast",
        description: "Higher-output configuration with a more extreme performance bent.",
        priceDelta: 20000,
        badge: "Flagship",
      },
    ]),
    range: [
      {
        id: "adventure-range",
        label: "Adventure Range Pack",
        description: "Supports longer weekend trips, towing plans, and gear-heavy travel.",
        priceDelta: 0,
      },
      {
        id: "performance-pack",
        label: "Performance Pack",
        description: "Shifts the character toward faster response and stronger launch feel.",
        priceDelta: 4000,
      },
    ],
  },
};

const fallbackTrimOptions = createTrimOptions([
  {
    id: "standard",
    label: "Standard",
    description: "A balanced Tesla-inspired setup tuned for everyday ownership.",
    priceDelta: 0,
  },
  {
    id: "upgraded",
    label: "Upgraded",
    description: "Adds more premium touches and a stronger performance stance.",
    priceDelta: 6000,
  },
]);

const fallbackRangeOptions: VehicleConfiguratorOption[] = [
  {
    id: "range",
    label: "Range Focus",
    description: "Keeps the build oriented around long-distance comfort and efficiency.",
    priceDelta: 0,
  },
  {
    id: "performance",
    label: "Performance Focus",
    description: "Leans into quicker response, sharper character, and stronger acceleration.",
    priceDelta: 3500,
  },
];

function formatUsd(value: number) {
  return currencyFormatter.format(Math.max(0, Math.round(value)));
}

function getRequiredFirstOptionId(group: VehicleConfiguratorOptionGroup) {
  const firstOption = group.options[0];

  if (!firstOption) {
    throw new Error(`Configurator group "${group.key}" is missing options.`);
  }

  return firstOption.id;
}

export function getVehicleConfiguratorDefinition(
  vehicle: VehicleData,
): VehicleConfiguratorDefinition {
  const vehiclePrice = vehicle.price ?? "Pricing available on request";
  const basePriceValue = parsePriceValue(vehiclePrice) ?? 0;
  const vehicleGroups = vehicleSpecificGroups[vehicle.slug] ?? {
    trim: fallbackTrimOptions,
    range: fallbackRangeOptions,
  };
  const groups: VehicleConfiguratorOptionGroup[] = [
    {
      key: "trim",
      label: "Trim",
      description: "Choose the variant that best fits your intended ownership experience.",
      options: vehicleGroups.trim,
    },
    {
      key: "range",
      label: "Range & Performance",
      description: "Tune the build around longer travel confidence or a sharper character.",
      options: vehicleGroups.range,
    },
    {
      key: "exteriorColor",
      label: "Exterior Color",
      description: "Pick a finish that matches the silhouette and presence you want.",
      options: sharedExteriorOptions,
    },
    {
      key: "interior",
      label: "Interior",
      description: "Set the cabin mood with a focused or brighter premium interior.",
      options: sharedInteriorOptions,
    },
  ];

  return {
    vehicleSlug: vehicle.slug,
    vehicleTitle: vehicle.title,
    vehicleSubtitle: vehicle.subtitle,
    vehicleImage: vehicle.image,
    vehiclePrice,
    basePriceValue,
    groups,
    defaultSelectionIds: {
      trim: getRequiredFirstOptionId(groups[0]!),
      range: getRequiredFirstOptionId(groups[1]!),
      exteriorColor: getRequiredFirstOptionId(groups[2]!),
      interior: getRequiredFirstOptionId(groups[3]!),
    },
  };
}

function getOptionById(
  definition: VehicleConfiguratorDefinition,
  groupKey: VehicleConfiguratorOptionGroup["key"],
  optionId?: string,
) {
  const group = definition.groups.find((entry) => entry.key === groupKey);

  if (!group) {
    return null;
  }

  return (
    group.options.find((option) => option.id === optionId) ?? group.options[0] ?? null
  );
}

export function resolveVehicleConfiguratorState(
  definition: VehicleConfiguratorDefinition,
  selectionIds?: Partial<VehicleBuildSelectionIds>,
): VehicleConfiguratorState {
  const trim = getOptionById(
    definition,
    "trim",
    selectionIds?.trim ?? definition.defaultSelectionIds.trim,
  );
  const range = getOptionById(
    definition,
    "range",
    selectionIds?.range ?? definition.defaultSelectionIds.range,
  );
  const exteriorColor = getOptionById(
    definition,
    "exteriorColor",
    selectionIds?.exteriorColor ?? definition.defaultSelectionIds.exteriorColor,
  );
  const interior = getOptionById(
    definition,
    "interior",
    selectionIds?.interior ?? definition.defaultSelectionIds.interior,
  );

  if (!trim || !range || !exteriorColor || !interior) {
    throw new Error("Vehicle configurator options could not be resolved.");
  }

  const selectedOptions: SavedBuildSelectedOptions = {
    trim: {
      key: "trim",
      label: "Trim",
      optionId: trim.id,
      optionLabel: trim.label,
      description: trim.description,
      priceDelta: trim.priceDelta,
      badge: trim.badge,
    },
    range: {
      key: "range",
      label: "Range & Performance",
      optionId: range.id,
      optionLabel: range.label,
      description: range.description,
      priceDelta: range.priceDelta,
      badge: range.badge,
    },
    exteriorColor: {
      key: "exteriorColor",
      label: "Exterior Color",
      optionId: exteriorColor.id,
      optionLabel: exteriorColor.label,
      description: exteriorColor.description,
      priceDelta: exteriorColor.priceDelta,
      swatch: exteriorColor.swatch,
      badge: exteriorColor.badge,
    },
    interior: {
      key: "interior",
      label: "Interior",
      optionId: interior.id,
      optionLabel: interior.label,
      description: interior.description,
      priceDelta: interior.priceDelta,
      badge: interior.badge,
    },
  };
  const estimatedPriceValue =
    definition.basePriceValue +
    Object.values(selectedOptions).reduce(
      (total, option) => total + option.priceDelta,
      0,
    );

  return {
    selectionIds: {
      trim: trim.id,
      range: range.id,
      exteriorColor: exteriorColor.id,
      interior: interior.id,
    },
    selectedOptions,
    estimatedPrice: formatUsd(estimatedPriceValue),
    estimatedPriceValue,
  };
}

export function getSelectionIdsFromSavedBuild(
  selectedOptions: SavedBuildSelectedOptions,
): VehicleBuildSelectionIds {
  return {
    trim: selectedOptions.trim.optionId,
    range: selectedOptions.range.optionId,
    exteriorColor: selectedOptions.exteriorColor.optionId,
    interior: selectedOptions.interior.optionId,
  };
}

export function calculateSavedBuildEstimatedPrice(
  vehiclePrice: string,
  selectedOptions: SavedBuildSelectedOptions,
) {
  const basePriceValue = parsePriceValue(vehiclePrice) ?? 0;
  const total =
    basePriceValue +
    Object.values(selectedOptions).reduce(
      (sum, option) => sum + option.priceDelta,
      0,
    );

  return formatUsd(total);
}
