import { describe, expect, it } from "vitest";

import {
  buildMediaBackgroundStyle,
  isMediaUrl,
  isRemoteMediaUrl,
  normalizeMediaUrl,
} from "@/lib/media";

describe("media helpers", () => {
  it("normalizes trimmed values and falls back when needed", () => {
    expect(normalizeMediaUrl("  https://cdn.example.com/hero.jpg  ")).toBe(
      "https://cdn.example.com/hero.jpg",
    );
    expect(normalizeMediaUrl("   ", "/fallback.jpg")).toBe("/fallback.jpg");
  });

  it("detects supported media url shapes", () => {
    expect(isRemoteMediaUrl("https://cdn.example.com/image.webp")).toBe(true);
    expect(isRemoteMediaUrl("/images/local.jpg")).toBe(false);
    expect(isMediaUrl("/images/local.jpg")).toBe(true);
    expect(isMediaUrl("not-a-url")).toBe(false);
  });

  it("builds a safe background style payload", () => {
    const style = buildMediaBackgroundStyle({
      image: 'https://cdn.example.com/hero"image.jpg',
      overlay: "linear-gradient(#000000,#111111)",
      backgroundColor: "#010203",
    });

    expect(style.backgroundColor).toBe("#010203");
    expect(style.backgroundPosition).toBe("center");
    expect(style.backgroundRepeat).toBe("no-repeat");
    expect(style.backgroundSize).toBe("cover");
    expect(style.backgroundImage).toContain(
      'url("https://cdn.example.com/hero\\"image.jpg")',
    );
  });
});
