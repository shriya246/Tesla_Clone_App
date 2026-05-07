import type { UserIntentLevelValue } from "@/types";

interface ResolveUserIntentProfileInput {
  savedBuildCount: number;
  favoriteCount: number;
  inquiryCount: number;
  currentIntentLevel?: UserIntentLevelValue | null;
  currentRecommendationEligible?: boolean;
}

export interface ResolvedUserIntentProfile {
  intentLevel: UserIntentLevelValue;
  recommendationEligible: boolean;
  reason: string;
}

const intentLevelRank: Record<UserIntentLevelValue, number> = {
  STANDARD: 0,
  ENGAGED: 1,
  HIGH_INTENT: 2,
};

function maxIntentLevel(
  left: UserIntentLevelValue,
  right: UserIntentLevelValue,
): UserIntentLevelValue {
  return intentLevelRank[left] >= intentLevelRank[right] ? left : right;
}

export function resolveUserIntentProfile(
  input: ResolveUserIntentProfileInput,
): ResolvedUserIntentProfile {
  const recommendationEligible =
    input.currentRecommendationEligible ||
    input.savedBuildCount > 0 ||
    input.favoriteCount > 0 ||
    input.inquiryCount > 0;

  let nextIntentLevel: UserIntentLevelValue = "STANDARD";
  const reasons: string[] = [];

  if (input.savedBuildCount >= 3) {
    nextIntentLevel = "HIGH_INTENT";
    reasons.push("three or more saved builds");
  } else if (input.savedBuildCount >= 2) {
    nextIntentLevel = "ENGAGED";
    reasons.push("multiple saved builds");
  }

  if (input.favoriteCount >= 2) {
    nextIntentLevel = maxIntentLevel(nextIntentLevel, "ENGAGED");
    reasons.push("repeat favorites");
  }

  if (input.inquiryCount >= 1) {
    nextIntentLevel = maxIntentLevel(nextIntentLevel, "HIGH_INTENT");
    reasons.push("an inquiry or demo request");
  }

  if (input.currentIntentLevel) {
    nextIntentLevel = maxIntentLevel(nextIntentLevel, input.currentIntentLevel);
  }

  return {
    intentLevel: nextIntentLevel,
    recommendationEligible,
    reason:
      reasons.length > 0
        ? `Derived from ${reasons.join(", ")}.`
        : recommendationEligible
          ? "Recommendation eligibility was preserved from prior customer intent."
          : "No high-intent workflow signals have accumulated yet.",
  };
}
