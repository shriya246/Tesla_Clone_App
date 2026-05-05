import type { RecommendationItemType } from "@/lib/recommendations/types";
import { formatSlug } from "@/lib/formatSlug";
import type {
  InquiryItemTypeValue,
  InquiryTypeValue,
  SavedBuildData,
} from "@/types";

import type { AccountContinuityPreferences } from "@/lib/account/types";

export const defaultAccountContinuityPreferences: AccountContinuityPreferences = {
  buildReminderOptIn: true,
  productUpdatesOptIn: false,
};

export function getInquiryTypeLabel(type: InquiryTypeValue) {
  switch (type) {
    case "VEHICLE_DEMO_REQUEST":
      return "Demo request";
    case "PRODUCT_INQUIRY":
      return "Product inquiry";
    case "ENERGY_CONSULTATION":
      return "Energy consultation";
    case "GENERAL":
    default:
      return "General inquiry";
  }
}

export function getProductHrefForItem(
  itemType?: InquiryItemTypeValue | RecommendationItemType | null,
  slug?: string | null,
) {
  if (!itemType || !slug) {
    return undefined;
  }

  if (itemType === "VEHICLE") {
    return `/vehicles/${slug}`;
  }

  if (itemType === "ENERGY_PRODUCT") {
    return `/energy/${slug}`;
  }

  return `/shop/${slug}`;
}

export function getInquiryContextTitle(input: {
  typeLabel: string;
  catalogTitle?: string | null;
  productSlug?: string | null;
}) {
  if (input.catalogTitle) {
    return `${input.typeLabel} for ${input.catalogTitle}`;
  }

  if (input.productSlug) {
    return `${input.typeLabel} for ${formatSlug(input.productSlug)}`;
  }

  return input.typeLabel;
}

export function getMessagePreview(value: string, maxLength = 148) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

export function sortBuildsForVehicleContinuity(
  builds: SavedBuildData[],
  vehicleSlug?: string,
) {
  return [...builds].sort((left, right) => {
    const leftMatches = left.vehicleSlug === vehicleSlug;
    const rightMatches = right.vehicleSlug === vehicleSlug;

    if (leftMatches !== rightMatches) {
      return leftMatches ? -1 : 1;
    }

    return right.updatedAt.getTime() - left.updatedAt.getTime();
  });
}
