export const cacheTags = {
  account: "account",
  adminInsights: "admin-insights",
  catalog: "catalog",
  energyProducts: "catalog:energy-products",
  productRanking: "product-ranking",
  recommendations: "recommendations",
  search: "search",
  shopProducts: "catalog:shop-products",
  vehicles: "catalog:vehicles",
} as const;

export const cacheRevalidateSeconds = {
  accountSummary: 30,
  adminInsights: 60,
  catalog: 300,
  recommendations: 120,
  search: 90,
} as const;

export function getProductCatalogTags(itemType?: string | null) {
  const tags = new Set<string>([cacheTags.catalog]);

  if (itemType === "VEHICLE") {
    tags.add(cacheTags.vehicles);
  }

  if (itemType === "ENERGY_PRODUCT") {
    tags.add(cacheTags.energyProducts);
  }

  if (itemType === "SHOP_PRODUCT") {
    tags.add(cacheTags.shopProducts);
  }

  return [...tags];
}

export function getProductMutationCacheTags(itemType?: string | null) {
  return [
    ...getProductCatalogTags(itemType),
    cacheTags.account,
    cacheTags.adminInsights,
    cacheTags.productRanking,
    cacheTags.recommendations,
    cacheTags.search,
  ];
}

export function getRankingCacheTags() {
  return [
    cacheTags.account,
    cacheTags.adminInsights,
    cacheTags.productRanking,
    cacheTags.recommendations,
    cacheTags.search,
  ];
}
