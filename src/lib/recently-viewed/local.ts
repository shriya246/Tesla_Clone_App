import type { FavoriteItemTypeValue } from "@/types";

export interface GuestRecentlyViewedItem {
  itemType: FavoriteItemTypeValue;
  slug: string;
  title: string;
  description: string;
  href: string;
  image: string;
  eyebrow?: string;
  price?: string;
}

export interface StoredGuestRecentlyViewedItem extends GuestRecentlyViewedItem {
  seenAt: string;
}

export const GUEST_RECENTLY_VIEWED_STORAGE_KEY =
  "tesla-inspired-recently-viewed";
export const GUEST_RECENTLY_VIEWED_LIMIT = 12;
export const GUEST_RECENTLY_VIEWED_EVENT =
  "tesla-inspired-recently-viewed-updated";

export function parseGuestRecentlyViewedItems(value: string | null) {
  if (!value) {
    return [] as StoredGuestRecentlyViewedItem[];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? (parsed as StoredGuestRecentlyViewedItem[])
      : [];
  } catch {
    return [];
  }
}

export function upsertGuestRecentlyViewedItem(
  items: StoredGuestRecentlyViewedItem[],
  item: GuestRecentlyViewedItem,
  seenAt = new Date().toISOString(),
) {
  const filteredItems = items.filter(
    (entry) => !(entry.itemType === item.itemType && entry.slug === item.slug),
  );

  filteredItems.unshift({
    ...item,
    seenAt,
  });

  return filteredItems.slice(0, GUEST_RECENTLY_VIEWED_LIMIT);
}

export function readGuestRecentlyViewedItems() {
  if (typeof window === "undefined") {
    return [] as StoredGuestRecentlyViewedItem[];
  }

  return parseGuestRecentlyViewedItems(
    window.localStorage.getItem(GUEST_RECENTLY_VIEWED_STORAGE_KEY),
  );
}

export function writeGuestRecentlyViewedItem(item: GuestRecentlyViewedItem) {
  if (typeof window === "undefined") {
    return;
  }

  const nextItems = upsertGuestRecentlyViewedItem(
    readGuestRecentlyViewedItems(),
    item,
  );

  window.localStorage.setItem(
    GUEST_RECENTLY_VIEWED_STORAGE_KEY,
    JSON.stringify(nextItems),
  );
  window.dispatchEvent(new Event(GUEST_RECENTLY_VIEWED_EVENT));
}
