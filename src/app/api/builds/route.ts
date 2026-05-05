import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getVehicleConfiguratorDefinition,
  resolveVehicleConfiguratorState,
} from "@/lib/configurator/vehicle-configurator";
import { createSavedBuild } from "@/lib/db/saved-builds";
import { getVehicleBySlug } from "@/lib/db/vehicles";
import { saveBuildPayloadSchema } from "@/lib/validations/saved-build";
import type { SavedBuildMutationResponse } from "@/types";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    const response: SavedBuildMutationResponse = {
      success: false,
      message: "Sign in to save this configuration.",
      redirectTo: `/signin?callbackUrl=${encodeURIComponent("/account/builds")}`,
    };

    return NextResponse.json(response, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    const response: SavedBuildMutationResponse = {
      success: false,
      message: "We could not read this build request. Please try again.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  const parsed = saveBuildPayloadSchema.safeParse(body);

  if (!parsed.success) {
    const response: SavedBuildMutationResponse = {
      success: false,
      message: "Please review the build details and try again.",
      fieldErrors: {
        buildLabel: parsed.error.flatten().fieldErrors.buildLabel,
      },
    };

    return NextResponse.json(response, { status: 400 });
  }

  const vehicle = await getVehicleBySlug(parsed.data.vehicleSlug);

  if (!vehicle) {
    const response: SavedBuildMutationResponse = {
      success: false,
      message: "This vehicle is not available for configuration right now.",
    };

    return NextResponse.json(response, { status: 404 });
  }

  try {
    const definition = getVehicleConfiguratorDefinition(vehicle);
    const resolvedState = resolveVehicleConfiguratorState(
      definition,
      parsed.data.selectionIds,
    );
    const savedBuild = await createSavedBuild({
      userId,
      vehicleSlug: vehicle.slug,
      vehicleTitle: vehicle.title,
      vehicleImage: vehicle.image,
      vehiclePrice: definition.vehiclePrice,
      buildLabel: parsed.data.buildLabel,
      selectedOptions: resolvedState.selectedOptions,
    });

    if (!savedBuild) {
      throw new Error("Saved build mapping failed.");
    }

    revalidatePath("/account");
    revalidatePath("/account/builds");
    revalidatePath(savedBuild.buildHref);

    const response: SavedBuildMutationResponse = {
      success: true,
      message: `Your ${vehicle.title} build has been saved.`,
      buildId: savedBuild.id,
      redirectTo: savedBuild.buildHref,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Failed to save build.", error);

    const response: SavedBuildMutationResponse = {
      success: false,
      message:
        "We could not save this build right now. Please try again in a moment.",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
