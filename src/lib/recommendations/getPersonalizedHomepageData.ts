import "server-only";

import { getRecommendationCatalog } from "@/lib/recommendations/catalog";
import { getRankingConfig } from "@/lib/recommendations/getRankingConfig";
import { getRecommendedForUser } from "@/lib/recommendations/getRecommendedForUser";
import { getRecommendedItems } from "@/lib/recommendations/getRecommendedItems";
import { buildUserRecommendationProfile } from "@/lib/recommendations/signals";
import type { RecommendationSectionData } from "@/lib/recommendations/types";
import { buildRecommendationKey } from "@/lib/recommendations/utils";

export async function getPersonalizedHomepageData(
  userId: string,
): Promise<RecommendationSectionData[]> {
  const catalog = await getRecommendationCatalog();
  const config = await getRankingConfig();
  const profile = await buildUserRecommendationProfile(userId, catalog, config);

  if (!profile.hasSignals) {
    return [];
  }

  const recommendedForYou = await getRecommendedForUser(userId, {
    limit: 3,
    excludeItemKeys: [...profile.interactedKeys],
  });
  const sections: RecommendationSectionData[] = [];

  if (recommendedForYou.length > 0) {
    sections.push({
      id: "recommended-for-you",
      eyebrow: "Personalized",
      title: "Recommended for You",
      description:
        "A subtle mix of vehicles, energy products, and accessories shaped by the items you save, revisit, build, and inquire about.",
      items: recommendedForYou,
      actionHref: "/account",
      actionLabel: "Open Account",
    });
  }

  if (profile.favoriteSeeds.length > 0) {
    const basedOnFavorites = await getRecommendedItems({
      userId,
      seeds: profile.favoriteSeeds.slice(0, 3),
      preferredItemTypes: [
        ...new Set(profile.favoriteSeeds.map((seed) => seed.itemType)),
      ],
      excludeItemKeys: [
        ...profile.favoriteKeys,
        ...profile.recentKeys,
        ...recommendedForYou.map((item) =>
          buildRecommendationKey(item.itemType, item.slug),
        ),
      ],
      limit: 3,
    });

    if (basedOnFavorites.length > 0) {
      sections.push({
        id: "based-on-favorites",
        eyebrow: "Favorites",
        title: "Based on Your Favorites",
        description:
          "A tighter recommendation set built around the categories and product cues you have already chosen to save.",
        items: basedOnFavorites,
        actionHref: "/account",
        actionLabel: "Saved Items",
      });
    }
  }

  return sections;
}
