"use client";

import { useEffect } from "react";

import type { GuestRecentlyViewedItem } from "@/lib/recently-viewed/local";
import { writeGuestRecentlyViewedItem } from "@/lib/recently-viewed/local";

interface RecentlyViewedTrackerProps {
  item: GuestRecentlyViewedItem;
}

export function RecentlyViewedTracker({
  item,
}: RecentlyViewedTrackerProps) {
  useEffect(() => {
    writeGuestRecentlyViewedItem(item);
  }, [item]);

  return null;
}
