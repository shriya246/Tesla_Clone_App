import "server-only";

import { shopProducts } from "@/data/shop";
import { cacheRevalidateSeconds, cacheTags, createCachedQuery } from "@/lib/cache";
import { mapShopProductRecord } from "@/lib/db/mappers";
import { prisma } from "@/lib/prisma";

export const getAllShopProducts = createCachedQuery(async () => {
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
}, ["shop-products:list:v2"], {
  revalidate: cacheRevalidateSeconds.catalog,
  tags: [cacheTags.catalog, cacheTags.shopProducts],
});

export const getShopProductBySlug = createCachedQuery(async (slug: string) => {
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
}, ["shop-products:detail:v2"], {
  revalidate: cacheRevalidateSeconds.catalog,
  tags: [cacheTags.catalog, cacheTags.shopProducts],
});
