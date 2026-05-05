import type {
  EnergyProductData,
  SearchResultItem,
  ShopProductData,
  VehicleData,
} from "@/types";
import { buildSearchableText, getSearchTypeLabel, type SearchableFields } from "@/lib/search/utils";

export interface SearchCatalogItem extends SearchResultItem {
  searchableFields: SearchableFields;
}

export function getVehicleSearchFields(vehicle: VehicleData): SearchableFields {
  return {
    type: "vehicle",
    title: vehicle.title,
    description: vehicle.subtitle,
    body: buildSearchableText(
      vehicle.longDescription,
      vehicle.price,
      vehicle.specs.map((spec) => `${spec.label} ${spec.value}`),
      vehicle.highlights.map(
        (highlight) => `${highlight.title} ${highlight.description}`,
      ),
    ),
    slug: vehicle.slug,
    price: vehicle.price,
    updatedAt: vehicle.updatedAt,
  };
}

export function getEnergyProductSearchFields(
  product: EnergyProductData,
): SearchableFields {
  return {
    type: "energy",
    title: product.title,
    description: product.description,
    body: buildSearchableText(
      product.longDescription,
      product.highlights.map(
        (highlight) => `${highlight.title} ${highlight.description}`,
      ),
      product.supportingFeatures.map(
        (feature) => `${feature.title} ${feature.description}`,
      ),
    ),
    slug: product.slug,
    updatedAt: product.updatedAt,
  };
}

export function getShopProductSearchFields(
  product: ShopProductData,
): SearchableFields {
  return {
    type: "shop",
    title: product.title,
    description: product.description,
    body: buildSearchableText(
      product.longDescription,
      product.price,
      product.badge,
      product.highlights.map(
        (highlight) => `${highlight.title} ${highlight.description}`,
      ),
      product.specs.map((spec) => `${spec.label} ${spec.value}`),
    ),
    slug: product.slug,
    price: product.price,
    updatedAt: product.updatedAt,
  };
}

export function mapVehicleToSearchCatalogItem(
  vehicle: VehicleData,
): SearchCatalogItem {
  return {
    id: `vehicle:${vehicle.slug}`,
    type: "vehicle",
    typeLabel: getSearchTypeLabel("vehicle"),
    slug: vehicle.slug,
    href: `/vehicles/${vehicle.slug}`,
    title: vehicle.title,
    description: vehicle.subtitle,
    image: vehicle.image,
    ctaLabel: "Explore vehicle",
    price: vehicle.price,
    updatedAt: vehicle.updatedAt,
    searchableFields: getVehicleSearchFields(vehicle),
  };
}

export function mapEnergyProductToSearchCatalogItem(
  product: EnergyProductData,
): SearchCatalogItem {
  return {
    id: `energy:${product.slug}`,
    type: "energy",
    typeLabel: getSearchTypeLabel("energy"),
    slug: product.slug,
    href: `/energy/${product.slug}`,
    title: product.title,
    description: product.description,
    image: product.image,
    ctaLabel: "Explore energy",
    updatedAt: product.updatedAt,
    searchableFields: getEnergyProductSearchFields(product),
  };
}

export function mapShopProductToSearchCatalogItem(
  product: ShopProductData,
): SearchCatalogItem {
  return {
    id: `shop:${product.slug}`,
    type: "shop",
    typeLabel: getSearchTypeLabel("shop"),
    slug: product.slug,
    href: `/shop/${product.slug}`,
    title: product.title,
    description: product.description,
    image: product.image,
    ctaLabel: "View shop product",
    price: product.price,
    badge: product.badge,
    updatedAt: product.updatedAt,
    searchableFields: getShopProductSearchFields(product),
  };
}
