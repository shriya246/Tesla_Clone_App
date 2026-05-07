import type {
  InquiryPriorityValue,
  InquiryStatusValue,
  InquiryTypeValue,
  UserIntentLevelValue,
} from "@/types";

interface ResolveInquiryWorkflowInput {
  type: InquiryTypeValue;
  hasSignedInUser: boolean;
  itemType?: string;
  productSlug?: string;
  phone?: string | null;
  message: string;
  userIntentLevel?: UserIntentLevelValue | null;
  recommendationEligible?: boolean;
  savedBuildCount?: number;
  favoriteCount?: number;
}

export interface ResolvedInquiryWorkflowState {
  status: InquiryStatusValue;
  priority: InquiryPriorityValue;
  operationalTags: string[];
  reason: string;
}

const decisionLanguagePattern =
  /\b(demo|test drive|availability|quote|pricing|finance|financing|trade[- ]?in|install|delivery|schedule)\b/i;

export function resolveInquiryWorkflowState(
  input: ResolveInquiryWorkflowInput,
): ResolvedInquiryWorkflowState {
  const tags = new Set<string>();
  const reasons: string[] = [];
  let score = 0;

  switch (input.type) {
    case "VEHICLE_DEMO_REQUEST":
      score += 5;
      tags.add("demo_request");
      reasons.push("vehicle demo request");
      break;
    case "ENERGY_CONSULTATION":
      score += 3;
      tags.add("consultation_request");
      reasons.push("energy consultation");
      break;
    case "PRODUCT_INQUIRY":
      score += 2;
      tags.add("product_question");
      reasons.push("product-specific inquiry type");
      break;
    default:
      tags.add("general_request");
      break;
  }

  if (input.itemType && input.productSlug) {
    score += 2;
    tags.add("product_specific");
    reasons.push("product-linked context");
  }

  if (input.hasSignedInUser) {
    score += 1;
    tags.add("signed_in_customer");
    reasons.push("signed-in customer context");
  }

  if (input.recommendationEligible) {
    score += 1;
    tags.add("recommendation_eligible");
  }

  if (input.savedBuildCount && input.savedBuildCount >= 2) {
    score += 2;
    tags.add("repeat_builder");
    reasons.push("multiple saved builds");
  }

  if (input.favoriteCount && input.favoriteCount >= 2) {
    score += 1;
    tags.add("shortlist_builder");
  }

  if (input.userIntentLevel === "HIGH_INTENT") {
    score += 3;
    tags.add("high_intent_customer");
    reasons.push("existing high-intent customer profile");
  } else if (input.userIntentLevel === "ENGAGED") {
    score += 1;
    tags.add("engaged_customer");
  }

  if (input.phone?.trim()) {
    score += 1;
    tags.add("direct_contact");
  }

  if (decisionLanguagePattern.test(input.message)) {
    score += 1;
    tags.add("decision_ready_language");
    reasons.push("next-step language in the message");
  }

  let priority: InquiryPriorityValue = "NORMAL";

  if (input.type === "GENERAL" && !input.productSlug && score <= 1) {
    priority = "LOW";
    tags.add("general_queue");
    reasons.push("low-context general request");
  } else if (score >= 8) {
    priority = "URGENT";
    tags.add("escalated_attention");
  } else if (score >= 4) {
    priority = "HIGH";
  }

  const status: InquiryStatusValue =
    priority === "HIGH" || priority === "URGENT" ? "PRIORITIZED" : "NEW";

  if (status === "PRIORITIZED") {
    tags.add("workflow_priority");
  }

  return {
    status,
    priority,
    operationalTags: [...tags].sort(),
    reason:
      reasons.length > 0
        ? `Assigned ${status.toLowerCase()} / ${priority.toLowerCase()} based on ${reasons.join(", ")}.`
        : `Assigned ${status.toLowerCase()} / ${priority.toLowerCase()} from the default workflow rules.`,
  };
}
