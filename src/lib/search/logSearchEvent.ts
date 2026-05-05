import "server-only";

import { FavoriteItemType, SearchEventScope } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { SearchFilterType, SearchProductType } from "@/types";

function mapSearchFilterTypeToScope(type: SearchFilterType) {
  switch (type) {
    case "vehicle":
      return SearchEventScope.VEHICLE;
    case "energy":
      return SearchEventScope.ENERGY;
    case "shop":
      return SearchEventScope.SHOP;
    default:
      return SearchEventScope.ALL;
  }
}

function mapSearchProductTypeToItemType(type?: SearchProductType) {
  switch (type) {
    case "vehicle":
      return FavoriteItemType.VEHICLE;
    case "energy":
      return FavoriteItemType.ENERGY_PRODUCT;
    case "shop":
      return FavoriteItemType.SHOP_PRODUCT;
    default:
      return undefined;
  }
}

export async function logSearchEvent(input: {
  userId?: string | null;
  query: string;
  normalizedQuery: string;
  type: SearchFilterType;
  resultCount: number;
  topResultType?: SearchProductType;
}) {
  if (input.normalizedQuery.trim().length < 2) {
    return false;
  }

  try {
    await prisma.searchEvent.create({
      data: {
        userId: input.userId,
        query: input.query.trim(),
        normalizedQuery: input.normalizedQuery,
        scope: mapSearchFilterTypeToScope(input.type),
        resultCount: input.resultCount,
        topResultItemType: mapSearchProductTypeToItemType(input.topResultType),
      },
    });

    return true;
  } catch {
    return false;
  }
}
