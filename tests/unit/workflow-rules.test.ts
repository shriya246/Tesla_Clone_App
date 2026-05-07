import { describe, expect, it } from "vitest";

import { resolveInquiryWorkflowState } from "@/lib/events/rules/inquiries";
import { resolveUserIntentProfile } from "@/lib/events/rules/user-intent";

describe("workflow rules", () => {
  it("marks multiple saved builds as engaged and recommendation eligible", () => {
    const profile = resolveUserIntentProfile({
      savedBuildCount: 2,
      favoriteCount: 0,
      inquiryCount: 0,
    });

    expect(profile.intentLevel).toBe("ENGAGED");
    expect(profile.recommendationEligible).toBe(true);
    expect(profile.reason).toContain("multiple saved builds");
  });

  it("preserves a higher existing intent level instead of downgrading", () => {
    const profile = resolveUserIntentProfile({
      savedBuildCount: 1,
      favoriteCount: 0,
      inquiryCount: 0,
      currentIntentLevel: "HIGH_INTENT",
      currentRecommendationEligible: true,
    });

    expect(profile.intentLevel).toBe("HIGH_INTENT");
    expect(profile.recommendationEligible).toBe(true);
  });

  it("prioritizes demo requests with repeat-builder signals", () => {
    const triage = resolveInquiryWorkflowState({
      type: "VEHICLE_DEMO_REQUEST",
      hasSignedInUser: true,
      itemType: "VEHICLE",
      productSlug: "model-y",
      phone: "555-0100",
      message: "I want to schedule a demo and discuss pricing this week.",
      userIntentLevel: "ENGAGED",
      recommendationEligible: true,
      savedBuildCount: 2,
      favoriteCount: 1,
    });

    expect(triage.status).toBe("PRIORITIZED");
    expect(triage.priority).toBe("URGENT");
    expect(triage.operationalTags).toContain("repeat_builder");
    expect(triage.operationalTags).toContain("workflow_priority");
  });

  it("keeps low-context general inquiries in the lower-priority queue", () => {
    const triage = resolveInquiryWorkflowState({
      type: "GENERAL",
      hasSignedInUser: false,
      message: "Hello there",
    });

    expect(triage.status).toBe("NEW");
    expect(triage.priority).toBe("LOW");
    expect(triage.operationalTags).toContain("general_queue");
  });
});
