import "server-only";

import { FavoriteItemType } from "@prisma/client";

import {
  mapEnergyProductRecord,
  mapShopProductRecord,
  mapVehicleRecord,
} from "@/lib/db/mappers";
import { prisma } from "@/lib/prisma";
import type { FavoriteDisplayItem } from "@/types";

export function getUserFavorites(userId: string) {
  return prisma.favorite
    .findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    .catch(() => []);
}

export function countFavoritesByUser(userId: string) {
  return prisma.favorite.count({
    where: {
      userId,
    },
  });
}

export function addFavorite(input: {
  userId: string;
  itemType: FavoriteItemType;
  itemSlug: string;
}) {
  return prisma.favorite.create({
    data: input,
  });
}

export function removeFavorite(input: {
  userId: string;
  itemType: FavoriteItemType;
  itemSlug: string;
}) {
  return prisma.favorite.delete({
    where: {
      userId_itemType_itemSlug: input,
    },
  });
}

export async function isFavorited(input: {
  userId: string;
  itemType: FavoriteItemType;
  itemSlug: string;
}) {
  try {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_itemType_itemSlug: input,
      },
    });

    return Boolean(favorite);
  } catch {
    return false;
  }
}

export async function getUserFavoriteItems(
  userId: string,
): Promise<FavoriteDisplayItem[]> {
  const favorites = await getUserFavorites(userId);

  const vehicleSlugs = favorites
    .filter((favorite) => favorite.itemType === FavoriteItemType.VEHICLE)
    .map((favorite) => favorite.itemSlug);
  const energySlugs = favorites
    .filter((favorite) => favorite.itemType === FavoriteItemType.ENERGY_PRODUCT)
    .map((favorite) => favorite.itemSlug);
  const shopSlugs = favorites
    .filter((favorite) => favorite.itemType === FavoriteItemType.SHOP_PRODUCT)
    .map((favorite) => favorite.itemSlug);

  const [vehicles, energyProducts, shopProducts] = await Promise.all([
    vehicleSlugs.length > 0
      ? prisma.vehicle.findMany({
          where: {
            slug: {
              in: vehicleSlugs,
            },
          },
        })
      : Promise.resolve([]),
    energySlugs.length > 0
      ? prisma.energyProduct.findMany({
          where: {
            slug: {
              in: energySlugs,
            },
          },
        })
      : Promise.resolve([]),
    shopSlugs.length > 0
      ? prisma.shopProduct.findMany({
          where: {
            slug: {
              in: shopSlugs,
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const vehicleMap = new Map(
    vehicles.map((vehicle) => [vehicle.slug, mapVehicleRecord(vehicle)]),
  );
  const energyMap = new Map(
    energyProducts.map((product) => [product.slug, mapEnergyProductRecord(product)]),
  );
  const shopMap = new Map(
    shopProducts.map((product) => [product.slug, mapShopProductRecord(product)]),
  );

  const items: FavoriteDisplayItem[] = [];

  for (const favorite of favorites) {
    if (favorite.itemType === FavoriteItemType.VEHICLE) {
      const vehicle = vehicleMap.get(favorite.itemSlug);

      if (!vehicle) {
        continue;
      }

      items.push({
        itemType: favorite.itemType,
        itemSlug: favorite.itemSlug,
        title: vehicle.title,
        description: vehicle.subtitle,
        href: `/vehicles/${vehicle.slug}`,
        image: vehicle.image,
        eyebrow: "Vehicle",
        price: vehicle.price,
      });

      continue;
    }

    if (favorite.itemType === FavoriteItemType.ENERGY_PRODUCT) {
      const product = energyMap.get(favorite.itemSlug);

      if (!product) {
        continue;
      }

      items.push({
        itemType: favorite.itemType,
        itemSlug: favorite.itemSlug,
        title: product.title,
        description: product.description,
        href: `/energy/${product.slug}`,
        image: product.image,
        eyebrow: "Energy",
      });

      continue;
    }

    const product = shopMap.get(favorite.itemSlug);

    if (!product) {
      continue;
    }

    items.push({
      itemType: favorite.itemType,
      itemSlug: favorite.itemSlug,
      title: product.title,
      description: product.description,
      href: `/shop/${product.slug}`,
      image: product.image,
      eyebrow: product.badge ?? "Shop",
      price: product.price,
    });
  }

  return items;
}
