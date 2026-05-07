import { UserRole } from "@prisma/client";

import { defineBooleanFlag, defineVariantFlag } from "@/lib/flags/types";

const developmentEnvironments = ["development", "test"] as const;

export const featureFlagConfig = {
  homepagePersonalization: defineVariantFlag({
    description:
      "Controls the personalized homepage recommendation modules for selected signed-in users.",
    options: ["control", "enhanced"] as const,
    defaultValue: "control",
    rules: [
      {
        name: "development-signed-in-preview",
        value: "enhanced",
        environments: developmentEnvironments,
        signedIn: true,
      },
      {
        name: "admin-preview",
        value: "enhanced",
        roles: [UserRole.ADMIN],
      },
      {
        name: "beta-allowlist-preview",
        value: "enhanced",
        signedIn: true,
        useBetaAllowlist: true,
      },
      {
        name: "preview-rollout-signed-in",
        value: "enhanced",
        modes: ["preview"],
        signedIn: true,
        percentage: 35,
      },
    ],
  }),
  searchDiscoveryExperience: defineVariantFlag({
    description:
      "Controls enhanced search suggestions and discovery summary modules on the catalog search page.",
    options: ["control", "enhanced"] as const,
    defaultValue: "control",
    rules: [
      {
        name: "development-open-rollout",
        value: "enhanced",
        environments: developmentEnvironments,
      },
      {
        name: "admin-preview",
        value: "enhanced",
        roles: [UserRole.ADMIN],
      },
      {
        name: "beta-allowlist-preview",
        value: "enhanced",
        signedIn: true,
        useBetaAllowlist: true,
      },
      {
        name: "preview-rollout-signed-in",
        value: "enhanced",
        modes: ["preview"],
        signedIn: true,
        percentage: 50,
      },
    ],
  }),
  accountPremiumModules: defineBooleanFlag({
    description:
      "Controls premium recommendation and engagement modules across the signed-in account dashboard.",
    defaultValue: false,
    rules: [
      {
        name: "development-signed-in-preview",
        value: true,
        environments: developmentEnvironments,
        signedIn: true,
      },
      {
        name: "admin-preview",
        value: true,
        roles: [UserRole.ADMIN],
      },
      {
        name: "beta-allowlist-preview",
        value: true,
        signedIn: true,
        useBetaAllowlist: true,
      },
      {
        name: "preview-rollout-signed-in",
        value: true,
        modes: ["preview"],
        signedIn: true,
        percentage: 50,
      },
    ],
  }),
  savedBuildRecommendations: defineBooleanFlag({
    description:
      "Controls recommendation modules that extend the saved-build experience with adjacent vehicle suggestions.",
    defaultValue: false,
    rules: [
      {
        name: "development-signed-in-preview",
        value: true,
        environments: developmentEnvironments,
        signedIn: true,
      },
      {
        name: "admin-preview",
        value: true,
        roles: [UserRole.ADMIN],
      },
      {
        name: "beta-allowlist-preview",
        value: true,
        signedIn: true,
        useBetaAllowlist: true,
      },
      {
        name: "preview-rollout-signed-in",
        value: true,
        modes: ["preview"],
        signedIn: true,
        percentage: 40,
      },
    ],
  }),
  advancedAdminInsights: defineBooleanFlag({
    description:
      "Controls advanced search-trend and daily-volume modules inside the admin insights dashboard.",
    defaultValue: false,
    rules: [
      {
        name: "development-admin-preview",
        value: true,
        environments: developmentEnvironments,
      },
      {
        name: "preview-mode-admins",
        value: true,
        modes: ["preview"],
        roles: [UserRole.ADMIN],
      },
      {
        name: "beta-admin-allowlist",
        value: true,
        roles: [UserRole.ADMIN],
        useBetaAllowlist: true,
      },
    ],
  }),
} as const;

export type FeatureFlagConfig = typeof featureFlagConfig;
export type FeatureFlagKey = keyof FeatureFlagConfig;
export type FeatureFlagValueMap = {
  [K in FeatureFlagKey]: FeatureFlagConfig[K]["defaultValue"];
};
