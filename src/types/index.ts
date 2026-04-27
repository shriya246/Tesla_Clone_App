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
