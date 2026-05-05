import "server-only";

import { getRecommendationCatalogMap } from "@/lib/recommendations/catalog";
import { getRecommendedForUser } from "@/lib/recommendations/getRecommendedForUser";
import { getRecommendedItems } from "@/lib/recommendations/getRecommendedItems";
import { getRecentlyViewed } from "@/lib/recommendations/getRecentlyViewed";
import { countRecentlyViewedByUser } from "@/lib/recommendations/trackRecentlyViewed";
import { buildRecommendationKey } from "@/lib/recommendations/utils";
import { countInquiriesByUser, getInquiriesByUser } from "@/lib/db/inquiries";
import { getUserFavoriteItems } from "@/lib/db/favorites";
import { getSavedBuildsByUser } from "@/lib/db/saved-builds";
import { getUserContinuityPreferencesById } from "@/lib/db/users";

import type { AccountDashboardData } from "@/lib/account/types";
import {
  defaultAccountContinuityPreferences,
  getInquiryContextTitle,
  getInquiryTypeLabel,
  getMessagePreview,
  getProductHrefForItem,
} from "@/lib/account/utils";

export async function getAccountDashboardData(
  userId: string,
): Promise<AccountDashboardData> {
  const [
    favoriteItems,
    savedBuilds,
    recentlyViewed,
    recentlyViewedCount,
    inquiryRecords,
    inquiryCount,
    preferenceRecord,
    catalogMap,
  ] = await Promise.all([
    getUserFavoriteItems(userId),
    getSavedBuildsByUser(userId),
    getRecentlyViewed(userId, 4),
    countRecentlyViewedByUser(userId),
    getInquiriesByUser(userId, 4),
    countInquiriesByUser(userId),
    getUserContinuityPreferencesById(userId),
    getRecommendationCatalogMap(),
  ]);

  const recentBuilds = savedBuilds.slice(0, 3);
  const excludeItemKeys = [
    ...favoriteItems.map((item) =>
      buildRecommendationKey(item.itemType, item.itemSlug),
    ),
    ...recentlyViewed.map((item) =>
      buildRecommendationKey(item.itemType, item.slug),
    ),
    ...recentBuilds.map((build) =>
      buildRecommendationKey("VEHICLE", build.vehicleSlug),
    ),
  ];
  const recommendedForYou = await getRecommendedForUser(userId, {
    limit: 3,
    excludeItemKeys,
  });
  const basedOnFavorites = favoriteItems.length
    ? await getRecommendedItems({
        userId,
        seeds: favoriteItems.slice(0, 3).map((item) => ({
          itemType: item.itemType,
          slug: item.itemSlug,
          weight: 4.5,
        })),
        preferredItemTypes: [
          ...new Set(favoriteItems.map((item) => item.itemType)),
        ],
        excludeItemKeys: [
          ...excludeItemKeys,
          ...recommendedForYou.map((item) =>
            buildRecommendationKey(item.itemType, item.slug),
          ),
        ],
        limit: 3,
      })
    : [];

  return {
    favoriteItems,
    savedBuilds,
    recentBuilds,
    recentlyViewed,
    recommendedForYou,
    basedOnFavorites,
    inquiryHistory: inquiryRecords.map((record) => {
      const href = getProductHrefForItem(record.itemType, record.productSlug);
      const catalogItem =
        record.itemType && record.productSlug
          ? catalogMap.get(
              buildRecommendationKey(record.itemType, record.productSlug),
            )
          : undefined;
      const typeLabel = getInquiryTypeLabel(record.type);

      return {
        id: record.id,
        type: record.type,
        typeLabel,
        title: getInquiryContextTitle({
          typeLabel,
          catalogTitle: catalogItem?.title,
          productSlug: record.productSlug,
        }),
        messagePreview: getMessagePreview(record.message),
        createdAt: record.createdAt,
        href,
      };
    }),
    preferences: preferenceRecord ?? defaultAccountContinuityPreferences,
    stats: {
      favoriteCount: favoriteItems.length,
      savedBuildCount: savedBuilds.length,
      recentlyViewedCount,
      inquiryCount,
    },
  };
}
