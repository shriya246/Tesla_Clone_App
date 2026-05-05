import type { SearchFilterType, SearchSortOption } from "@/types";

export const searchTypeOptions: Array<{
  value: SearchFilterType;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "vehicle", label: "Vehicles" },
  { value: "energy", label: "Energy" },
  { value: "shop", label: "Shop" },
];

export const globalSearchSortOptions: Array<{
  value: SearchSortOption;
  label: string;
}> = [
  { value: "relevance", label: "Relevance" },
  { value: "title", label: "Title" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "updated", label: "Newest" },
];

export const catalogSortOptions: Array<{
  value: SearchSortOption;
  label: string;
}> = [
  { value: "featured", label: "Featured" },
  { value: "title", label: "Title" },
  { value: "updated", label: "Newest" },
];

export const pricedCatalogSortOptions: Array<{
  value: SearchSortOption;
  label: string;
}> = [
  ...catalogSortOptions,
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];
