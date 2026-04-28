import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createInquiry } from "@/lib/db/inquiries";
import { inquiryPayloadSchema } from "@/lib/validations/inquiry";
import type { InquiryApiResponse, InquiryTypeValue } from "@/types";

function getSuccessMessage(type: InquiryTypeValue) {
  switch (type) {
    case "VEHICLE_DEMO_REQUEST":
      return "Your demo drive request is in. A specialist will reach out shortly.";
    case "ENERGY_CONSULTATION":
      return "Your energy consultation request has been received. We will follow up soon.";
    case "PRODUCT_INQUIRY":
      return "Your product inquiry has been sent. We will get back to you with more details.";
    default:
      return "Your inquiry has been received. We will be in touch soon.";
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    const response: InquiryApiResponse = {
      success: false,
      message: "We could not read your request. Please try again.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  const parsed = inquiryPayloadSchema.safeParse(body);

  if (!parsed.success) {
    const response: InquiryApiResponse = {
      success: false,
      message: "Please review the form and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };

    return NextResponse.json(response, { status: 400 });
  }

  try {
    const session = await auth();

    await createInquiry({
      ...parsed.data,
      userId: session?.user?.id,
    });

    const response: InquiryApiResponse = {
      success: true,
      message: getSuccessMessage(parsed.data.type),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Failed to create inquiry.", error);

    const response: InquiryApiResponse = {
      success: false,
      message:
        "We could not submit your request right now. Please try again in a moment.",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
