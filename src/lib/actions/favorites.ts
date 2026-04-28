"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FavoriteItemType } from "@prisma/client";

import { auth } from "@/auth";
import { addFavorite, isFavorited, removeFavorite } from "@/lib/db/favorites";
import type { FavoriteItemTypeValue } from "@/types";

interface ToggleFavoriteInput {
  itemType: FavoriteItemTypeValue;
  itemSlug: string;
  redirectPath: string;
}

export async function toggleFavoriteAction(input: ToggleFavoriteInput) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(input.redirectPath)}`);
  }

  const itemType = input.itemType as FavoriteItemType;
  const favorited = await isFavorited({
    userId,
    itemType,
    itemSlug: input.itemSlug,
  });

  if (favorited) {
    await removeFavorite({
      userId,
      itemType,
      itemSlug: input.itemSlug,
    });
  } else {
    await addFavorite({
      userId,
      itemType,
      itemSlug: input.itemSlug,
    });
  }

  revalidatePath(input.redirectPath);
  revalidatePath("/account");
}
