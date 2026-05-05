import "server-only";

import { cache } from "react";

import { getAllEnergyProducts } from "@/lib/db/energy";
import { getAllShopProducts } from "@/lib/db/shop";
import { getAllVehicles } from "@/lib/db/vehicles";
import {
  mapEnergyProductToSearchCatalogItem,
  mapShopProductToSearchCatalogItem,
  mapVehicleToSearchCatalogItem,
  type SearchCatalogItem,
} from "@/lib/search/fields";
import { filterAndSortCollection, sanitizeSearchQuery } from "@/lib/search/utils";
import type { SearchFilterType, SearchProductType, SearchResultItem, SearchSortOption } from "@/types";

export interface SearchProductsInput {
  query?: string;
  type?: SearchFilterType;
  sort?: SearchSortOption;
  limit?: number;
}

export interface SearchProductsResult {
  query: string;
  type: SearchFilterType;
  sort: SearchSortOption;
  results: SearchResultItem[];
  totalCount: number;
  counts: Record<SearchProductType, number>;
}

const getSearchCatalog = cache(async (): Promise<SearchCatalogItem[]> => {
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
});

function toSearchResultItems(items: SearchCatalogItem[]): SearchResultItem[] {
  return items.map(({ searchableFields: _searchableFields, ...item }) => item);
}

export async function searchProducts({
  query,
  type = "all",
  sort = "relevance",
  limit,
}: SearchProductsInput = {}): Promise<SearchProductsResult> {
  const sanitizedQuery = sanitizeSearchQuery(query);
  const catalog = await getSearchCatalog();
  const matchingCatalog = filterAndSortCollection(
    catalog,
    {
      query: sanitizedQuery,
      sort: "featured",
    },
    (item) => item.searchableFields,
  );
  const counts: Record<SearchProductType, number> = {
    vehicle: 0,
    energy: 0,
    shop: 0,
  };

  for (const item of matchingCatalog) {
    counts[item.type] += 1;
  }

  const scopedCatalog =
    type === "all"
      ? matchingCatalog
      : matchingCatalog.filter((item) => item.type === type);
  const sortedCatalog = filterAndSortCollection(
    scopedCatalog,
    {
      query: sanitizedQuery,
      sort,
      limit,
    },
    (item) => item.searchableFields,
  );

  return {
    query: sanitizedQuery,
    type,
    sort,
    results: toSearchResultItems(sortedCatalog),
    totalCount: scopedCatalog.length,
    counts,
  };
}
