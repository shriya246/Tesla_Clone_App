import "server-only";

import { FavoriteItemType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { FavoriteItemTypeValue } from "@/types";

import type { RecentlyViewedSignal } from "@/lib/recommendations/types";

export async function trackRecentlyViewed(input: {
  userId: string;
  itemType: FavoriteItemTypeValue;
  itemSlug: string;
}) {
  try {
    await prisma.recentlyViewed.upsert({
      where: {
        userId_itemType_itemSlug: {
          userId: input.userId,
          itemType: input.itemType as FavoriteItemType,
          itemSlug: input.itemSlug,
        },
      },
      update: {
        lastViewedAt: new Date(),
        viewCount: {
          increment: 1,
        },
      },
      create: {
        userId: input.userId,
        itemType: input.itemType as FavoriteItemType,
        itemSlug: input.itemSlug,
        lastViewedAt: new Date(),
      },
    });

    return true;
  } catch {
    return false;
  }
}

export async function getRecentlyViewedSignalsByUser(
  userId: string,
  limit = 12,
): Promise<RecentlyViewedSignal[]> {
  try {
    const items = await prisma.recentlyViewed.findMany({
      where: {
        userId,
      },
      orderBy: {
        lastViewedAt: "desc",
      },
      take: limit,
    });

    return items.map((item) => ({
      itemType: item.itemType,
      itemSlug: item.itemSlug,
      viewCount: item.viewCount,
      createdAt: item.createdAt,
      lastViewedAt: item.lastViewedAt,
    }));
  } catch {
    return [];
  }
}

export async function countRecentlyViewedByUser(userId: string) {
  try {
    return await prisma.recentlyViewed.count({
      where: {
        userId,
      },
    });
  } catch {
    return 0;
  }
}
