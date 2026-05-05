import "server-only";

import type { Prisma, SavedBuild as SavedBuildRecord } from "@prisma/client";

import {
  calculateSavedBuildEstimatedPrice,
} from "@/lib/configurator/vehicle-configurator";
import { prisma } from "@/lib/prisma";
import { savedBuildSelectedOptionsSchema } from "@/lib/validations/saved-build";
import type { SavedBuildData, SavedBuildSelectedOptions } from "@/types";

function mapSavedBuildRecord(record: SavedBuildRecord): SavedBuildData | null {
  const parsedSelections = savedBuildSelectedOptionsSchema.safeParse(
    record.selectedOptions,
  );

  if (!parsedSelections.success) {
    return null;
  }

  const selectedOptions: SavedBuildSelectedOptions = parsedSelections.data;

  return {
    id: record.id,
    userId: record.userId,
    vehicleSlug: record.vehicleSlug,
    vehicleTitle: record.vehicleTitle,
    vehicleImage: record.vehicleImage,
    vehiclePrice: record.vehiclePrice,
    buildLabel: record.buildLabel ?? undefined,
    selectedOptions,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    estimatedPrice: calculateSavedBuildEstimatedPrice(
      record.vehiclePrice,
      selectedOptions,
    ),
    buildHref: `/account/builds/${record.id}`,
    configureHref: `/vehicles/${record.vehicleSlug}/configure?build=${record.id}`,
  };
}

export async function getSavedBuildsByUser(userId: string): Promise<SavedBuildData[]> {
  try {
    const builds = await prisma.savedBuild.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return builds.flatMap((build) => {
      const mapped = mapSavedBuildRecord(build);

      return mapped ? [mapped] : [];
    });
  } catch {
    return [];
  }
}

export async function getRecentSavedBuildsByUser(
  userId: string,
  limit = 3,
): Promise<SavedBuildData[]> {
  try {
    const builds = await prisma.savedBuild.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
    });

    return builds.flatMap((build) => {
      const mapped = mapSavedBuildRecord(build);

      return mapped ? [mapped] : [];
    });
  } catch {
    return [];
  }
}

export async function getSavedBuildById(input: {
  buildId: string;
  userId: string;
}): Promise<SavedBuildData | null> {
  try {
    const build = await prisma.savedBuild.findFirst({
      where: {
        id: input.buildId,
        userId: input.userId,
      },
    });

    if (!build) {
      return null;
    }

    return mapSavedBuildRecord(build);
  } catch {
    return null;
  }
}

export async function createSavedBuild(input: {
  userId: string;
  vehicleSlug: string;
  vehicleTitle: string;
  vehicleImage: string;
  vehiclePrice: string;
  buildLabel?: string;
  selectedOptions: SavedBuildSelectedOptions;
}): Promise<SavedBuildData | null> {
  const record = await prisma.savedBuild.create({
    data: {
      userId: input.userId,
      vehicleSlug: input.vehicleSlug,
      vehicleTitle: input.vehicleTitle,
      vehicleImage: input.vehicleImage,
      vehiclePrice: input.vehiclePrice,
      buildLabel: input.buildLabel,
      selectedOptions: input.selectedOptions as unknown as Prisma.InputJsonValue,
    },
  });

  return mapSavedBuildRecord(record);
}

export async function deleteSavedBuild(input: {
  buildId: string;
  userId: string;
}) {
  try {
    const result = await prisma.savedBuild.deleteMany({
      where: {
        id: input.buildId,
        userId: input.userId,
      },
    });

    return result.count > 0;
  } catch {
    return false;
  }
}
