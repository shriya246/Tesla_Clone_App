"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { toggleFavoriteForUser } from "@/lib/services/favorites";
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

  await toggleFavoriteForUser({
    userId,
    itemType: input.itemType,
    itemSlug: input.itemSlug,
    redirectPath: input.redirectPath,
  });
}
