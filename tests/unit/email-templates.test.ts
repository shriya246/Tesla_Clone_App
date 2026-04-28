import { describe, expect, it } from "vitest";

import {
  buildAdminInquiryNotificationEmail,
  buildUserDemoRequestConfirmationEmail,
} from "@/lib/email/templates";

const baseContext = {
  inquiryId: "inq_123",
  createdAt: new Date("2026-04-28T17:00:00.000Z"),
  type: "PRODUCT_INQUIRY" as const,
  itemType: "SHOP_PRODUCT" as const,
  requesterName: "Taylor Example",
  requesterEmail: "taylor@example.com",
  requesterPhone: "555-0100",
  message: "Interested in compatibility with <garage> setup.",
  productSlug: "wall-connector",
  productTitle: "Wall Connector",
  productCategoryLabel: "Product",
};

describe("email templates", () => {
  it("builds an admin notification with escaped html content", () => {
    const email = buildAdminInquiryNotificationEmail(baseContext);

    expect(email.subject).toContain("product inquiry");
    expect(email.text).toContain("Wall Connector");
    expect(email.html).toContain(
      "Interested in compatibility with &lt;garage&gt; setup.",
    );
  });

  it("builds a user confirmation tailored to demo requests", () => {
    const email = buildUserDemoRequestConfirmationEmail({
      ...baseContext,
      type: "VEHICLE_DEMO_REQUEST",
      itemType: "VEHICLE",
      productSlug: "model-s",
      productTitle: "Model S",
      productCategoryLabel: "Vehicle",
    });

    expect(email.subject).toContain("Demo request received");
    expect(email.html).toContain("We received your demo drive request");
    expect(email.text).toContain("Vehicle: Model S");
  });
});
