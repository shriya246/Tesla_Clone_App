import { afterEach, describe, expect, it, vi } from "vitest";

async function loadMetadataModule() {
  vi.resetModules();

  return import("@/lib/metadata");
}

describe("metadata helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("falls back to the local site url when no app url is configured", async () => {
    const { createAbsoluteUrl, DEFAULT_SITE_URL, getSiteUrl } =
      await loadMetadataModule();

    expect(getSiteUrl()).toBe(DEFAULT_SITE_URL);
    expect(createAbsoluteUrl("/vehicles")).toBe(
      `${DEFAULT_SITE_URL}/vehicles`,
    );
  });

  it("prefers NEXT_PUBLIC_APP_URL for canonical url building", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://tesla-inspired.example.com/");

    const { createAbsoluteUrl, getSiteUrl } = await loadMetadataModule();

    expect(getSiteUrl()).toBe("https://tesla-inspired.example.com");
    expect(createAbsoluteUrl("/shop")).toBe(
      "https://tesla-inspired.example.com/shop",
    );
  });

  it("builds page metadata with canonical, robots, and social fields", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://tesla-inspired.example.com");

    const { buildPageMetadata } = await loadMetadataModule();
    const metadata = buildPageMetadata({
      title: "Vehicles | Tesla Inspired",
      description: "Lineup details for the public vehicles catalog.",
      path: "/vehicles",
      noIndex: true,
    });

    expect(metadata.alternates?.canonical).toBe("/vehicles");
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.openGraph?.title).toBe("Vehicles | Tesla Inspired");
    expect(
      Boolean(
        metadata.twitter &&
          "card" in metadata.twitter &&
          metadata.twitter.card === "summary_large_image",
      ),
    ).toBe(true);
  });
});
