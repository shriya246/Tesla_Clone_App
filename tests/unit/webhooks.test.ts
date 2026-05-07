import { describe, expect, it } from "vitest";

import {
  createWebhookSignature,
  verifyWebhookSignature,
} from "@/lib/webhooks/signature";

describe("webhook signing", () => {
  it("creates deterministic signatures for the same body and timestamp", () => {
    const signatureA = createWebhookSignature({
      secret: "super-secret",
      timestamp: "1715010000000",
      body: '{"type":"inquiry.created"}',
    });
    const signatureB = createWebhookSignature({
      secret: "super-secret",
      timestamp: "1715010000000",
      body: '{"type":"inquiry.created"}',
    });

    expect(signatureA).toBe(signatureB);
  });

  it("verifies a matching signature and rejects a tampered body", () => {
    const signature = createWebhookSignature({
      secret: "super-secret",
      timestamp: "1715010000000",
      body: '{"type":"savedBuild.created"}',
    });

    expect(
      verifyWebhookSignature({
        expectedSecret: "super-secret",
        timestamp: "1715010000000",
        body: '{"type":"savedBuild.created"}',
        providedSignature: signature,
      }),
    ).toBe(true);

    expect(
      verifyWebhookSignature({
        expectedSecret: "super-secret",
        timestamp: "1715010000000",
        body: '{"type":"savedBuild.created","tampered":true}',
        providedSignature: signature,
      }),
    ).toBe(false);
  });
});
