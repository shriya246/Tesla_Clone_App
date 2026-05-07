import "server-only";

export { featureFlagConfig } from "@/lib/flags/config";
export type {
  FeatureFlagConfig,
  FeatureFlagKey,
  FeatureFlagValueMap,
} from "@/lib/flags/config";
export { evaluateFlag } from "@/lib/flags/evaluateFlag";
export {
  buildFeatureFlagContext,
  getFeatureFlag,
  getFeatureFlagActorFromSession,
  getFeatureFlags,
} from "@/lib/flags/getFeatureFlags";
export type { FeatureFlags, GetFeatureFlagsInput } from "@/lib/flags/getFeatureFlags";
export type {
  FeatureFlagActor,
  FeatureFlagDefaultMode,
  FeatureFlagDefinition,
  FeatureFlagEnvironment,
  FeatureFlagEvaluationContext,
  FeatureFlagResolution,
  FeatureFlagValue,
} from "@/lib/flags/types";
