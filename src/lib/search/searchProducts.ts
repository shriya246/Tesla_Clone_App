import "server-only";

import { cacheRevalidateSeconds, cacheTags, createCachedQuery } from "@/lib/cache";
import { getAllEnergyProducts } from "@/lib/db/energy";
import { getAllShopProducts } from "@/lib/db/shop";
import { getAllVehicles } from "@/lib/db/vehicles";
import {
  mapEnergyProductToSearchCatalogItem,
  mapShopProductToSearchCatalogItem,
  mapVehicleToSearchCatalogItem,
  type SearchCatalogItem,
} from "@/lib/search/fields";
import { getRecommendationRankingContext } from "@/lib/recommendations/ranking";
import { scoreSearchDiscoveryAdjustment } from "@/lib/recommendations/scoreItem";
import {
  filterAndSortCollection,
  sanitizeSearchQuery,
  scoreSearchableFields,
} from "@/lib/search/utils";
import type { SearchFilterType, SearchProductType, SearchResultItem, SearchSortOption } from "@/types";

export interface SearchProductsInput {
  query?: string;
  type?: SearchFilterType;
  sort?: SearchSortOption;
  limit?: number;
  userId?: string | null;
}

export interface SearchProductsResult {
  query: string;
  type: SearchFilterType;
  sort: SearchSortOption;
  results: SearchResultItem[];
  totalCount: number;
  counts: Record<SearchProductType, number>;
}

const getSearchCatalog = createCachedQuery(async (): Promise<SearchCatalogItem[]> => {
  const [vehicles, energyProducts, shopProducts] = await Promise.all([
    getAllVehicles(),
    getAllEnergyProducts(),
    getAllShopProducts(),
  ]);

  return [
    ...vehicles.map(mapVehicleToSearchCatalogItem),
    ...energyProducts.map(mapEnergyProductToSearchCatalogItem),
    ...shopProducts.map(mapShopProductToSearchCatalogItem),
  ];
}, ["search:catalog:v2"], {
  revalidate: cacheRevalidateSeconds.search,
  tags: [cacheTags.catalog, cacheTags.search],
});

function toSearchResultItems(items: SearchCatalogItem[]): SearchResultItem[] {
  return items.map(
    ({
      searchableFields: _searchableFields,
      itemType: _itemType,
      key: _key,
      tokens: _tokens,
      ...item
    }) => item,
  );
}

async function searchProductsUncached({
  query,
  type = "all",
  sort = "relevance",
  limit,
  userId,
}: SearchProductsInput = {}): Promise<SearchProductsResult> {
  const sanitizedQuery = sanitizeSearchQuery(query);
  const catalog = await getSearchCatalog();
  const matchingEntries = catalog
    .map((item) => ({
      item,
      textScore: scoreSearchableFields(item.searchableFields, sanitizedQuery),
    }))
    .filter((entry) => (sanitizedQuery ? entry.textScore > 0 : true));
  const counts: Record<SearchProductType, number> = {
    vehicle: 0,
    energy: 0,
    shop: 0,
  };

  for (const entry of matchingEntries) {
    counts[entry.item.type] += 1;
  }

  const scopedEntries =
    type === "all"
      ? matchingEntries
      : matchingEntries.filter((entry) => entry.item.type === type);
  const scopedCatalog = scopedEntries.map((entry) => entry.item);
  const usesConfigurableRanking = sort === "featured" || sort === "relevance";
  let sortedCatalog: SearchCatalogItem[];

  if (!usesConfigurableRanking) {
    sortedCatalog = filterAndSortCollection(
      scopedCatalog,
      {
        query: sanitizedQuery,
        sort,
        limit,
      },
      (item) => item.searchableFields,
    );
  } else {
    const rankingContext = await getRecommendationRankingContext({
      userId,
    });

    sortedCatalog = scopedEntries
      .map((entry, index) => {
        const adjustments = scoreSearchDiscoveryAdjustment({
          candidate: {
            itemType: entry.item.itemType,
            tokens: entry.item.tokens,
            updatedAt: entry.item.updatedAt,
          },
          config: rankingContext.config,
          profile: rankingContext.profile,
          override: rankingContext.overrideMap.get(entry.item.key) ?? null,
          popularityScore:
            rankingContext.popularityScoreMap.get(entry.item.key) ?? 0,
          maxPopularityScore: rankingContext.maxPopularityScore,
          now: rankingContext.now,
        });
        const auxiliaryScore =
          adjustments.userAffinityScore +
          adjustments.popularityScore +
          adjustments.freshnessScore +
          adjustments.adminBoostScore +
          adjustments.pinnedScore +
          adjustments.categoryBoostScore;
        const totalScore = sanitizedQuery
          ? entry.textScore + auxiliaryScore
          : auxiliaryScore;

        return {
          item: entry.item,
          textScore: entry.textScore,
          auxiliaryScore,
          totalScore,
          index,
        };
      })
      .sort((left, right) => {
        if (right.totalScore !== left.totalScore) {
          return right.totalScore - left.totalScore;
        }

        if (sanitizedQuery && right.textScore !== left.textScore) {
          return right.textScore - left.textScore;
        }

        if (
          left.item.updatedAt instanceof Date &&
          right.item.updatedAt instanceof Date &&
          right.item.updatedAt.getTime() !== left.item.updatedAt.getTime()
        ) {
          return right.item.updatedAt.getTime() - left.item.updatedAt.getTime();
        }

        if (left.item.title !== right.item.title) {
          return left.item.title.localeCompare(right.item.title);
        }

        return left.index - right.index;
      })
      .slice(0, typeof limit === "number" ? limit : undefined)
      .map((entry) => entry.item);
  }

  return {
    query: sanitizedQuery,
    type,
    sort,
    results: toSearchResultItems(sortedCatalog),
    totalCount: scopedEntries.length,
    counts,
  };
}

const searchAnonymousProductsCached = createCachedQuery(
  async (input: Omit<SearchProductsInput, "userId">) =>
    searchProductsUncached({
      ...input,
      userId: null,
    }),
  ["search:anonymous-products:v2"],
  {
    revalidate: cacheRevalidateSeconds.search,
    tags: [
      cacheTags.catalog,
      cacheTags.productRanking,
      cacheTags.recommendations,
      cacheTags.search,
    ],
  },
);

export async function searchProducts(
  input: SearchProductsInput = {},
): Promise<SearchProductsResult> {
  if (input.userId) {
    return searchProductsUncached(input);
  }

  return searchAnonymousProductsCached({
    query: input.query,
    type: input.type ?? "all",
    sort: input.sort ?? "relevance",
    limit: input.limit,
  });
}
