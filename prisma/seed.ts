import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";

import { energyProducts } from "../src/data/energy";
import { shopProducts } from "../src/data/shop";
import { vehicleLineup } from "../src/data/vehicles";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

function toJson<T>(value: T): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function requireString(value: string | undefined, fieldName: string, slug: string) {
  if (!value) {
    throw new Error(`Missing required ${fieldName} for seed item: ${slug}`);
  }

  return value;
}

function shouldPreserveUploadedImage(existingImage?: string | null) {
  if (!existingImage) {
    return false;
  }

  return /^https?:\/\//i.test(existingImage.trim());
}

async function seedVehicles() {
  for (const vehicle of vehicleLineup) {
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { slug: vehicle.slug },
      select: {
        id: true,
        image: true,
      },
    });
    const image = shouldPreserveUploadedImage(existingVehicle?.image)
      ? existingVehicle!.image
      : vehicle.image;

    if (existingVehicle) {
      await prisma.vehicle.update({
        where: { id: existingVehicle.id },
        data: {
          title: vehicle.title,
          subtitle: vehicle.subtitle,
          description: vehicle.longDescription,
          price: requireString(vehicle.price, "price", vehicle.slug),
          image,
          primaryButton: vehicle.primaryButton,
          secondaryButton: vehicle.secondaryButton,
          specs: toJson(vehicle.specs),
          highlights: toJson(vehicle.highlights),
        },
      });

      continue;
    }

    await prisma.vehicle.create({
      data: {
        slug: vehicle.slug,
        title: vehicle.title,
        subtitle: vehicle.subtitle,
        description: vehicle.longDescription,
        price: requireString(vehicle.price, "price", vehicle.slug),
        image,
        primaryButton: vehicle.primaryButton,
        secondaryButton: vehicle.secondaryButton,
        specs: toJson(vehicle.specs),
        highlights: toJson(vehicle.highlights),
      },
    });
  }
}

async function seedEnergyProducts() {
  for (const product of energyProducts) {
    const existingProduct = await prisma.energyProduct.findUnique({
      where: { slug: product.slug },
      select: {
        id: true,
        image: true,
      },
    });
    const image = shouldPreserveUploadedImage(existingProduct?.image)
      ? existingProduct!.image
      : product.image;

    if (existingProduct) {
      await prisma.energyProduct.update({
        where: { id: existingProduct.id },
        data: {
          title: product.title,
          description: product.description,
          longDescription: product.longDescription,
          image,
          primaryButton: product.primaryButton,
          secondaryButton: product.secondaryButton,
          highlights: toJson(product.highlights),
          detailFeatures: toJson(product.supportingFeatures),
        },
      });

      continue;
    }

    await prisma.energyProduct.create({
      data: {
        slug: product.slug,
        title: product.title,
        description: product.description,
        longDescription: product.longDescription,
        image,
        primaryButton: product.primaryButton,
        secondaryButton: product.secondaryButton,
        highlights: toJson(product.highlights),
        detailFeatures: toJson(product.supportingFeatures),
      },
    });
  }
}

async function seedShopProducts() {
  for (const product of shopProducts) {
    const existingProduct = await prisma.shopProduct.findUnique({
      where: { slug: product.slug },
      select: {
        id: true,
        image: true,
      },
    });
    const image = shouldPreserveUploadedImage(existingProduct?.image)
      ? existingProduct!.image
      : product.image;

    if (existingProduct) {
      await prisma.shopProduct.update({
        where: { id: existingProduct.id },
        data: {
          title: product.title,
          description: product.description,
          longDescription: product.longDescription,
          image,
          price: product.price,
          primaryButton: product.primaryButton,
          secondaryButton: product.secondaryButton,
          badge: product.badge,
          highlights: toJson(product.highlights),
          detailFeatures: toJson(product.specs),
        },
      });

      continue;
    }

    await prisma.shopProduct.create({
      data: {
        slug: product.slug,
        title: product.title,
        description: product.description,
        longDescription: product.longDescription,
        image,
        price: product.price,
        primaryButton: product.primaryButton,
        secondaryButton: product.secondaryButton,
        badge: product.badge,
        highlights: toJson(product.highlights),
        detailFeatures: toJson(product.specs),
      },
    });
  }
}

async function main() {
  await seedVehicles();
  await seedEnergyProducts();
  await seedShopProducts();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Prisma seed failed.", error);
    await prisma.$disconnect();
    process.exit(1);
  });
