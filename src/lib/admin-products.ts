import type {
  AdminProductCategory,
  FavoriteItemTypeValue,
} from "@/types";

export interface AdminProductCategoryConfig {
  category: AdminProductCategory;
  itemType: FavoriteItemTypeValue;
  categoryLabel: string;
  collectionTitle: string;
  collectionDescription: string;
  publicBasePath: "/vehicles" | "/energy" | "/shop";
}

export const adminProductCategoryConfigs: Record<
  AdminProductCategory,
  AdminProductCategoryConfig
> = {
  vehicles: {
    category: "vehicles",
    itemType: "VEHICLE",
    categoryLabel: "Vehicle",
    collectionTitle: "Vehicles",
    collectionDescription:
      "Performance-focused catalog entries with pricing, hero imagery, and detail routes.",
    publicBasePath: "/vehicles",
  },
  energy: {
    category: "energy",
    itemType: "ENERGY_PRODUCT",
    categoryLabel: "Energy",
    collectionTitle: "Energy",
    collectionDescription:
      "Clean-energy products with supporting product narratives and consultation routes.",
    publicBasePath: "/energy",
  },
  shop: {
    category: "shop",
    itemType: "SHOP_PRODUCT",
    categoryLabel: "Shop",
    collectionTitle: "Shop",
    collectionDescription:
      "Accessories and ownership add-ons with detail pages, pricing, and saved-item support.",
    publicBasePath: "/shop",
  },
};

export function isAdminProductCategory(
  value: string,
): value is AdminProductCategory {
  return value in adminProductCategoryConfigs;
}

export function getAdminProductCategoryConfig(category: AdminProductCategory) {
  return adminProductCategoryConfigs[category];
}

export function getAdminProductCategoryFromItemType(
  itemType: FavoriteItemTypeValue,
): AdminProductCategory {
  switch (itemType) {
    case "VEHICLE":
      return "vehicles";
    case "ENERGY_PRODUCT":
      return "energy";
    case "SHOP_PRODUCT":
      return "shop";
  }
}

export function getProductHref(itemType: FavoriteItemTypeValue, slug: string) {
  const category = getAdminProductCategoryFromItemType(itemType);

  return `${adminProductCategoryConfigs[category].publicBasePath}/${slug}`;
}

export function getAdminProductEditorHref(
  category: AdminProductCategory,
  id: string,
) {
  return `/admin/products/${category}/${id}`;
}

export function getAdminProductCreateHref(category: AdminProductCategory) {
  return `/admin/products/new/${category}`;
}
