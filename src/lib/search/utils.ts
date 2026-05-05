import type { SearchFilterType, SearchProductType, SearchSortOption } from "@/types";

const validSearchTypes = new Set<SearchFilterType>([
  "all",
  "vehicle",
  "energy",
  "shop",
]);

const validSearchSortOptions = new Set<SearchSortOption>([
  "featured",
  "relevance",
  "title",
  "price-asc",
  "price-desc",
  "updated",
]);

export interface SearchableFields {
  type: SearchProductType;
  title: string;
  description?: string;
  body?: string;
  slug?: string;
  price?: string;
  updatedAt?: Date;
}

interface RankedSearchEntry<T> {
  item: T;
  fields: SearchableFields;
  score: number;
  index: number;
}

type TextPart = string | null | undefined | TextPart[];

function flattenTextPart(value: TextPart): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenTextPart);
  }

  const sanitized = sanitizeSearchQuery(value);

  return sanitized ? [sanitized] : [];
}

function normalizeSearchText(value?: string | null) {
  return sanitizeSearchQuery(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchTokens(query: string) {
  return Array.from(
    new Set(normalizeSearchText(query).split(" ").filter(Boolean)),
  );
}

function scoreSearchableFields(fields: SearchableFields, query: string) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return 0;
  }

  const tokens = buildSearchTokens(query);
  const title = normalizeSearchText(fields.title);
  const description = normalizeSearchText(fields.description);
  const body = normalizeSearchText(fields.body);
  const slug = normalizeSearchText(fields.slug?.replace(/-/g, " "));
  const typeLabel = normalizeSearchText(getSearchTypeLabel(fields.type));
  let score = 0;

  if (title === normalizedQuery) {
    score += 140;
  } else if (title.startsWith(normalizedQuery)) {
    score += 100;
  } else if (title.includes(normalizedQuery)) {
    score += 72;
  }

  if (slug === normalizedQuery) {
    score += 90;
  } else if (slug.includes(normalizedQuery)) {
    score += 38;
  }

  if (description.includes(normalizedQuery)) {
    score += 28;
  }

  if (body.includes(normalizedQuery)) {
    score += 16;
  }

  if (typeLabel.includes(normalizedQuery)) {
    score += 8;
  }

  let matchedTokens = 0;

  for (const token of tokens) {
    let tokenMatched = false;

    if (title.includes(token)) {
      score += 18;
      tokenMatched = true;
    }

    if (slug.includes(token)) {
      score += 12;
      tokenMatched = true;
    }

    if (description.includes(token)) {
      score += 8;
      tokenMatched = true;
    }

    if (body.includes(token)) {
      score += 5;
      tokenMatched = true;
    }

    if (typeLabel === token) {
      score += 6;
      tokenMatched = true;
    }

    if (tokenMatched) {
      matchedTokens += 1;
    }
  }

  if (tokens.length > 0 && matchedTokens === tokens.length) {
    score += 12;
  }

  return score;
}

function compareTitles<T>(
  left: RankedSearchEntry<T>,
  right: RankedSearchEntry<T>,
) {
  return left.fields.title.localeCompare(right.fields.title, "en", {
    sensitivity: "base",
  });
}

function compareUpdatedAt<T>(
  left: RankedSearchEntry<T>,
  right: RankedSearchEntry<T>,
) {
  const leftTime = left.fields.updatedAt?.getTime();
  const rightTime = right.fields.updatedAt?.getTime();

  if (typeof leftTime === "number" && typeof rightTime === "number") {
    return rightTime - leftTime;
  }

  if (typeof leftTime === "number") {
    return -1;
  }

  if (typeof rightTime === "number") {
    return 1;
  }

  return compareTitles(left, right);
}

function comparePrices<T>(
  left: RankedSearchEntry<T>,
  right: RankedSearchEntry<T>,
  direction: "asc" | "desc",
) {
  const leftPrice = parsePriceValue(left.fields.price);
  const rightPrice = parsePriceValue(right.fields.price);

  if (leftPrice === null && rightPrice === null) {
    return compareTitles(left, right);
  }

  if (leftPrice === null) {
    return 1;
  }

  if (rightPrice === null) {
    return -1;
  }

  const difference =
    direction === "asc" ? leftPrice - rightPrice : rightPrice - leftPrice;

  return difference || compareTitles(left, right);
}

function compareEntries<T>(
  left: RankedSearchEntry<T>,
  right: RankedSearchEntry<T>,
  sort: SearchSortOption,
) {
  switch (sort) {
    case "title":
      return compareTitles(left, right) || left.index - right.index;
    case "price-asc":
      return comparePrices(left, right, "asc") || left.index - right.index;
    case "price-desc":
      return comparePrices(left, right, "desc") || left.index - right.index;
    case "updated":
      return compareUpdatedAt(left, right) || left.index - right.index;
    case "relevance": {
      const scoreDifference = right.score - left.score;

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return (
        compareUpdatedAt(left, right) ||
        compareTitles(left, right) ||
        left.index - right.index
      );
    }
    case "featured":
    default:
      return left.index - right.index;
  }
}

export function sanitizeSearchQuery(value?: string | null) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

export function buildSearchableText(...parts: TextPart[]) {
  return parts.flatMap(flattenTextPart).join(" ");
}

export function getSearchTypeLabel(type: SearchProductType) {
  switch (type) {
    case "vehicle":
      return "Vehicle";
    case "energy":
      return "Energy";
    case "shop":
      return "Shop";
    default:
      return "Product";
  }
}

export function parseSearchType(
  value?: string | null,
  fallback: SearchFilterType = "all",
): SearchFilterType {
  if (value && validSearchTypes.has(value as SearchFilterType)) {
    return value as SearchFilterType;
  }

  return fallback;
}

export function parseSearchSort(
  value?: string | null,
  fallback: SearchSortOption = "relevance",
): SearchSortOption {
  if (value && validSearchSortOptions.has(value as SearchSortOption)) {
    return value as SearchSortOption;
  }

  return fallback;
}

export function parsePriceValue(value?: string | null) {
  const normalized = value?.replace(/[^0-9.]/g, "");

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function filterAndSortCollection<T>(
  items: readonly T[],
  input: {
    query?: string;
    sort?: SearchSortOption;
    limit?: number;
  },
  getFields: (item: T) => SearchableFields,
) {
  const query = sanitizeSearchQuery(input.query);
  const sort = input.sort ?? "featured";
  const rankedEntries = items.map((item, index) => {
    const fields = getFields(item);

    return {
      item,
      fields,
      score: scoreSearchableFields(fields, query),
      index,
    };
  });

  const filteredEntries = query
    ? rankedEntries.filter((entry) => entry.score > 0)
    : rankedEntries;

  filteredEntries.sort((left, right) => compareEntries(left, right, sort));

  if (typeof input.limit === "number") {
    return filteredEntries.slice(0, input.limit).map((entry) => entry.item);
  }

  return filteredEntries.map((entry) => entry.item);
}
