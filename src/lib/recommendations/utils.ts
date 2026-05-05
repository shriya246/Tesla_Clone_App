import type { DetailSpec, SavedBuildSelectedOptions } from "@/types";

import type {
  RecommendationCatalogItem,
  RecommendationItemType,
} from "@/lib/recommendations/types";

const STOP_WORDS = new Set([
  "about",
  "across",
  "after",
  "along",
  "also",
  "and",
  "around",
  "built",
  "clean",
  "daily",
  "design",
  "designed",
  "details",
  "drive",
  "during",
  "each",
  "easy",
  "electric",
  "every",
  "everyday",
  "feel",
  "feels",
  "from",
  "home",
  "into",
  "keep",
  "keeps",
  "like",
  "long",
  "more",
  "most",
  "next",
  "over",
  "part",
  "product",
  "products",
  "ready",
  "road",
  "same",
  "shop",
  "that",
  "their",
  "there",
  "they",
  "this",
  "through",
  "toward",
  "travel",
  "vehicle",
  "vehicles",
  "what",
  "when",
  "with",
  "your",
]);

const TOKEN_ALIASES: Record<string, string> = {
  awd: "allwheel",
  charge: "charging",
  charger: "charging",
  charg: "charging",
  family: "family",
  lifestyle: "lifestyle",
  perform: "performance",
  sport: "performance",
  storag: "storage",
  utilit: "utility",
};

function normalizeToken(value: string) {
  let token = value.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (!token) {
    return null;
  }

  if (token.endsWith("ies") && token.length > 4) {
    token = `${token.slice(0, -3)}y`;
  } else if (token.endsWith("ing") && token.length > 5) {
    token = token.slice(0, -3);
  } else if (token.endsWith("ers") && token.length > 5) {
    token = token.slice(0, -3);
  } else if (token.endsWith("er") && token.length > 4) {
    token = token.slice(0, -2);
  } else if (token.endsWith("ed") && token.length > 4) {
    token = token.slice(0, -2);
  } else if (token.endsWith("es") && token.length > 5) {
    token = token.slice(0, -2);
  } else if (token.endsWith("s") && token.length > 4) {
    token = token.slice(0, -1);
  }

  token = TOKEN_ALIASES[token] ?? token;

  if (STOP_WORDS.has(token)) {
    return null;
  }

  if (/^\d+$/.test(token)) {
    return token;
  }

  return token.length >= 3 ? token : null;
}

function getNumericSpecValue(specs: DetailSpec[], labelFragment: string) {
  const spec = specs.find((entry) =>
    entry.label.toLowerCase().includes(labelFragment.toLowerCase()),
  );

  if (!spec) {
    return null;
  }

  const match = spec.value.match(/(\d+(?:\.\d+)?)/);

  return match ? Number(match[1]) : null;
}

export function addWeight<T extends string>(
  map: Map<T, number>,
  key: T,
  amount: number,
) {
  map.set(key, (map.get(key) ?? 0) + amount);
}

export function buildRecommendationKey(
  itemType: RecommendationItemType,
  slug: string,
) {
  return `${itemType}:${slug}`;
}

export function tokenizeRecommendationText(...parts: Array<string | undefined>) {
  const tokens = new Set<string>();

  for (const part of parts) {
    if (!part) {
      continue;
    }

    for (const rawToken of part.split(/[^a-zA-Z0-9]+/)) {
      const token = normalizeToken(rawToken);

      if (token) {
        tokens.add(token);
      }
    }
  }

  return [...tokens];
}

export function extractVehicleBucketTokens(specs: DetailSpec[]) {
  const tokens = new Set<string>();

  const rangeMiles = getNumericSpecValue(specs, "range");

  if (rangeMiles !== null) {
    tokens.add(
      rangeMiles >= 380
        ? "range-long"
        : rangeMiles >= 330
          ? "range-balanced"
          : "range-daily",
    );
  }

  const zeroToSixty = getNumericSpecValue(specs, "0-60");

  if (zeroToSixty !== null) {
    tokens.add(
      zeroToSixty <= 3.2
        ? "performance-max"
        : zeroToSixty <= 4.5
          ? "performance-quick"
          : "performance-balanced",
    );
  }

  const seating = getNumericSpecValue(specs, "seating");

  if (seating !== null) {
    tokens.add(seating >= 7 ? "utility-family" : "utility-personal");
  }

  const joinedSpecs = specs
    .map((spec) => `${spec.label} ${spec.value}`)
    .join(" ")
    .toLowerCase();

  if (joinedSpecs.includes("awd") || joinedSpecs.includes("all-wheel")) {
    tokens.add("drive-awd");
  }

  if (joinedSpecs.includes("rwd") || joinedSpecs.includes("rear-wheel")) {
    tokens.add("drive-rwd");
  }

  if (
    joinedSpecs.includes("cargo") ||
    joinedSpecs.includes("towing") ||
    joinedSpecs.includes("bed")
  ) {
    tokens.add("utility-cargo");
  }

  return [...tokens];
}

export function extractSavedBuildTokens(
  selectedOptions: SavedBuildSelectedOptions,
) {
  return tokenizeRecommendationText(
    ...Object.values(selectedOptions).flatMap((option) => [
      option.label,
      option.optionLabel,
      option.description,
      option.badge,
    ]),
  );
}

export function buildPriceBandToken(priceValue: number | null) {
  if (priceValue === null) {
    return null;
  }

  if (priceValue >= 70000) {
    return "price-premium";
  }

  if (priceValue >= 35000) {
    return "price-mainstream";
  }

  if (priceValue >= 500) {
    return "price-accessory-plus";
  }

  return "price-accessory";
}

export function getTokenOverlapScore(
  candidateTokens: string[],
  weightedTokens: ReadonlyMap<string, number>,
) {
  let score = 0;

  for (const token of candidateTokens) {
    score += weightedTokens.get(token) ?? 0;
  }

  return score;
}

export function scoreRecommendationCandidate(input: {
  candidate: Pick<RecommendationCatalogItem, "itemType" | "key" | "tokens">;
  currentItemType?: RecommendationItemType;
  preferredItemTypes?: RecommendationItemType[];
  profileCategoryWeights?: ReadonlyMap<RecommendationItemType, number>;
  profileTokenWeights?: ReadonlyMap<string, number>;
  seedCategoryWeights?: ReadonlyMap<RecommendationItemType, number>;
  seedTokenWeights?: ReadonlyMap<string, number>;
  recentKeys?: ReadonlySet<string>;
  favoriteKeys?: ReadonlySet<string>;
}) {
  const preferredTypes = new Set(input.preferredItemTypes ?? []);

  let score = 0;
  score += (input.profileCategoryWeights?.get(input.candidate.itemType) ?? 0) * 1.15;
  score += (input.seedCategoryWeights?.get(input.candidate.itemType) ?? 0) * 1.55;
  score +=
    getTokenOverlapScore(
      input.candidate.tokens,
      input.profileTokenWeights ?? new Map<string, number>(),
    ) * 0.38;
  score +=
    getTokenOverlapScore(
      input.candidate.tokens,
      input.seedTokenWeights ?? new Map<string, number>(),
    ) * 0.72;

  if (input.currentItemType && input.candidate.itemType === input.currentItemType) {
    score += 1.2;
  }

  if (preferredTypes.has(input.candidate.itemType)) {
    score += 0.9;
  }

  if (input.recentKeys?.has(input.candidate.key)) {
    score += 0.2;
  }

  if (input.favoriteKeys?.has(input.candidate.key)) {
    score -= 0.25;
  }

  return score;
}
