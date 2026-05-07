import { describe, expect, it } from "vitest";

import {
  calculateRetryDelayMs,
  getNextRetryAt,
} from "@/lib/jobs/backoff";

describe("background job retry helpers", () => {
  it("uses capped exponential backoff for retryable work", () => {
    expect(calculateRetryDelayMs(1)).toBe(60_000);
    expect(calculateRetryDelayMs(2)).toBe(120_000);
    expect(calculateRetryDelayMs(10)).toBe(60 * 60_000);
  });

  it("calculates the next retry timestamp from a known clock", () => {
    const now = new Date("2026-05-07T12:00:00.000Z");

    expect(getNextRetryAt(3, now).toISOString()).toBe(
      "2026-05-07T12:04:00.000Z",
    );
  });
});
