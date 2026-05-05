import "server-only";

import { getRecommendedItems } from "@/lib/recommendations/getRecommendedItems";
import type {
  RecommendationItemType,
  RecommendationSectionData,
} from "@/lib/recommendations/types";

function getSectionCopy(
  itemType: RecommendationItemType,
  isPersonalized: boolean,
) {
  if (itemType === "VEHICLE") {
    return isPersonalized
      ? {
          eyebrow: "Recommended",
          title: "Recommended next in the lineup",
          description:
            "These vehicles are weighted by this model plus the performance, range, and utility signals already showing up in your account.",
        }
      : {
          eyebrow: "Related",
          title: "Explore similar vehicles",
          description:
            "Continue through the lineup with models that share nearby performance, range, or capability cues.",
        };
  }

  if (itemType === "ENERGY_PRODUCT") {
    return isPersonalized
      ? {
          eyebrow: "Recommended",
          title: "Recommended energy paths",
          description:
            "These products reflect this energy product plus the resilience and system-fit signals already building in your account.",
        }
      : {
          eyebrow: "Related",
          title: "Explore related energy products",
          description:
            "See the adjacent solar and storage products that fit naturally into the same home-energy journey.",
        };
  }

  return isPersonalized
    ? {
        eyebrow: "Recommended",
        title: "Recommended next in shop",
        description:
          "These accessories are weighted by this product plus the charging, travel, and ownership signals already saved in your account.",
      }
    : {
        eyebrow: "Related",
        title: "Explore related shop products",
        description:
          "Browse nearby accessories, charging gear, and lifestyle products that share similar use-case cues.",
      };
}

export async function getContextualRecommendationsForItem(input: {
  userId?: string | null;
  itemType: RecommendationItemType;
  slug: string;
  limit?: number;
}): Promise<RecommendationSectionData | null> {
  const items = await getRecommendedItems({
    userId: input.userId,
    currentItem: {
      itemType: input.itemType,
      slug: input.slug,
      weight: 4.5,
    },
    preferredItemTypes: [input.itemType],
    limit: input.limit ?? 3,
  });

  if (items.length === 0) {
    return null;
  }

  const copy = getSectionCopy(input.itemType, Boolean(input.userId));

  return {
    id: `contextual-${input.itemType.toLowerCase()}`,
    ...copy,
    items,
  };
}
