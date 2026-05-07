import type { UserIntentLevel } from "@prisma/client";

import { cacheTags, revalidateCachePaths, revalidateCacheTags } from "@/lib/cache";
import {
  countFavoritesByUser,
  countInquiriesByUser,
  countSavedBuildsByUser,
  getUserWorkflowProfileById,
  updateUserWorkflowProfile,
} from "@/lib/db";
import { resolveUserIntentProfile } from "@/lib/events/rules/user-intent";
import type { AppEvent, EventHandler } from "@/lib/events/types";

async function syncUserIntentFromSavedBuild(
  event: AppEvent<"savedBuild.created">,
) {
  const userId = event.payload.userId;
  const [currentProfile, savedBuildCount, favoriteCount, inquiryCount] =
    await Promise.all([
      getUserWorkflowProfileById(userId),
      countSavedBuildsByUser(userId),
      countFavoritesByUser(userId),
      countInquiriesByUser(userId),
    ]);
  const resolvedProfile = resolveUserIntentProfile({
    savedBuildCount,
    favoriteCount,
    inquiryCount,
    currentIntentLevel: currentProfile?.intentLevel,
    currentRecommendationEligible: currentProfile?.recommendationEligible,
  });

  if (
    currentProfile?.intentLevel === resolvedProfile.intentLevel &&
    currentProfile.recommendationEligible === resolvedProfile.recommendationEligible
  ) {
    return {
      message: `Saved build retained the existing ${resolvedProfile.intentLevel.toLowerCase()} user intent profile.`,
    };
  }

  await updateUserWorkflowProfile({
    id: userId,
    intentLevel: resolvedProfile.intentLevel as UserIntentLevel,
    recommendationEligible: resolvedProfile.recommendationEligible,
    intentQualifiedAt:
      resolvedProfile.recommendationEligible &&
      !currentProfile?.intentQualifiedAt
        ? new Date()
        : currentProfile?.intentQualifiedAt,
  });

  return {
    message: `Saved build updated the user workflow profile to ${resolvedProfile.intentLevel.toLowerCase()}.`,
    metadata: {
      intentLevel: resolvedProfile.intentLevel,
      recommendationEligible: resolvedProfile.recommendationEligible,
      reason: resolvedProfile.reason,
    },
  };
}

async function refreshSavedBuildPaths(event: AppEvent<"savedBuild.created">) {
  const paths = [
    "/",
    "/account",
    "/account/builds",
    event.payload.buildHref,
    event.payload.configureHref,
  ];

  const revalidatedPaths = revalidateCachePaths(paths);
  const revalidatedTags = revalidateCacheTags([
    cacheTags.account,
    cacheTags.adminInsights,
    cacheTags.recommendations,
  ]);

  return {
    message: `Revalidated ${revalidatedPaths.length} saved-build paths and ${revalidatedTags.length} cache tags.`,
    metadata: {
      paths: revalidatedPaths,
      tags: revalidatedTags,
    },
  };
}

export const savedBuildCreatedHandlers: EventHandler<"savedBuild.created">[] = [
  {
    id: "sync-user-intent-profile",
    handle: syncUserIntentFromSavedBuild,
  },
  {
    id: "refresh-saved-build-surfaces",
    handle: refreshSavedBuildPaths,
  },
];
