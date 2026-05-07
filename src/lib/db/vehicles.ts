import "server-only";

import { vehicleLineup } from "@/data/vehicles";
import { cacheRevalidateSeconds, cacheTags, createCachedQuery } from "@/lib/cache";
import { mapVehicleRecord } from "@/lib/db/mappers";
import { prisma } from "@/lib/prisma";

export const getAllVehicles = createCachedQuery(async () => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    return vehicles.map(mapVehicleRecord);
  } catch {
    return vehicleLineup;
  }
}, ["vehicles:list:v2"], {
  revalidate: cacheRevalidateSeconds.catalog,
  tags: [cacheTags.catalog, cacheTags.vehicles],
});

export const getVehicleBySlug = createCachedQuery(async (slug: string) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: {
        slug,
      },
    });

    return vehicle ? mapVehicleRecord(vehicle) : null;
  } catch {
    return vehicleLineup.find((vehicle) => vehicle.slug === slug) ?? null;
  }
}, ["vehicles:detail:v2"], {
  revalidate: cacheRevalidateSeconds.catalog,
  tags: [cacheTags.catalog, cacheTags.vehicles],
});
