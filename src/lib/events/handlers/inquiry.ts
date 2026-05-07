import type { InquiryPriority, InquiryStatus, UserIntentLevel } from "@prisma/client";

import { cacheTags, revalidateCachePaths, revalidateCacheTags } from "@/lib/cache";
import {
  countFavoritesByUser,
  countInquiriesByUser,
  countSavedBuildsByUser,
  getUserWorkflowProfileById,
  updateInquiryWorkflowState,
  updateUserWorkflowProfile,
} from "@/lib/db";
import { resolveInquiryWorkflowState } from "@/lib/events/rules/inquiries";
import { resolveUserIntentProfile } from "@/lib/events/rules/user-intent";
import type { AppEvent, EventHandler } from "@/lib/events/types";

async function syncUserIntentFromInquiry(
  event: AppEvent<"inquiry.created">,
) {
  if (!event.payload.userId) {
    return {
      message: "Inquiry was submitted without a signed-in user, so no user workflow profile was updated.",
    };
  }

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
      message: `User intent profile already matched ${resolvedProfile.intentLevel.toLowerCase()}.`,
      metadata: {
        intentLevel: resolvedProfile.intentLevel,
        recommendationEligible: resolvedProfile.recommendationEligible,
      },
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
    message: `Updated the user workflow profile to ${resolvedProfile.intentLevel.toLowerCase()}.`,
    metadata: {
      intentLevel: resolvedProfile.intentLevel,
      recommendationEligible: resolvedProfile.recommendationEligible,
      reason: resolvedProfile.reason,
    },
  };
}

async function triageInquiry(event: AppEvent<"inquiry.created">) {
  const userId = event.payload.userId;
  const [currentProfile, savedBuildCount, favoriteCount] = userId
    ? await Promise.all([
        getUserWorkflowProfileById(userId),
        countSavedBuildsByUser(userId),
        countFavoritesByUser(userId),
      ])
    : [null, 0, 0];
  const triage = resolveInquiryWorkflowState({
    type: event.payload.type,
    hasSignedInUser: Boolean(userId),
    itemType: event.payload.itemType,
    productSlug: event.payload.productSlug,
    phone: event.payload.phone,
    message: event.payload.message,
    userIntentLevel: currentProfile?.intentLevel,
    recommendationEligible: currentProfile?.recommendationEligible,
    savedBuildCount,
    favoriteCount,
  });

  await updateInquiryWorkflowState({
    inquiryId: event.payload.inquiryId,
    status: triage.status as InquiryStatus,
    priority: triage.priority as InquiryPriority,
    operationalTags: triage.operationalTags,
    lastAutomatedAt: new Date(),
  });

  return {
    message: triage.reason,
    metadata: {
      status: triage.status,
      priority: triage.priority,
      operationalTags: triage.operationalTags,
    },
  };
}

async function refreshInquirySurfaces(event: AppEvent<"inquiry.created">) {
  const paths = ["/admin", "/admin/inquiries", "/admin/insights"];

  if (event.payload.userId) {
    paths.push("/account");
  }

  const revalidatedPaths = revalidateCachePaths(paths);
  const revalidatedTags = revalidateCacheTags([
    cacheTags.account,
    cacheTags.adminInsights,
    cacheTags.recommendations,
  ]);

  return {
    message: `Revalidated ${revalidatedPaths.length} inquiry paths and ${revalidatedTags.length} cache tags.`,
    metadata: {
      paths: revalidatedPaths,
      tags: revalidatedTags,
    },
  };
}

export const inquiryCreatedHandlers: EventHandler<"inquiry.created">[] = [
  {
    id: "sync-user-intent-profile",
    handle: syncUserIntentFromInquiry,
  },
  {
    id: "triage-inquiry",
    handle: triageInquiry,
  },
  {
    id: "refresh-inquiry-surfaces",
    handle: refreshInquirySurfaces,
  },
];
