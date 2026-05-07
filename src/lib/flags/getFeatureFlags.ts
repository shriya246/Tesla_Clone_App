import "server-only";

import type { Session } from "next-auth";

import {
  env,
  getFeatureFlagBetaEmailList,
  getFeatureFlagBetaUserIdList,
} from "@/lib/env";
import { featureFlagConfig, type FeatureFlagKey, type FeatureFlagValueMap } from "@/lib/flags/config";
import { evaluateFlag } from "@/lib/flags/evaluateFlag";
import type {
  FeatureFlagActor,
  FeatureFlagEnvironment,
  FeatureFlagEvaluationContext,
  FeatureFlagResolution,
} from "@/lib/flags/types";

export interface GetFeatureFlagsInput {
  actor?: FeatureFlagActor | null;
  environment?: FeatureFlagEnvironment;
  path?: string;
}

export type FeatureFlags = {
  [K in FeatureFlagKey]: FeatureFlagResolution<FeatureFlagValueMap[K]>;
};

export function getFeatureFlagActorFromSession(
  session?: Session | null,
): FeatureFlagActor | null {
  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role ?? null,
  };
}

export function buildFeatureFlagContext(
  input: GetFeatureFlagsInput = {},
): FeatureFlagEvaluationContext {
  return {
    environment: input.environment ?? env.NODE_ENV,
    defaultMode: env.FEATURE_FLAGS_DEFAULT_MODE,
    actor: input.actor ?? null,
    betaEmails: new Set(getFeatureFlagBetaEmailList()),
    betaUserIds: new Set(getFeatureFlagBetaUserIdList()),
    path: input.path,
  };
}

export function getFeatureFlags(input: GetFeatureFlagsInput = {}): FeatureFlags {
  const context = buildFeatureFlagContext(input);
  const entries = Object.keys(featureFlagConfig).map((key) => [
    key,
    evaluateFlag(key as FeatureFlagKey, context),
  ]);

  return Object.fromEntries(entries) as FeatureFlags;
}

export function getFeatureFlag<K extends FeatureFlagKey>(
  key: K,
  input: GetFeatureFlagsInput = {},
) {
  return getFeatureFlags(input)[key];
}
