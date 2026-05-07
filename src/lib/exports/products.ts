import "server-only";

import { getAllEnergyProducts } from "@/lib/db/energy";
import { getAllShopProducts } from "@/lib/db/shop";
import { getAllVehicles } from "@/lib/db/vehicles";
import { serializeCsv, type CsvColumnDefinition } from "@/lib/exports/csv";
import type { ProductImportItem } from "@/lib/imports/products";

interface ProductExportRow {
  itemType: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  price: string;
  badge: string;
  image: string;
  primaryButton: string;
  secondaryButton: string;
  specsJson: string;
  highlightsJson: string;
  detailFeaturesJson: string;
  createdAt: string;
  updatedAt: string;
}

const productExportColumns: CsvColumnDefinition<ProductExportRow>[] = [
  { key: "itemType", label: "Item Type" },
  { key: "slug", label: "Slug" },
  { key: "title", label: "Title" },
  { key: "subtitle", label: "Subtitle" },
  { key: "description", label: "Description" },
  { key: "longDescription", label: "Long Description" },
  { key: "price", label: "Price" },
  { key: "badge", label: "Badge" },
  { key: "image", label: "Image" },
  { key: "primaryButton", label: "Primary Button" },
  { key: "secondaryButton", label: "Secondary Button" },
  { key: "specsJson", label: "Specs JSON" },
  { key: "highlightsJson", label: "Highlights JSON" },
  { key: "detailFeaturesJson", label: "Detail Features JSON" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
];

export async function getProductExportItems(): Promise<ProductImportItem[]> {
  const [vehicles, energyProducts, shopProducts] = await Promise.all([
    getAllVehicles(),
    getAllEnergyProducts(),
    getAllShopProducts(),
  ]);

  return [
    ...vehicles.map((vehicle) => ({
      itemType: "VEHICLE" as const,
      title: vehicle.title,
      slug: vehicle.slug,
      image: vehicle.image,
      subtitle: vehicle.subtitle,
      description: vehicle.longDescription,
      price: vehicle.price ?? "",
      primaryButton: vehicle.primaryButton,
      secondaryButton: vehicle.secondaryButton,
      specs: vehicle.specs,
      highlights: vehicle.highlights,
    })),
    ...energyProducts.map((product) => ({
      itemType: "ENERGY_PRODUCT" as const,
      title: product.title,
      slug: product.slug,
      image: product.image,
      description: product.description,
      longDescription: product.longDescription,
      primaryButton: product.primaryButton,
      secondaryButton: product.secondaryButton,
      highlights: product.highlights,
      detailFeatures: product.supportingFeatures,
    })),
    ...shopProducts.map((product) => ({
      itemType: "SHOP_PRODUCT" as const,
      title: product.title,
      slug: product.slug,
      image: product.image,
      description: product.description,
      longDescription: product.longDescription,
      price: product.price,
      primaryButton: product.primaryButton,
      secondaryButton: product.secondaryButton,
      badge: product.badge,
      highlights: product.highlights,
      detailFeatures: product.specs,
    })),
  ];
}

export async function getProductExportRows(): Promise<ProductExportRow[]> {
  const [vehicles, energyProducts, shopProducts] = await Promise.all([
    getAllVehicles(),
    getAllEnergyProducts(),
    getAllShopProducts(),
  ]);

  return [
    ...vehicles.map((vehicle) => ({
      itemType: "VEHICLE",
      slug: vehicle.slug,
      title: vehicle.title,
      subtitle: vehicle.subtitle,
      description: vehicle.longDescription,
      longDescription: "",
      price: vehicle.price ?? "",
      badge: "",
      image: vehicle.image,
      primaryButton: vehicle.primaryButton,
      secondaryButton: vehicle.secondaryButton,
      specsJson: JSON.stringify(vehicle.specs),
      highlightsJson: JSON.stringify(vehicle.highlights),
      detailFeaturesJson: "[]",
      createdAt: vehicle.createdAt?.toISOString() ?? "",
      updatedAt: vehicle.updatedAt?.toISOString() ?? "",
    })),
    ...energyProducts.map((product) => ({
      itemType: "ENERGY_PRODUCT",
      slug: product.slug,
      title: product.title,
      subtitle: "",
      description: product.description,
      longDescription: product.longDescription,
      price: "",
      badge: "",
      image: product.image,
      primaryButton: product.primaryButton,
      secondaryButton: product.secondaryButton,
      specsJson: "[]",
      highlightsJson: JSON.stringify(product.highlights),
      detailFeaturesJson: JSON.stringify(product.supportingFeatures),
      createdAt: product.createdAt?.toISOString() ?? "",
      updatedAt: product.updatedAt?.toISOString() ?? "",
    })),
    ...shopProducts.map((product) => ({
      itemType: "SHOP_PRODUCT",
      slug: product.slug,
      title: product.title,
      subtitle: "",
      description: product.description,
      longDescription: product.longDescription,
      price: product.price,
      badge: product.badge ?? "",
      image: product.image,
      primaryButton: product.primaryButton,
      secondaryButton: product.secondaryButton,
      specsJson: "[]",
      highlightsJson: JSON.stringify(product.highlights),
      detailFeaturesJson: JSON.stringify(product.specs),
      createdAt: product.createdAt?.toISOString() ?? "",
      updatedAt: product.updatedAt?.toISOString() ?? "",
    })),
  ];
}

export async function buildProductExportCsv() {
  return serializeCsv(productExportColumns, await getProductExportRows());
}
