import "server-only";

import { cache } from "react";

import { shopProducts } from "@/data/shop";
import { mapShopProductRecord } from "@/lib/db/mappers";
import { prisma } from "@/lib/prisma";

export const getAllShopProducts = cache(async () => {
  try {
    const products = await prisma.shopProduct.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    return products.map(mapShopProductRecord);
  } catch {
    return shopProducts;
  }
});

export const getShopProductBySlug = cache(async (slug: string) => {
  try {
    const product = await prisma.shopProduct.findUnique({
      where: {
        slug,
      },
    });

    return product ? mapShopProductRecord(product) : null;
  } catch {
    return shopProducts.find((product) => product.slug === slug) ?? null;
  }
});
