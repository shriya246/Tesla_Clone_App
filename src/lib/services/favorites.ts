import "server-only";

import { FavoriteItemType } from "@prisma/client";

import { cacheTags, revalidateCachePaths, revalidateCacheTags } from "@/lib/cache";
import { addFavorite, isFavorited, removeFavorite } from "@/lib/db/favorites";
import { publishEvent } from "@/lib/events";
import type { FavoriteItemTypeValue } from "@/types";

interface ToggleFavoriteInput {
  userId: string;
  itemType: FavoriteItemTypeValue;
  itemSlug: string;
  redirectPath: string;
}

export async function toggleFavoriteForUser(input: ToggleFavoriteInput) {
  const itemType = input.itemType as FavoriteItemType;
  const favorited = await isFavorited({
    userId: input.userId,
    itemType,
    itemSlug: input.itemSlug,
  });

  if (favorited) {
    await removeFavorite({
      userId: input.userId,
      itemType,
      itemSlug: input.itemSlug,
    });
  } else {
    const favorite = await addFavorite({
      userId: input.userId,
      itemType,
      itemSlug: input.itemSlug,
    });

    await publishEvent({
      type: "favorite.added",
      actor: {
        userId: input.userId,
      },
      entity: {
        type: "FAVORITE",
        id: favorite.id,
      },
      payload: {
        favoriteId: favorite.id,
        userId: input.userId,
        itemType: input.itemType,
        itemSlug: input.itemSlug,
      },
    });
  }

  revalidateCachePaths([input.redirectPath, "/account"]);
  revalidateCacheTags([
    cacheTags.account,
    cacheTags.adminInsights,
    cacheTags.recommendations,
  ]);
}
