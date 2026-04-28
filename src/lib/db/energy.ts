import "server-only";

import { cache } from "react";

import { energyProducts } from "@/data/energy";
import { mapEnergyProductRecord } from "@/lib/db/mappers";
import { prisma } from "@/lib/prisma";

export const getAllEnergyProducts = cache(async () => {
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
});

export const getEnergyProductBySlug = cache(async (slug: string) => {
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
});
