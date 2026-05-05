import type {
  FavoriteItemTypeValue,
  InquiryTypeValue,
  SearchEventScopeValue,
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

export const adminSearchScopeLabels: Record<SearchEventScopeValue, string> = {
  ALL: "All categories",
  VEHICLE: "Vehicles",
  ENERGY: "Energy",
  SHOP: "Shop",
};
