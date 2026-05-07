import { featureFlagConfig, type FeatureFlagKey, type FeatureFlagValueMap } from "@/lib/flags/config";
import type {
  FeatureFlagDefinition,
  FeatureFlagEvaluationContext,
  FeatureFlagResolution,
  FeatureFlagValue,
} from "@/lib/flags/types";

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase();
}

function createBucket(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) % 100;
}

function matchesPercentageRollout(
  key: string,
  percentage: number,
  context: FeatureFlagEvaluationContext,
) {
  const normalizedPercentage = Math.max(0, Math.min(percentage, 100));
  const identifier = context.actor?.id ?? normalizeEmail(context.actor?.email);

  if (!identifier) {
    return false;
  }

  return createBucket(`${key}:${identifier}`) < normalizedPercentage;
}

function matchesRule(
  key: string,
  rule: NonNullable<(typeof featureFlagConfig)[FeatureFlagKey]["rules"]>[number],
  context: FeatureFlagEvaluationContext,
) {
  const normalizedEmail = normalizeEmail(context.actor?.email);
  const isSignedIn = Boolean(context.actor?.id);

  if (
    rule.environments &&
    !rule.environments.includes(context.environment)
  ) {
    return false;
  }

  if (rule.modes && !rule.modes.includes(context.defaultMode)) {
    return false;
  }

  if (typeof rule.signedIn === "boolean" && rule.signedIn !== isSignedIn) {
    return false;
  }

  if (rule.roles?.length) {
    if (!context.actor?.role || !rule.roles.includes(context.actor.role)) {
      return false;
    }
  }

  if (rule.emails?.length) {
    const normalizedRuleEmails = rule.emails.map((email) => email.toLowerCase());

    if (!normalizedEmail || !normalizedRuleEmails.includes(normalizedEmail)) {
      return false;
    }
  }

  if (rule.userIds?.length) {
    if (!context.actor?.id || !rule.userIds.includes(context.actor.id)) {
      return false;
    }
  }

  if (rule.useBetaAllowlist) {
    const isBetaEmail = normalizedEmail
      ? context.betaEmails.has(normalizedEmail)
      : false;
    const isBetaUserId = context.actor?.id
      ? context.betaUserIds.has(context.actor.id)
      : false;

    if (!isBetaEmail && !isBetaUserId) {
      return false;
    }
  }

  if (
    typeof rule.percentage === "number" &&
    !matchesPercentageRollout(key, rule.percentage, context)
  ) {
    return false;
  }

  return true;
}

function toResolution<TValue extends FeatureFlagValue>(input: {
  key: string;
  definition: FeatureFlagDefinition;
  value: TValue;
  matchedRule?: string;
  reason: string;
}): FeatureFlagResolution<TValue> {
  const { definition, key, matchedRule, reason, value } = input;

  return {
    key,
    kind: definition.kind,
    description: definition.description,
    value,
    enabled:
      definition.kind === "boolean" ? value === true : value !== definition.defaultValue,
    matchedRule,
    reason,
    options:
      definition.kind === "variant"
        ? (definition.options as readonly TValue[])
        : undefined,
  };
}

export function evaluateFlag<K extends FeatureFlagKey>(
  key: K,
  context: FeatureFlagEvaluationContext,
): FeatureFlagResolution<FeatureFlagValueMap[K]> {
  const definition = featureFlagConfig[key];

  for (const rule of definition.rules ?? []) {
    if (matchesRule(key, rule, context)) {
      return toResolution({
        key,
        definition,
        value: rule.value as FeatureFlagValueMap[K],
        matchedRule: rule.name,
        reason: `Matched rule "${rule.name}".`,
      });
    }
  }

  return toResolution({
    key,
    definition,
    value: definition.defaultValue as FeatureFlagValueMap[K],
    reason: "Using the default flag value.",
  });
}
