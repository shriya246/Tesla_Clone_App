export type ButtonVariant = "primary" | "secondary";

export interface ButtonLink {
  label: string;
  href: string;
}

export interface NavigationItem {
  label: string;
  href: string;
}

export interface UtilityItem {
  label: string;
  symbol: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface BreadcrumbItem {
  label?: string;
  href?: string;
}

export interface PageHeaderData {
  title: string;
  subtitle: string;
  image?: string;
  primaryButton?: ButtonLink;
  secondaryButton?: ButtonLink;
}

export interface CallToActionSectionData {
  title: string;
  subtitle: string;
  price?: string;
  primaryButton: string;
  secondaryButton: string;
  image: string;
}

export interface HeroSectionData extends CallToActionSectionData {}

export interface ProductSectionData extends CallToActionSectionData {}

export interface OfferSectionData {
  title: string;
  description: string;
  primaryButton: string;
  secondaryButton: string;
  image: string;
  badge?: string;
}

export interface FeatureSectionData {
  title: string;
  description: string;
  image: string;
  linkText?: string;
}

export interface ChargingHighlightData extends FeatureSectionData {}

export interface DiscoverTopicData extends FeatureSectionData {}

export interface ChargingStatData {
  value: string;
  label: string;
  description?: string;
}

export interface ChargingSectionData {
  title: string;
  description: string;
  image: string;
  primaryButton: string;
  secondaryButton: string;
  stats: ChargingStatData[];
}

export interface EnergySectionData {
  title: string;
  description: string;
  image: string;
  primaryButton: string;
  secondaryButton: string;
}

export interface DetailSpec {
  label: string;
  value: string;
}

export interface DetailFeature {
  title: string;
  description: string;
}

export interface DetailHeroData {
  eyebrow?: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  price?: string;
  primaryButton: string;
  secondaryButton: string;
  primaryHref?: string;
  secondaryHref?: string;
}

export interface RelatedItemData {
  title: string;
  description: string;
  href: string;
  image: string;
  eyebrow?: string;
  price?: string;
}

export interface VehicleData extends ProductSectionData {
  slug: string;
  longDescription: string;
  specs: DetailSpec[];
  highlights: DetailFeature[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EnergyProductData extends EnergySectionData {
  slug: string;
  longDescription: string;
  highlights: DetailFeature[];
  supportingFeatures: DetailFeature[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ShopProductData {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  price: string;
  image: string;
  primaryButton: string;
  secondaryButton: string;
  badge?: string;
  highlights: DetailFeature[];
  specs: DetailSpec[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ShopFeatureData extends FeatureSectionData {}

export type VehicleBuildOptionKey =
  | "trim"
  | "range"
  | "exteriorColor"
  | "interior";

export interface VehicleConfiguratorOption {
  id: string;
  label: string;
  description: string;
  priceDelta: number;
  swatch?: string;
  badge?: string;
}

export interface VehicleConfiguratorOptionGroup {
  key: VehicleBuildOptionKey;
  label: string;
  description: string;
  options: VehicleConfiguratorOption[];
}

export interface VehicleBuildSelectionIds {
  trim: string;
  range: string;
  exteriorColor: string;
  interior: string;
}

export interface SavedBuildOptionSelection {
  key: VehicleBuildOptionKey;
  label: string;
  optionId: string;
  optionLabel: string;
  description: string;
  priceDelta: number;
  swatch?: string;
  badge?: string;
}

export interface SavedBuildSelectedOptions {
  trim: SavedBuildOptionSelection;
  range: SavedBuildOptionSelection;
  exteriorColor: SavedBuildOptionSelection;
  interior: SavedBuildOptionSelection;
}

export interface VehicleConfiguratorDefinition {
  vehicleSlug: string;
  vehicleTitle: string;
  vehicleSubtitle: string;
  vehicleImage: string;
  vehiclePrice: string;
  basePriceValue: number;
  groups: VehicleConfiguratorOptionGroup[];
  defaultSelectionIds: VehicleBuildSelectionIds;
}

export interface VehicleConfiguratorState {
  selectionIds: VehicleBuildSelectionIds;
  selectedOptions: SavedBuildSelectedOptions;
  estimatedPrice: string;
  estimatedPriceValue: number;
}

export interface SavedBuildData {
  id: string;
  userId: string;
  vehicleSlug: string;
  vehicleTitle: string;
  vehicleImage: string;
  vehiclePrice: string;
  buildLabel?: string;
  selectedOptions: SavedBuildSelectedOptions;
  createdAt: Date;
  updatedAt: Date;
  estimatedPrice: string;
  buildHref: string;
  configureHref: string;
}

export type SearchProductType = "vehicle" | "energy" | "shop";

export type SearchFilterType = "all" | SearchProductType;

export type SearchEventScopeValue = "ALL" | "VEHICLE" | "ENERGY" | "SHOP";

export type SearchSortOption =
  | "featured"
  | "relevance"
  | "title"
  | "price-asc"
  | "price-desc"
  | "updated";

export interface SearchResultItem {
  id: string;
  type: SearchProductType;
  typeLabel: string;
  slug: string;
  href: string;
  title: string;
  description: string;
  image: string;
  ctaLabel: string;
  price?: string;
  badge?: string;
  updatedAt?: Date;
}

export interface SearchSuggestion {
  id: string;
  type: SearchProductType;
  typeLabel: string;
  href: string;
  title: string;
  price?: string;
}

export type InquiryTypeValue =
  | "VEHICLE_DEMO_REQUEST"
  | "PRODUCT_INQUIRY"
  | "ENERGY_CONSULTATION"
  | "GENERAL";

export type InquiryItemTypeValue = "VEHICLE" | "ENERGY_PRODUCT" | "SHOP_PRODUCT";

export interface InquiryFormFields {
  name: string;
  email: string;
  phone?: string;
  message: string;
  website?: string;
}

export interface InquiryPayload extends InquiryFormFields {
  type: InquiryTypeValue;
  itemType?: InquiryItemTypeValue;
  productSlug?: string;
}

export interface InquiryApiResponse {
  success: boolean;
  message: string;
  emailStatus?: "sent" | "partial_failure" | "skipped";
  retryAfterSeconds?: number;
  fieldErrors?: Partial<Record<keyof InquiryFormFields, string[]>>;
}

export interface InquiryFormProps {
  title: string;
  description: string;
  submitLabel: string;
  successTitle: string;
  successMessage: string;
  type: InquiryTypeValue;
  itemType?: InquiryItemTypeValue;
  productSlug?: string;
  contextLabel?: string;
  contextValue?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  defaultMessage?: string;
}

export type FavoriteItemTypeValue = "VEHICLE" | "ENERGY_PRODUCT" | "SHOP_PRODUCT";

export type AdminProductCategory = "vehicles" | "energy" | "shop";

export interface FavoriteDisplayItem {
  itemType: FavoriteItemTypeValue;
  itemSlug: string;
  title: string;
  description: string;
  href: string;
  image: string;
  eyebrow: string;
  price?: string;
}

export interface AdminProductListItem {
  id: string;
  category: AdminProductCategory;
  itemType: FavoriteItemTypeValue;
  categoryLabel: string;
  title: string;
  slug: string;
  href: string;
  adminHref: string;
  summary: string;
  image: string;
  isRemoteImage: boolean;
  price?: string;
  updatedAt: Date;
  engagement: AdminProductEngagementMetrics;
}

export interface AdminProductCollection {
  vehicles: AdminProductListItem[];
  energyProducts: AdminProductListItem[];
  shopProducts: AdminProductListItem[];
  totalCount: number;
}

export interface AdminInquiryListItem {
  id: string;
  type: InquiryTypeValue;
  itemType?: InquiryItemTypeValue;
  name: string;
  email: string;
  phone?: string | null;
  productSlug?: string | null;
  message: string;
  messagePreview: string;
  href?: string;
  adminHref: string;
  createdAt: Date;
  userName?: string | null;
  userEmail?: string | null;
}

export interface AdminInquiryDetailItem extends AdminInquiryListItem {}

export interface AdminDashboardSummary {
  vehicleCount: number;
  energyCount: number;
  shopCount: number;
  totalProducts: number;
  inquiryCount: number;
  favoriteCount: number;
  savedBuildCount: number;
  searchEventCount: number;
  recentlyViewedCount: number;
  userCount: number;
}

export interface AdminProductEngagementMetrics {
  views: number;
  favorites: number;
  savedBuilds: number;
  inquiries: number;
  totalSignals: number;
  weightedScore: number;
}

export interface AdminCountTrendItem {
  key: string;
  label: string;
  count: number;
  href?: string;
}

export interface AdminTimeTrendPoint {
  label: string;
  count: number;
}

export interface AdminCategoryEngagementItem {
  itemType: FavoriteItemTypeValue;
  label: string;
  views: number;
  favorites: number;
  savedBuilds: number;
  inquiries: number;
  totalSignals: number;
  weightedScore: number;
}

export interface AdminProductPopularityData {
  totalTrackedViews: number;
  totalFavorites: number;
  totalSavedBuilds: number;
  totalProductInquiries: number;
  activeProducts: number;
  topViewedVehicles: AdminProductListItem[];
  topViewedProducts: AdminProductListItem[];
  mostFavoritedItems: AdminProductListItem[];
  mostSavedBuildVehicles: AdminProductListItem[];
  topCategories: AdminCategoryEngagementItem[];
  productEngagementTable: AdminProductListItem[];
}

export interface AdminInquiryTrendsData {
  totalCount: number;
  recent30DayCount: number;
  byType: AdminCountTrendItem[];
  byItemType: AdminCountTrendItem[];
  topProductSlugs: AdminCountTrendItem[];
  recentDailyVolume: AdminTimeTrendPoint[];
}

export interface AdminSearchQueryTrend {
  normalizedQuery: string;
  label: string;
  count: number;
  averageResultCount: number;
  zeroResultCount: number;
  scopeLabel: string;
  topResultLabel?: string;
  lastSearchedAt: Date;
}

export interface AdminSearchScopeTrend {
  scope: SearchEventScopeValue;
  label: string;
  count: number;
  averageResultCount: number;
}

export interface AdminSearchTrendsData {
  totalCount: number;
  recent30DayCount: number;
  zeroResultCount: number;
  topQueries: AdminSearchQueryTrend[];
  byScope: AdminSearchScopeTrend[];
  recentDailyVolume: AdminTimeTrendPoint[];
}

export interface AdminInsightsSnapshot {
  topViewedProduct: AdminProductListItem | null;
  topFavoritedProduct: AdminProductListItem | null;
  topSearchQuery: AdminSearchQueryTrend | null;
}

export interface AdminMediaUploadResponse {
  success: boolean;
  message: string;
  imageUrl?: string;
  publicId?: string;
  fieldErrors?: {
    file?: string[];
  };
}

export interface AdminProductMutationResponse {
  success: boolean;
  message: string;
  redirectTo?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export interface SavedBuildMutationResponse {
  success: boolean;
  message: string;
  buildId?: string;
  redirectTo?: string;
  fieldErrors?: {
    buildLabel?: string[];
  };
}
