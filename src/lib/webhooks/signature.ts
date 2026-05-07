import { createHmac, timingSafeEqual } from "node:crypto";

export function createWebhookSignature(input: {
  secret: string;
  timestamp: string;
  body: string;
}) {
  return createHmac("sha256", input.secret)
    .update(`${input.timestamp}.${input.body}`)
    .digest("hex");
}

export function verifyWebhookSignature(input: {
  expectedSecret: string;
  timestamp: string;
  body: string;
  providedSignature: string;
}) {
  const expectedSignature = createWebhookSignature({
    secret: input.expectedSecret,
    timestamp: input.timestamp,
    body: input.body,
  });
  const left = Buffer.from(expectedSignature);
  const right = Buffer.from(input.providedSignature);

  return left.length === right.length && timingSafeEqual(left, right);
}
