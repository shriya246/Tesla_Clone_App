import { beforeEach, describe, expect, it } from "vitest";

import {
  buildRateLimitHeaders,
  clearRateLimitStore,
  consumeRateLimit,
} from "@/lib/security/rate-limit";

describe("rate limit helper", () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it("allows requests until the limit is exceeded", () => {
    const first = consumeRateLimit("inquiries:test", {
      limit: 2,
      windowMs: 60_000,
    });
    const second = consumeRateLimit("inquiries:test", {
      limit: 2,
      windowMs: 60_000,
    });
    const third = consumeRateLimit("inquiries:test", {
      limit: 2,
      windowMs: 60_000,
    });

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(third.success).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("builds retry-friendly response headers", () => {
    const result = consumeRateLimit("inquiries:test", {
      limit: 1,
      windowMs: 30_000,
    });
    const headers = buildRateLimitHeaders(result);

    expect(headers["X-RateLimit-Limit"]).toBe("1");
    expect(headers["X-RateLimit-Remaining"]).toBe("0");
    expect(Number(headers["Retry-After"])).toBeGreaterThan(0);
  });
});
