import type { MetadataRoute } from "next";

import { getAllEnergyProducts } from "@/lib/db/energy";
import { getAllShopProducts } from "@/lib/db/shop";
import { getAllVehicles } from "@/lib/db/vehicles";
import { createAbsoluteUrl } from "@/lib/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [vehicles, energyProducts, shopProducts] = await Promise.all([
    getAllVehicles(),
    getAllEnergyProducts(),
    getAllShopProducts(),
  ]);

  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: createAbsoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: createAbsoluteUrl("/vehicles"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: createAbsoluteUrl("/energy"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: createAbsoluteUrl("/shop"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: createAbsoluteUrl("/charging"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: createAbsoluteUrl("/discover"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = [
    ...vehicles.map((vehicle) => ({
      url: createAbsoluteUrl(`/vehicles/${vehicle.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...energyProducts.map((product) => ({
      url: createAbsoluteUrl(`/energy/${product.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...shopProducts.map((product) => ({
      url: createAbsoluteUrl(`/shop/${product.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  ];

  return [...staticRoutes, ...productRoutes];
}
