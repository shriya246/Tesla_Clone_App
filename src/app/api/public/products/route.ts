import { NextResponse } from "next/server";
import { z } from "zod";

import { requirePartnerApiKey } from "@/lib/api/partner-auth";
import { getAllEnergyProducts } from "@/lib/db/energy";
import { getAllShopProducts } from "@/lib/db/shop";
import { getAllVehicles } from "@/lib/db/vehicles";

const querySchema = z.object({
  type: z.enum(["all", "vehicle", "energy", "shop"]).default("all"),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  updatedSince: z.string().datetime().optional(),
});

export async function GET(request: Request) {
  const partnerAccess = requirePartnerApiKey(request);

  if ("errorResponse" in partnerAccess) {
    return partnerAccess.errorResponse;
  }

  const url = new URL(request.url);
  const parsedQuery = querySchema.safeParse({
    type: url.searchParams.get("type") ?? "all",
    limit: url.searchParams.get("limit") ?? "50",
    updatedSince: url.searchParams.get("updatedSince") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Use type=all|vehicle|energy|shop, limit=1-200, and an ISO updatedSince value when provided.",
      },
      { status: 400 },
    );
  }

  const updatedSince = parsedQuery.data.updatedSince
    ? new Date(parsedQuery.data.updatedSince)
    : null;
  const [vehicles, energyProducts, shopProducts] = await Promise.all([
    getAllVehicles(),
    getAllEnergyProducts(),
    getAllShopProducts(),
  ]);
  const items = [
    ...vehicles.map((vehicle) => ({
      type: "vehicle" as const,
      itemType: "VEHICLE" as const,
      slug: vehicle.slug,
      href: `/vehicles/${vehicle.slug}`,
      title: vehicle.title,
      description: vehicle.subtitle,
      image: vehicle.image,
      price: vehicle.price,
      createdAt: vehicle.createdAt?.toISOString() ?? null,
      updatedAt: vehicle.updatedAt?.toISOString() ?? null,
    })),
    ...energyProducts.map((product) => ({
      type: "energy" as const,
      itemType: "ENERGY_PRODUCT" as const,
      slug: product.slug,
      href: `/energy/${product.slug}`,
      title: product.title,
      description: product.description,
      image: product.image,
      createdAt: product.createdAt?.toISOString() ?? null,
      updatedAt: product.updatedAt?.toISOString() ?? null,
    })),
    ...shopProducts.map((product) => ({
      type: "shop" as const,
      itemType: "SHOP_PRODUCT" as const,
      slug: product.slug,
      href: `/shop/${product.slug}`,
      title: product.title,
      description: product.description,
      image: product.image,
      price: product.price,
      badge: product.badge,
      createdAt: product.createdAt?.toISOString() ?? null,
      updatedAt: product.updatedAt?.toISOString() ?? null,
    })),
  ]
    .filter((item) =>
      parsedQuery.data.type === "all" ? true : item.type === parsedQuery.data.type,
    )
    .filter((item) => {
      if (!updatedSince || !item.updatedAt) {
        return true;
      }

      return new Date(item.updatedAt).getTime() >= updatedSince.getTime();
    })
    .sort((left, right) => {
      const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
      const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;

      if (rightTime !== leftTime) {
        return rightTime - leftTime;
      }

      return left.title.localeCompare(right.title);
    })
    .slice(0, parsedQuery.data.limit);

  return NextResponse.json(
    {
      success: true,
      exportedAt: new Date().toISOString(),
      count: items.length,
      items,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
