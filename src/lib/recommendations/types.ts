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
  updatedAt?: Date;
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

export interface RecommendationSignalMap {
  categoryWeights: Map<RecommendationItemType, number>;
  tokenWeights: Map<string, number>;
}

export interface RecommendationUserProfile {
  hasSignals: boolean;
  interactedKeys: Set<string>;
  favoriteKeys: Set<string>;
  recentKeys: Set<string>;
  savedBuildKeys: Set<string>;
  categoryWeights: Map<RecommendationItemType, number>;
  tokenWeights: Map<string, number>;
  favoriteSignals: RecommendationSignalMap;
  recentSignals: RecommendationSignalMap;
  savedBuildSignals: RecommendationSignalMap;
  inquirySignals: RecommendationSignalMap;
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

export interface RecommendationScoreComponent {
  id: string;
  label: string;
  score: number;
  description: string;
}

export interface RecommendationScoreBreakdown {
  totalScore: number;
  components: RecommendationScoreComponent[];
  reasons: string[];
  pinned: boolean;
  boostScore: number;
  categoryBoostFactor: number;
  normalizedPopularity: number;
  normalizedFreshness: number;
}

export interface RankedRecommendationCandidate {
  candidate: RecommendationCatalogItem;
  score: number;
  breakdown: RecommendationScoreBreakdown;
}

export interface RecommendationDebugItem extends RecommendationDisplayItem {
  itemType: RecommendationItemType;
  slug: string;
  score: number;
  reasons: string[];
  scoreBreakdown: RecommendationScoreComponent[];
  pinned: boolean;
  boostScore: number;
}
