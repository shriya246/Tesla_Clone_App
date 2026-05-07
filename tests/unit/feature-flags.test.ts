import { afterEach, describe, expect, it, vi } from "vitest";

async function loadFlagsModule() {
  vi.resetModules();

  return import("@/lib/flags");
}

describe("feature flags", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps production users on stable defaults when no rules match", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("FEATURE_FLAGS_DEFAULT_MODE", "stable");
    vi.stubEnv("FEATURE_FLAG_BETA_EMAILS", "");
    vi.stubEnv("FEATURE_FLAG_BETA_USER_IDS", "");

    const { getFeatureFlags } = await loadFlagsModule();
    const flags = getFeatureFlags({
      actor: {
        id: "customer-1",
        email: "customer@example.com",
        role: "CUSTOMER",
      },
      path: "/account",
    });

    expect(flags.homepagePersonalization.value).toBe("control");
    expect(flags.accountPremiumModules.enabled).toBe(false);
    expect(flags.savedBuildRecommendations.enabled).toBe(false);
  });

  it("opens enhanced search discovery for all users in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("FEATURE_FLAGS_DEFAULT_MODE", "stable");

    const { getFeatureFlags } = await loadFlagsModule();
    const flags = getFeatureFlags({
      actor: null,
      path: "/search",
    });

    expect(flags.searchDiscoveryExperience.value).toBe("enhanced");
    expect(flags.searchDiscoveryExperience.enabled).toBe(true);
    expect(flags.searchDiscoveryExperience.matchedRule).toBe(
      "development-open-rollout",
    );
  });

  it("enables beta-allowlisted signed-in users in stable production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("FEATURE_FLAGS_DEFAULT_MODE", "stable");
    vi.stubEnv("FEATURE_FLAG_BETA_EMAILS", "beta@example.com");
    vi.stubEnv("FEATURE_FLAG_BETA_USER_IDS", "");

    const { getFeatureFlags } = await loadFlagsModule();
    const flags = getFeatureFlags({
      actor: {
        id: "customer-2",
        email: "beta@example.com",
        role: "CUSTOMER",
      },
      path: "/account",
    });

    expect(flags.homepagePersonalization.value).toBe("enhanced");
    expect(flags.accountPremiumModules.enabled).toBe(true);
    expect(flags.savedBuildRecommendations.enabled).toBe(true);
  });

  it("supports deterministic preview rollouts for signed-in users only", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("FEATURE_FLAGS_DEFAULT_MODE", "preview");
    vi.stubEnv("FEATURE_FLAG_BETA_EMAILS", "");
    vi.stubEnv("FEATURE_FLAG_BETA_USER_IDS", "");

    const { getFeatureFlags } = await loadFlagsModule();

    let matchedId: string | null = null;

    for (let index = 0; index < 500; index += 1) {
      const candidateId = `preview-user-${index}`;
      const flags = getFeatureFlags({
        actor: {
          id: candidateId,
          email: `${candidateId}@example.com`,
          role: "CUSTOMER",
        },
        path: "/search",
      });

      if (flags.searchDiscoveryExperience.value === "enhanced") {
        matchedId = candidateId;
        break;
      }
    }

    expect(matchedId).not.toBeNull();

    const anonymousFlags = getFeatureFlags({
      actor: null,
      path: "/search",
    });

    expect(anonymousFlags.searchDiscoveryExperience.value).toBe("control");
  });

  it("keeps advanced admin insights limited until preview mode or beta access applies", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("FEATURE_FLAGS_DEFAULT_MODE", "stable");
    vi.stubEnv("FEATURE_FLAG_BETA_EMAILS", "");
    vi.stubEnv("FEATURE_FLAG_BETA_USER_IDS", "");

    const { getFeatureFlags } = await loadFlagsModule();
    const stableAdminFlags = getFeatureFlags({
      actor: {
        id: "admin-1",
        email: "admin@example.com",
        role: "ADMIN",
      },
      path: "/admin/insights",
    });

    expect(stableAdminFlags.advancedAdminInsights.enabled).toBe(false);

    vi.stubEnv("FEATURE_FLAGS_DEFAULT_MODE", "preview");

    const { getFeatureFlags: getPreviewFlags } = await loadFlagsModule();
    const previewAdminFlags = getPreviewFlags({
      actor: {
        id: "admin-1",
        email: "admin@example.com",
        role: "ADMIN",
      },
      path: "/admin/insights",
    });

    expect(previewAdminFlags.advancedAdminInsights.enabled).toBe(true);
    expect(previewAdminFlags.advancedAdminInsights.matchedRule).toBe(
      "preview-mode-admins",
    );
  });
});
