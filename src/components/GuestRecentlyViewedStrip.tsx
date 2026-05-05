"use client";

import { useSyncExternalStore } from "react";

import { ContinuityStrip } from "@/components/ContinuityStrip";
import {
  GUEST_RECENTLY_VIEWED_EVENT,
  readGuestRecentlyViewedItems,
  type GuestRecentlyViewedItem,
} from "@/lib/recently-viewed/local";
import type { FavoriteItemTypeValue } from "@/types";

interface GuestRecentlyViewedStripProps {
  currentItem: {
    itemType: FavoriteItemTypeValue;
    slug: string;
  };
  limit?: number;
  compact?: boolean;
}

function subscribeToRecentlyViewed(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleUpdate = () => {
    callback();
  };

  window.addEventListener("storage", handleUpdate);
  window.addEventListener(GUEST_RECENTLY_VIEWED_EVENT, handleUpdate);

  return () => {
    window.removeEventListener("storage", handleUpdate);
    window.removeEventListener(GUEST_RECENTLY_VIEWED_EVENT, handleUpdate);
  };
}

function getServerSnapshot() {
  return [] as GuestRecentlyViewedItem[];
}

export function GuestRecentlyViewedStrip({
  currentItem,
  limit = 4,
  compact = true,
}: GuestRecentlyViewedStripProps) {
  const storedItems = useSyncExternalStore(
    subscribeToRecentlyViewed,
    readGuestRecentlyViewedItems,
    getServerSnapshot,
  );
  const items = storedItems
    .filter(
      (item) =>
        !(item.itemType === currentItem.itemType && item.slug === currentItem.slug),
    )
    .slice(0, limit);

  if (items.length === 0) {
    return null;
  }

  return (
    <ContinuityStrip
      eyebrow="Recently Viewed"
      title="Keep your discovery context close"
      description="Jump back into the items you opened recently without restarting the search."
      items={items}
      actionHref="/search"
      actionLabel="Search all products"
      compact={compact}
    />
  );
}
