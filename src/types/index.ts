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
}

export interface EnergyProductData extends EnergySectionData {
  slug: string;
  longDescription: string;
  highlights: DetailFeature[];
  supportingFeatures: DetailFeature[];
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
}

export interface ShopFeatureData extends FeatureSectionData {}

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
  userCount: number;
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
