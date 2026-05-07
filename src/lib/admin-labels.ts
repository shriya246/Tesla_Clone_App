import type {
  AutomationRunStatusValue,
  FavoriteItemTypeValue,
  InquiryPriorityValue,
  InquiryStatusValue,
  InquiryTypeValue,
  SearchEventScopeValue,
  UserIntentLevelValue,
} from "@/types";

export const adminInquiryTypeLabels: Record<InquiryTypeValue, string> = {
  VEHICLE_DEMO_REQUEST: "Vehicle Demo",
  PRODUCT_INQUIRY: "Product Inquiry",
  ENERGY_CONSULTATION: "Energy Consultation",
  GENERAL: "General Inquiry",
};

export const adminItemTypeLabels: Record<FavoriteItemTypeValue, string> = {
  VEHICLE: "Vehicle",
  ENERGY_PRODUCT: "Energy",
  SHOP_PRODUCT: "Shop",
};

export const adminInquiryStatusLabels: Record<InquiryStatusValue, string> = {
  NEW: "New",
  PRIORITIZED: "Prioritized",
  FOLLOW_UP: "Follow Up",
  CLOSED: "Closed",
};

export const adminInquiryPriorityLabels: Record<InquiryPriorityValue, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

export const adminUserIntentLevelLabels: Record<UserIntentLevelValue, string> = {
  STANDARD: "Standard",
  ENGAGED: "Engaged",
  HIGH_INTENT: "High Intent",
};

export const automationRunStatusLabels: Record<AutomationRunStatusValue, string> = {
  SUCCESS: "Success",
  PARTIAL_FAILURE: "Partial Failure",
  FAILED: "Failed",
};

export const adminSearchScopeLabels: Record<SearchEventScopeValue, string> = {
  ALL: "All categories",
  VEHICLE: "Vehicles",
  ENERGY: "Energy",
  SHOP: "Shop",
};

export function formatOperationalTagLabel(tag: string) {
  return tag
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
