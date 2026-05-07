import type { UserIntentLevel } from "@prisma/client";

import {
  countFavoritesByUser,
  countInquiriesByUser,
  countSavedBuildsByUser,
  getUserWorkflowProfileById,
  updateUserWorkflowProfile,
} from "@/lib/db";
import { resolveUserIntentProfile } from "@/lib/events/rules/user-intent";
import type { AppEvent, EventHandler } from "@/lib/events/types";

async function syncUserIntentFromFavorite(event: AppEvent<"favorite.added">) {
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
      message: "Favorite activity did not require any workflow profile changes.",
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
    message: `Favorite activity updated the user workflow profile to ${resolvedProfile.intentLevel.toLowerCase()}.`,
    metadata: {
      intentLevel: resolvedProfile.intentLevel,
      recommendationEligible: resolvedProfile.recommendationEligible,
      reason: resolvedProfile.reason,
    },
  };
}

export const favoriteAddedHandlers: EventHandler<"favorite.added">[] = [
  {
    id: "sync-user-intent-profile",
    handle: syncUserIntentFromFavorite,
  },
];
