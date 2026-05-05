import type { FavoriteItemTypeValue, RelatedItemData } from "@/types";

export type RecommendationItemType = FavoriteItemTypeValue;

export interface RecommendationDisplayItem extends RelatedItemData {
  itemType: RecommendationItemType;
  slug: string;
}

export interface RecommendationCatalogItem extends RecommendationDisplayItem {
  key: string;
  priceValue: number | null;
  tokens: string[];
}

export interface RecommendationSeedInput {
  itemType: RecommendationItemType;
  slug: string;
  weight?: number;
  extraTokens?: string[];
}

export interface RecommendationSectionData {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  items: RecommendationDisplayItem[];
  actionHref?: string;
  actionLabel?: string;
}

export interface RecentlyViewedSignal {
  itemType: RecommendationItemType;
  itemSlug: string;
  viewCount: number;
  createdAt: Date;
  lastViewedAt: Date;
}

export interface RecommendationUserProfile {
  hasSignals: boolean;
  interactedKeys: Set<string>;
  favoriteKeys: Set<string>;
  recentKeys: Set<string>;
  savedBuildKeys: Set<string>;
  categoryWeights: Map<RecommendationItemType, number>;
  tokenWeights: Map<string, number>;
  favoriteSeeds: RecommendationSeedInput[];
  recentSeeds: RecommendationSeedInput[];
  savedBuildSeeds: RecommendationSeedInput[];
  inquirySeeds: RecommendationSeedInput[];
}

export interface GetRecommendedItemsInput {
  userId?: string | null;
  currentItem?: RecommendationSeedInput;
  seeds?: RecommendationSeedInput[];
  preferredItemTypes?: RecommendationItemType[];
  limit?: number;
  excludeItemKeys?: string[];
  includeInteractedItems?: boolean;
}
