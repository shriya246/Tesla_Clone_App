import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { cacheTags, revalidateCachePaths, revalidateCacheTags } from "@/lib/cache";
import { deleteSavedBuild } from "@/lib/db/saved-builds";
import type { SavedBuildMutationResponse } from "@/types";

interface DeleteSavedBuildRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(
  _request: Request,
  { params }: DeleteSavedBuildRouteProps,
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    const response: SavedBuildMutationResponse = {
      success: false,
      message: "Sign in to manage your saved builds.",
      redirectTo: `/signin?callbackUrl=${encodeURIComponent("/account/builds")}`,
    };

    return NextResponse.json(response, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteSavedBuild({
    buildId: id,
    userId,
  });

  if (!deleted) {
    const response: SavedBuildMutationResponse = {
      success: false,
      message: "We could not find that saved build.",
    };

    return NextResponse.json(response, { status: 404 });
  }

  revalidateCachePaths(["/account", "/account/builds", `/account/builds/${id}`]);
  revalidateCacheTags([
    cacheTags.account,
    cacheTags.adminInsights,
    cacheTags.recommendations,
  ]);

  const response: SavedBuildMutationResponse = {
    success: true,
    message: "Saved build removed.",
    redirectTo: "/account/builds",
  };

  return NextResponse.json(response);
}
