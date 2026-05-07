import "server-only";

import { createSavedBuild } from "@/lib/db/saved-builds";
import { publishEvent } from "@/lib/events";

interface SaveBuildInput {
  userId: string;
  vehicleSlug: string;
  vehicleTitle: string;
  vehicleImage: string;
  vehiclePrice: string;
  buildLabel?: string;
  selectedOptions: Parameters<typeof createSavedBuild>[0]["selectedOptions"];
}

export async function saveBuild(input: SaveBuildInput) {
  const savedBuild = await createSavedBuild(input);

  if (!savedBuild) {
    throw new Error("Saved build mapping failed.");
  }

  await publishEvent({
    type: "savedBuild.created",
    actor: {
      userId: input.userId,
    },
    entity: {
      type: "SAVED_BUILD",
      id: savedBuild.id,
    },
    payload: {
      buildId: savedBuild.id,
      userId: input.userId,
      vehicleSlug: savedBuild.vehicleSlug,
      buildHref: savedBuild.buildHref,
      configureHref: savedBuild.configureHref,
    },
  });

  return savedBuild;
}
