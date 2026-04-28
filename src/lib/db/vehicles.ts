import "server-only";

import { cache } from "react";

import { vehicleLineup } from "@/data/vehicles";
import { mapVehicleRecord } from "@/lib/db/mappers";
import { prisma } from "@/lib/prisma";

export const getAllVehicles = cache(async () => {
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
});

export const getVehicleBySlug = cache(async (slug: string) => {
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
});
