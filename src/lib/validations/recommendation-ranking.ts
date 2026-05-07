import { z } from "zod";

const rankingItemTypeSchema = z.enum([
  "VEHICLE",
  "ENERGY_PRODUCT",
  "SHOP_PRODUCT",
]);

function numericWeightField(fieldLabel: string, minimum: number, maximum: number) {
  return z
    .number()
    .min(minimum, `${fieldLabel} must be at least ${minimum}.`)
    .max(maximum, `${fieldLabel} must be at most ${maximum}.`);
}

function coerceBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value === "true" || value === "on";
  }

  return false;
}

export const recommendationRankingConfigSchema = z.object({
  favoritesWeight: numericWeightField("Favorites weight", 0, 20),
  recentlyViewedWeight: numericWeightField("Recently viewed weight", 0, 20),
  recentViewRecencyBonus: numericWeightField("Recent view freshness bonus", 0, 5),
  savedBuildWeight: numericWeightField("Saved build weight", 0, 20),
  inquiryWeight: numericWeightField("Inquiry weight", 0, 20),
  categoryAffinityWeight: numericWeightField("Category affinity weight", 0, 10),
  tokenAffinityWeight: numericWeightField("Content affinity weight", 0, 10),
  sameTypeWeight: numericWeightField("Same type bonus", 0, 10),
  preferredTypeWeight: numericWeightField("Preferred type bonus", 0, 10),
  popularityWeight: numericWeightField("Popularity weight", 0, 10),
  freshnessWeight: numericWeightField("Freshness weight", 0, 10),
  adminBoostWeight: numericWeightField("Admin boost multiplier", 0, 10),
  pinWeight: numericWeightField("Pin bonus", 0, 25),
  vehicleCategoryBoost: numericWeightField("Vehicle category boost", 0.25, 3),
  energyCategoryBoost: numericWeightField("Energy category boost", 0.25, 3),
  shopCategoryBoost: numericWeightField("Shop category boost", 0.25, 3),
  searchPopularityWeight: numericWeightField("Search popularity tie-break", 0, 5),
  searchFreshnessWeight: numericWeightField("Search freshness tie-break", 0, 5),
  searchAdminBoostWeight: numericWeightField("Search admin boost multiplier", 0, 10),
  searchPinWeight: numericWeightField("Search pin bonus", 0, 30),
  searchUserAffinityWeight: numericWeightField("Search user affinity tie-break", 0, 5),
  searchCategoryBoostWeight: numericWeightField("Search category boost tie-break", 0, 5),
});

export const recommendationRankingConfigPayloadSchema = z.object({
  favoritesWeight: z.coerce.number().min(0).max(20),
  recentlyViewedWeight: z.coerce.number().min(0).max(20),
  recentViewRecencyBonus: z.coerce.number().min(0).max(5),
  savedBuildWeight: z.coerce.number().min(0).max(20),
  inquiryWeight: z.coerce.number().min(0).max(20),
  categoryAffinityWeight: z.coerce.number().min(0).max(10),
  tokenAffinityWeight: z.coerce.number().min(0).max(10),
  sameTypeWeight: z.coerce.number().min(0).max(10),
  preferredTypeWeight: z.coerce.number().min(0).max(10),
  popularityWeight: z.coerce.number().min(0).max(10),
  freshnessWeight: z.coerce.number().min(0).max(10),
  adminBoostWeight: z.coerce.number().min(0).max(10),
  pinWeight: z.coerce.number().min(0).max(25),
  vehicleCategoryBoost: z.coerce.number().min(0.25).max(3),
  energyCategoryBoost: z.coerce.number().min(0.25).max(3),
  shopCategoryBoost: z.coerce.number().min(0.25).max(3),
  searchPopularityWeight: z.coerce.number().min(0).max(5),
  searchFreshnessWeight: z.coerce.number().min(0).max(5),
  searchAdminBoostWeight: z.coerce.number().min(0).max(10),
  searchPinWeight: z.coerce.number().min(0).max(30),
  searchUserAffinityWeight: z.coerce.number().min(0).max(5),
  searchCategoryBoostWeight: z.coerce.number().min(0).max(5),
});

export const productRankingOverrideSchema = z.object({
  itemType: rankingItemTypeSchema,
  itemSlug: z
    .string()
    .trim()
    .min(1, "Choose a product to promote.")
    .max(160, "Product slug is too long."),
  pinned: z.boolean(),
  boostScore: numericWeightField("Boost score", -20, 20),
});

export const productRankingOverridePayloadSchema = z.object({
  itemType: rankingItemTypeSchema,
  itemSlug: z
    .string()
    .trim()
    .min(1, "Choose a product to promote.")
    .max(160, "Product slug is too long."),
  pinned: z.preprocess(coerceBoolean, z.boolean()),
  boostScore: z.coerce.number().min(-20).max(20),
});

export type RecommendationRankingConfigFormValues = z.infer<
  typeof recommendationRankingConfigSchema
>;
export type ProductRankingOverrideFormValues = z.infer<
  typeof productRankingOverrideSchema
>;
