import type {
  EnergyProductData,
  SearchResultItem,
  ShopProductData,
  VehicleData,
} from "@/types";
import type { RecommendationItemType } from "@/lib/recommendations/types";
import {
  buildPriceBandToken,
  buildRecommendationKey,
  extractVehicleBucketTokens,
  tokenizeRecommendationText,
} from "@/lib/recommendations/utils";
import {
  buildSearchableText,
  getSearchTypeLabel,
  parsePriceValue,
  type SearchableFields,
} from "@/lib/search/utils";

export interface SearchCatalogItem extends SearchResultItem {
  itemType: RecommendationItemType;
  key: string;
  tokens: string[];
  searchableFields: SearchableFields;
}

function buildSearchTokens(parts: string[], price?: string) {
  const tokens = tokenizeRecommendationText(...parts);
  const priceBandToken = buildPriceBandToken(parsePriceValue(price));

  if (priceBandToken) {
    tokens.push(priceBandToken);
  }

  return tokens;
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
  const tokens = buildSearchTokens(
    [
      vehicle.title,
      vehicle.subtitle,
      vehicle.longDescription,
      ...vehicle.specs.flatMap((spec) => [`${spec.label} ${spec.value}`]),
      ...vehicle.highlights.flatMap((highlight) => [
        `${highlight.title} ${highlight.description}`,
      ]),
    ],
    vehicle.price,
  );

  for (const token of extractVehicleBucketTokens(vehicle.specs)) {
    tokens.push(token);
  }

  return {
    id: `vehicle:${vehicle.slug}`,
    type: "vehicle",
    itemType: "VEHICLE",
    key: buildRecommendationKey("VEHICLE", vehicle.slug),
    typeLabel: getSearchTypeLabel("vehicle"),
    slug: vehicle.slug,
    href: `/vehicles/${vehicle.slug}`,
    title: vehicle.title,
    description: vehicle.subtitle,
    image: vehicle.image,
    ctaLabel: "Explore vehicle",
    price: vehicle.price,
    updatedAt: vehicle.updatedAt,
    tokens,
    searchableFields: getVehicleSearchFields(vehicle),
  };
}

export function mapEnergyProductToSearchCatalogItem(
  product: EnergyProductData,
): SearchCatalogItem {
  return {
    id: `energy:${product.slug}`,
    type: "energy",
    itemType: "ENERGY_PRODUCT",
    key: buildRecommendationKey("ENERGY_PRODUCT", product.slug),
    typeLabel: getSearchTypeLabel("energy"),
    slug: product.slug,
    href: `/energy/${product.slug}`,
    title: product.title,
    description: product.description,
    image: product.image,
    ctaLabel: "Explore energy",
    updatedAt: product.updatedAt,
    tokens: buildSearchTokens([
      product.title,
      product.description,
      product.longDescription,
      ...product.highlights.flatMap((highlight) => [
        `${highlight.title} ${highlight.description}`,
      ]),
      ...product.supportingFeatures.flatMap((feature) => [
        `${feature.title} ${feature.description}`,
      ]),
    ]),
    searchableFields: getEnergyProductSearchFields(product),
  };
}

export function mapShopProductToSearchCatalogItem(
  product: ShopProductData,
): SearchCatalogItem {
  return {
    id: `shop:${product.slug}`,
    type: "shop",
    itemType: "SHOP_PRODUCT",
    key: buildRecommendationKey("SHOP_PRODUCT", product.slug),
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
    tokens: buildSearchTokens(
      [
        product.title,
        product.description,
        product.longDescription,
        product.badge ?? "",
        ...product.highlights.flatMap((highlight) => [
          `${highlight.title} ${highlight.description}`,
        ]),
        ...product.specs.flatMap((spec) => [`${spec.label} ${spec.value}`]),
      ],
      product.price,
    ),
    searchableFields: getShopProductSearchFields(product),
  };
}
