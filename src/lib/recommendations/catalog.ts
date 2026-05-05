import "server-only";

import { cache } from "react";

import { getAllEnergyProducts } from "@/lib/db/energy";
import { getAllShopProducts } from "@/lib/db/shop";
import { getAllVehicles } from "@/lib/db/vehicles";
import { parsePriceValue } from "@/lib/search/utils";
import type {
  EnergyProductData,
  ShopProductData,
  VehicleData,
} from "@/types";

import type {
  RecommendationCatalogItem,
  RecommendationDisplayItem,
} from "@/lib/recommendations/types";
import {
  buildPriceBandToken,
  buildRecommendationKey,
  extractVehicleBucketTokens,
  tokenizeRecommendationText,
} from "@/lib/recommendations/utils";

function createCatalogItem(
  input: RecommendationDisplayItem & {
    tokens: string[];
    priceValue: number | null;
  },
): RecommendationCatalogItem {
  const priceBandToken = buildPriceBandToken(input.priceValue);
  const tokens = new Set(input.tokens);

  if (priceBandToken) {
    tokens.add(priceBandToken);
  }

  return {
    ...input,
    key: buildRecommendationKey(input.itemType, input.slug),
    priceValue: input.priceValue,
    tokens: [...tokens],
  };
}

function mapVehicleToCatalogItem(vehicle: VehicleData): RecommendationCatalogItem {
  const tokens = tokenizeRecommendationText(
    vehicle.title,
    vehicle.subtitle,
    vehicle.longDescription,
    ...vehicle.specs.flatMap((spec) => [spec.label, spec.value]),
    ...vehicle.highlights.flatMap((highlight) => [
      highlight.title,
      highlight.description,
    ]),
  );

  for (const token of extractVehicleBucketTokens(vehicle.specs)) {
    tokens.push(token);
  }

  return createCatalogItem({
    itemType: "VEHICLE",
    slug: vehicle.slug,
    title: vehicle.title,
    description: vehicle.subtitle,
    href: `/vehicles/${vehicle.slug}`,
    image: vehicle.image,
    eyebrow: "Vehicle",
    price: vehicle.price,
    priceValue: parsePriceValue(vehicle.price),
    tokens,
  });
}

function mapEnergyToCatalogItem(
  product: EnergyProductData,
): RecommendationCatalogItem {
  return createCatalogItem({
    itemType: "ENERGY_PRODUCT",
    slug: product.slug,
    title: product.title,
    description: product.description,
    href: `/energy/${product.slug}`,
    image: product.image,
    eyebrow: "Energy",
    priceValue: null,
    tokens: tokenizeRecommendationText(
      product.title,
      product.description,
      product.longDescription,
      ...product.highlights.flatMap((highlight) => [
        highlight.title,
        highlight.description,
      ]),
      ...product.supportingFeatures.flatMap((feature) => [
        feature.title,
        feature.description,
      ]),
    ),
  });
}

function mapShopToCatalogItem(product: ShopProductData): RecommendationCatalogItem {
  return createCatalogItem({
    itemType: "SHOP_PRODUCT",
    slug: product.slug,
    title: product.title,
    description: product.description,
    href: `/shop/${product.slug}`,
    image: product.image,
    eyebrow: product.badge ?? "Shop",
    price: product.price,
    priceValue: parsePriceValue(product.price),
    tokens: tokenizeRecommendationText(
      product.title,
      product.description,
      product.longDescription,
      product.badge,
      ...product.highlights.flatMap((highlight) => [
        highlight.title,
        highlight.description,
      ]),
      ...product.specs.flatMap((spec) => [spec.label, spec.value]),
    ),
  });
}

export const getRecommendationCatalog = cache(async () => {
  const [vehicles, energyProducts, shopProducts] = await Promise.all([
    getAllVehicles(),
    getAllEnergyProducts(),
    getAllShopProducts(),
  ]);

  return [
    ...vehicles.map(mapVehicleToCatalogItem),
    ...energyProducts.map(mapEnergyToCatalogItem),
    ...shopProducts.map(mapShopToCatalogItem),
  ];
});

export async function getRecommendationCatalogMap() {
  return new Map(
    (await getRecommendationCatalog()).map((item) => [item.key, item] as const),
  );
}

export function toRecommendationDisplayItem(
  item: RecommendationCatalogItem,
): RecommendationDisplayItem {
  return {
    itemType: item.itemType,
    slug: item.slug,
    title: item.title,
    description: item.description,
    href: item.href,
    image: item.image,
    eyebrow: item.eyebrow,
    price: item.price,
  };
}
