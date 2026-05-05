import "server-only";

import { getRecommendedItems } from "@/lib/recommendations/getRecommendedItems";

export async function getRecommendedForUser(
  userId: string,
  input?: {
    excludeItemKeys?: string[];
    limit?: number;
  },
) {
  return getRecommendedItems({
    userId,
    excludeItemKeys: input?.excludeItemKeys,
    limit: input?.limit,
  });
}
