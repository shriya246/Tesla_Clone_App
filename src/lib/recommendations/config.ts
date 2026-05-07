import type { RecommendationItemType } from "@/lib/recommendations/types";

export const RECOMMENDATION_CONFIG_ID = "default";

export interface RecommendationRankingConfigValues {
  favoritesWeight: number;
  recentlyViewedWeight: number;
  recentViewRecencyBonus: number;
  savedBuildWeight: number;
  inquiryWeight: number;
  categoryAffinityWeight: number;
  tokenAffinityWeight: number;
  sameTypeWeight: number;
  preferredTypeWeight: number;
  popularityWeight: number;
  freshnessWeight: number;
  adminBoostWeight: number;
  pinWeight: number;
  vehicleCategoryBoost: number;
  energyCategoryBoost: number;
  shopCategoryBoost: number;
  searchPopularityWeight: number;
  searchFreshnessWeight: number;
  searchAdminBoostWeight: number;
  searchPinWeight: number;
  searchUserAffinityWeight: number;
  searchCategoryBoostWeight: number;
}

export interface RecommendationRankingConfigData
  extends RecommendationRankingConfigValues {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductRankingOverrideData {
  id?: string;
  itemType: RecommendationItemType;
  itemSlug: string;
  pinned: boolean;
  boostScore: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RecommendationRankingFieldDefinition {
  name: keyof RecommendationRankingConfigValues;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
}

export interface RecommendationRankingFieldGroup {
  id: string;
  title: string;
  description: string;
  fields: RecommendationRankingFieldDefinition[];
}

export const defaultRecommendationRankingConfig: RecommendationRankingConfigData = {
  id: RECOMMENDATION_CONFIG_ID,
  favoritesWeight: 5,
  recentlyViewedWeight: 2.2,
  recentViewRecencyBonus: 0.5,
  savedBuildWeight: 5.5,
  inquiryWeight: 4,
  categoryAffinityWeight: 1.15,
  tokenAffinityWeight: 0.72,
  sameTypeWeight: 1.2,
  preferredTypeWeight: 0.9,
  popularityWeight: 1.2,
  freshnessWeight: 0.6,
  adminBoostWeight: 1,
  pinWeight: 8,
  vehicleCategoryBoost: 1,
  energyCategoryBoost: 1,
  shopCategoryBoost: 1,
  searchPopularityWeight: 0.18,
  searchFreshnessWeight: 0.12,
  searchAdminBoostWeight: 2,
  searchPinWeight: 12,
  searchUserAffinityWeight: 0.14,
  searchCategoryBoostWeight: 1,
};

export const recommendationRankingFieldGroups: RecommendationRankingFieldGroup[] = [
  {
    id: "engagement-signals",
    title: "Engagement Signal Weights",
    description:
      "Control how much direct customer behavior influences recommendations and search ordering.",
    fields: [
      {
        name: "favoritesWeight",
        label: "Favorites",
        description: "How strongly saved favorites influence adjacent recommendations.",
        min: 0,
        max: 20,
        step: 0.1,
      },
      {
        name: "recentlyViewedWeight",
        label: "Recently Viewed",
        description:
          "How much recent browsing activity shapes recommendation and discovery ordering.",
        min: 0,
        max: 20,
        step: 0.1,
      },
      {
        name: "recentViewRecencyBonus",
        label: "Recent View Freshness Bonus",
        description:
          "Extra signal strength applied when a product was viewed within the last week.",
        min: 0,
        max: 5,
        step: 0.05,
      },
      {
        name: "savedBuildWeight",
        label: "Saved Builds",
        description:
          "How much saved vehicle builds should influence downstream recommendations.",
        min: 0,
        max: 20,
        step: 0.1,
      },
      {
        name: "inquiryWeight",
        label: "Inquiry History",
        description:
          "How much inquiry or demo intent should influence related product ranking.",
        min: 0,
        max: 20,
        step: 0.1,
      },
    ],
  },
  {
    id: "recommendation-scoring",
    title: "Recommendation Scoring",
    description:
      "Tune how category affinity, content overlap, popularity, freshness, and admin promotions combine.",
    fields: [
      {
        name: "categoryAffinityWeight",
        label: "Category Affinity",
        description:
          "Base multiplier for matching a candidate to the user or context category.",
        min: 0,
        max: 10,
        step: 0.05,
      },
      {
        name: "tokenAffinityWeight",
        label: "Content Affinity",
        description:
          "Base multiplier for shared descriptive tokens, specs, and option cues.",
        min: 0,
        max: 10,
        step: 0.05,
      },
      {
        name: "sameTypeWeight",
        label: "Same Type Bonus",
        description:
          "Extra score for staying within the same major catalog type as the active context.",
        min: 0,
        max: 10,
        step: 0.05,
      },
      {
        name: "preferredTypeWeight",
        label: "Preferred Type Bonus",
        description:
          "Extra score when a candidate aligns with the strongest current recommendation path.",
        min: 0,
        max: 10,
        step: 0.05,
      },
      {
        name: "popularityWeight",
        label: "Popularity",
        description:
          "How much aggregate engagement should matter in recommendation ordering.",
        min: 0,
        max: 10,
        step: 0.05,
      },
      {
        name: "freshnessWeight",
        label: "Freshness",
        description:
          "How much recently updated catalog items should be lifted in recommendations.",
        min: 0,
        max: 10,
        step: 0.05,
      },
      {
        name: "adminBoostWeight",
        label: "Admin Boost Multiplier",
        description:
          "Multiplier applied to a product's manual boost score in recommendation ordering.",
        min: 0,
        max: 10,
        step: 0.05,
      },
      {
        name: "pinWeight",
        label: "Pin Bonus",
        description:
          "Fixed lift applied when a product is pinned for recommendation visibility.",
        min: 0,
        max: 25,
        step: 0.1,
      },
    ],
  },
  {
    id: "category-boosts",
    title: "Category Boosts",
    description:
      "Light multipliers for broad category emphasis without rewriting underlying scoring rules.",
    fields: [
      {
        name: "vehicleCategoryBoost",
        label: "Vehicle Category",
        description: "Multiplier applied to vehicle recommendation scores.",
        min: 0.25,
        max: 3,
        step: 0.05,
      },
      {
        name: "energyCategoryBoost",
        label: "Energy Category",
        description: "Multiplier applied to energy recommendation scores.",
        min: 0.25,
        max: 3,
        step: 0.05,
      },
      {
        name: "shopCategoryBoost",
        label: "Shop Category",
        description: "Multiplier applied to shop recommendation scores.",
        min: 0.25,
        max: 3,
        step: 0.05,
      },
    ],
  },
  {
    id: "search-ranking",
    title: "Search Discovery Weights",
    description:
      "Tune how much popularity, freshness, user affinity, and manual promotions adjust search ordering.",
    fields: [
      {
        name: "searchPopularityWeight",
        label: "Popularity Tie-Break",
        description:
          "Lift applied to more popular results when search relevance is close.",
        min: 0,
        max: 5,
        step: 0.01,
      },
      {
        name: "searchFreshnessWeight",
        label: "Freshness Tie-Break",
        description:
          "Lift applied to recently updated products in discovery and search.",
        min: 0,
        max: 5,
        step: 0.01,
      },
      {
        name: "searchAdminBoostWeight",
        label: "Manual Boost Multiplier",
        description:
          "Multiplier applied to manual product boosts inside search ordering.",
        min: 0,
        max: 10,
        step: 0.05,
      },
      {
        name: "searchPinWeight",
        label: "Pinned Result Bonus",
        description:
          "Fixed lift for manually pinned products in search and discovery results.",
        min: 0,
        max: 30,
        step: 0.1,
      },
      {
        name: "searchUserAffinityWeight",
        label: "User Affinity Tie-Break",
        description:
          "How much signed-in user history should nudge otherwise similar results.",
        min: 0,
        max: 5,
        step: 0.01,
      },
      {
        name: "searchCategoryBoostWeight",
        label: "Category Boost Tie-Break",
        description:
          "How strongly category-level boosts should affect discovery ordering.",
        min: 0,
        max: 5,
        step: 0.01,
      },
    ],
  },
];

export function getCategoryBoostValue(
  itemType: RecommendationItemType,
  config: RecommendationRankingConfigValues,
) {
  switch (itemType) {
    case "VEHICLE":
      return config.vehicleCategoryBoost;
    case "ENERGY_PRODUCT":
      return config.energyCategoryBoost;
    case "SHOP_PRODUCT":
      return config.shopCategoryBoost;
    default:
      return 1;
  }
}

export function mergeRecommendationRankingConfig(
  input?: Partial<RecommendationRankingConfigData> | null,
): RecommendationRankingConfigData {
  return {
    ...defaultRecommendationRankingConfig,
    ...input,
    id: input?.id ?? defaultRecommendationRankingConfig.id,
  };
}
