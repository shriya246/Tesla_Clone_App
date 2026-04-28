import { afterEach, describe, expect, it, vi } from "vitest";

async function loadEnvModule() {
  vi.resetModules();

  return import("@/lib/env");
}

describe("env validation", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports missing deployment requirements clearly", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("AUTH_SECRET", "");
    vi.stubEnv("AUTH_GOOGLE_ID", "");
    vi.stubEnv("AUTH_GOOGLE_SECRET", "");
    vi.stubEnv("ADMIN_EMAILS", "");
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "");
    vi.stubEnv("CLOUDINARY_API_KEY", "");
    vi.stubEnv("CLOUDINARY_API_SECRET", "");
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("EMAIL_FROM", "");
    vi.stubEnv("ADMIN_NOTIFICATION_EMAIL", "");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");

    const { formatEnvValidationReport, getEnvValidationReport } =
      await loadEnvModule();
    const report = getEnvValidationReport();

    expect(report.ok).toBe(false);
    expect(formatEnvValidationReport(report)).toContain("[database]");
    expect(formatEnvValidationReport(report)).toContain("[monitoring]");
  });

  it("passes when all deployment requirements are configured", async () => {
    vi.stubEnv(
      "DATABASE_URL",
      "postgresql://postgres:postgres@localhost:5432/tesla_clone_app?schema=public",
    );
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://tesla-inspired.example.com");
    vi.stubEnv(
      "AUTH_SECRET",
      "12345678901234567890123456789012",
    );
    vi.stubEnv("AUTH_GOOGLE_ID", "google-client-id");
    vi.stubEnv("AUTH_GOOGLE_SECRET", "google-client-secret");
    vi.stubEnv("ADMIN_EMAILS", "admin@example.com");
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "cloud-name");
    vi.stubEnv("CLOUDINARY_API_KEY", "api-key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "api-secret");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("EMAIL_FROM", "Tesla Inspired <notifications@example.com>");
    vi.stubEnv("ADMIN_NOTIFICATION_EMAIL", "ops@example.com");
    vi.stubEnv(
      "NEXT_PUBLIC_SENTRY_DSN",
      "https://examplePublicKey@o0.ingest.sentry.io/0",
    );

    const { getEnvValidationReport } = await loadEnvModule();
    const report = getEnvValidationReport();

    expect(report.ok).toBe(true);
    expect(report.issues).toHaveLength(0);
  });
});
