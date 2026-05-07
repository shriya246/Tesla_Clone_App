import "server-only";

import { FavoriteItemType } from "@prisma/client";

import { cacheRevalidateSeconds, cacheTags, createCachedQuery } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import type { ProductRankingOverrideData } from "@/lib/recommendations/config";
import { buildRecommendationKey } from "@/lib/recommendations/utils";

function mapProductRankingOverrideRecord(
  record: Awaited<ReturnType<typeof prisma.productRankingOverride.findFirst>>,
): ProductRankingOverrideData | null {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    itemType: record.itemType,
    itemSlug: record.itemSlug,
    pinned: record.pinned,
    boostScore: record.boostScore,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export const getAllProductRankingOverrides = createCachedQuery(async () => {
  try {
    const records = await prisma.productRankingOverride.findMany({
      orderBy: [
        {
          pinned: "desc",
        },
        {
          boostScore: "desc",
        },
        {
          updatedAt: "desc",
        },
      ],
    });

    return records.flatMap((record) => {
      const mapped = mapProductRankingOverrideRecord(record);

      return mapped ? [mapped] : [];
    });
  } catch {
    return [];
  }
}, ["product-ranking-overrides:list:v2"], {
  revalidate: cacheRevalidateSeconds.recommendations,
  tags: [cacheTags.productRanking, cacheTags.recommendations, cacheTags.search],
});

export async function getProductRankingOverrideMap() {
  return new Map(
    (await getAllProductRankingOverrides()).map((override) => [
      buildRecommendationKey(override.itemType, override.itemSlug),
      override,
    ] as const),
  );
}

export async function saveProductRankingOverride(input: ProductRankingOverrideData) {
  const record = await prisma.productRankingOverride.upsert({
    where: {
      itemType_itemSlug: {
        itemType: input.itemType as FavoriteItemType,
        itemSlug: input.itemSlug,
      },
    },
    update: {
      pinned: input.pinned,
      boostScore: input.boostScore,
    },
    create: {
      itemType: input.itemType as FavoriteItemType,
      itemSlug: input.itemSlug,
      pinned: input.pinned,
      boostScore: input.boostScore,
    },
  });

  return mapProductRankingOverrideRecord(record);
}

export async function deleteProductRankingOverride(input: {
  itemType: ProductRankingOverrideData["itemType"];
  itemSlug: string;
}) {
  return prisma.productRankingOverride.deleteMany({
    where: {
      itemType: input.itemType as FavoriteItemType,
      itemSlug: input.itemSlug,
    },
  });
}
