import "server-only";

import { createInquiry } from "@/lib/db/inquiries";
import { publishEvent } from "@/lib/events";
import type { EventActor } from "@/lib/events";
import type { InquiryPayloadValues } from "@/lib/validations/inquiry";

interface SubmitInquiryInput {
  payload: InquiryPayloadValues;
  actor?: EventActor;
}

export async function submitInquiry({ actor, payload }: SubmitInquiryInput) {
  const inquiry = await createInquiry({
    ...payload,
    userId: actor?.userId,
  });

  await publishEvent({
    type: "inquiry.created",
    actor,
    entity: {
      type: "INQUIRY",
      id: inquiry.id,
    },
    payload: {
      inquiryId: inquiry.id,
      userId: actor?.userId,
      type: payload.type,
      itemType: payload.itemType,
      productSlug: payload.productSlug,
      email: payload.email,
      phone: payload.phone,
      message: payload.message,
    },
  });

  return inquiry;
}
