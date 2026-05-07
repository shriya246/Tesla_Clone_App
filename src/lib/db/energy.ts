import "server-only";

import { energyProducts } from "@/data/energy";
import { cacheRevalidateSeconds, cacheTags, createCachedQuery } from "@/lib/cache";
import { mapEnergyProductRecord } from "@/lib/db/mappers";
import { prisma } from "@/lib/prisma";

export const getAllEnergyProducts = createCachedQuery(async () => {
  try {
    const products = await prisma.energyProduct.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    return products.map(mapEnergyProductRecord);
  } catch {
    return energyProducts;
  }
}, ["energy-products:list:v2"], {
  revalidate: cacheRevalidateSeconds.catalog,
  tags: [cacheTags.catalog, cacheTags.energyProducts],
});

export const getEnergyProductBySlug = createCachedQuery(async (slug: string) => {
  try {
    const product = await prisma.energyProduct.findUnique({
      where: {
        slug,
      },
    });

    return product ? mapEnergyProductRecord(product) : null;
  } catch {
    return energyProducts.find((product) => product.slug === slug) ?? null;
  }
}, ["energy-products:detail:v2"], {
  revalidate: cacheRevalidateSeconds.catalog,
  tags: [cacheTags.catalog, cacheTags.energyProducts],
});
