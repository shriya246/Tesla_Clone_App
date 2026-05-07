import type { UserRole } from "@prisma/client";

export type FeatureFlagEnvironment = "development" | "test" | "production";
export type FeatureFlagDefaultMode = "stable" | "preview";
export type FeatureFlagValue = boolean | string;

export interface FeatureFlagActor {
  id?: string | null;
  email?: string | null;
  role?: UserRole | null;
}

export interface FeatureFlagEvaluationContext {
  environment: FeatureFlagEnvironment;
  defaultMode: FeatureFlagDefaultMode;
  actor?: FeatureFlagActor | null;
  betaEmails: Set<string>;
  betaUserIds: Set<string>;
  path?: string;
}

interface FeatureFlagRuleBase {
  name: string;
  environments?: readonly FeatureFlagEnvironment[];
  modes?: readonly FeatureFlagDefaultMode[];
  signedIn?: boolean;
  roles?: readonly UserRole[];
  emails?: readonly string[];
  userIds?: readonly string[];
  useBetaAllowlist?: boolean;
  percentage?: number;
}

export interface BooleanFeatureFlagRule extends FeatureFlagRuleBase {
  value: boolean;
}

export interface VariantFeatureFlagRule<TValue extends string>
  extends FeatureFlagRuleBase {
  value: TValue;
}

export interface BooleanFeatureFlagDefinition {
  kind: "boolean";
  description: string;
  defaultValue: boolean;
  rules?: readonly BooleanFeatureFlagRule[];
}

export interface VariantFeatureFlagDefinition<TValue extends string = string> {
  kind: "variant";
  description: string;
  defaultValue: TValue;
  options: readonly TValue[];
  rules?: readonly VariantFeatureFlagRule<TValue>[];
}

export type FeatureFlagDefinition =
  | BooleanFeatureFlagDefinition
  | VariantFeatureFlagDefinition;

export interface FeatureFlagResolution<TValue extends FeatureFlagValue> {
  key: string;
  kind: "boolean" | "variant";
  description: string;
  value: TValue;
  enabled: boolean;
  matchedRule?: string;
  reason: string;
  options?: readonly TValue[];
}

export function defineBooleanFlag(
  definition: Omit<BooleanFeatureFlagDefinition, "kind">,
): BooleanFeatureFlagDefinition {
  return {
    kind: "boolean",
    ...definition,
  };
}

export function defineVariantFlag<const TOptions extends readonly string[]>(
  definition: Omit<VariantFeatureFlagDefinition<TOptions[number]>, "kind"> & {
    options: TOptions;
  },
): VariantFeatureFlagDefinition<TOptions[number]> {
  return {
    kind: "variant",
    ...definition,
  };
}
