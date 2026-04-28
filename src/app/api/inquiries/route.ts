import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createInquiry } from "@/lib/db/inquiries";
import { sendInquiryNotificationEmails } from "@/lib/email/inquiries";
import {
  buildRateLimitHeaders,
  consumeRateLimit,
} from "@/lib/security/rate-limit";
import {
  getRequestIp,
  isTrustedMutationOrigin,
} from "@/lib/security/request";
import { inquiryPayloadSchema } from "@/lib/validations/inquiry";
import type { InquiryApiResponse, InquiryTypeValue } from "@/types";

function getSuccessMessage(
  type: InquiryTypeValue,
  emailStatus: InquiryApiResponse["emailStatus"] = "sent",
) {
  if (emailStatus === "partial_failure") {
    return "Your request has been received and saved successfully. Follow-up email delivery may be delayed, but the team can still review your submission.";
  }

  if (emailStatus === "skipped") {
    return "Your request has been received and saved successfully. This environment is not fully configured for email delivery yet, so confirmation emails may be unavailable.";
  }

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
  if (!isTrustedMutationOrigin(request)) {
    const response: InquiryApiResponse = {
      success: false,
      message: "This request origin is not allowed.",
    };

    return NextResponse.json(response, { status: 403 });
  }

  const rateLimitKey = [
    "inquiries",
    getRequestIp(request) ?? "unknown-ip",
    request.headers.get("user-agent") ?? "unknown-agent",
  ].join(":");
  const rateLimitResult = consumeRateLimit(rateLimitKey, {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimitResult.success) {
    const response: InquiryApiResponse = {
      success: false,
      message:
        "Too many requests were submitted from this connection. Please wait a few minutes and try again.",
      retryAfterSeconds: rateLimitResult.retryAfterSeconds,
    };

    return NextResponse.json(response, {
      status: 429,
      headers: buildRateLimitHeaders(rateLimitResult),
    });
  }

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

    if (parsed.data.website) {
      const response: InquiryApiResponse = {
        success: true,
        message: getSuccessMessage(parsed.data.type, "skipped"),
        emailStatus: "skipped",
      };

      return NextResponse.json(response, {
        status: 201,
        headers: buildRateLimitHeaders(rateLimitResult),
      });
    }

    const inquiry = await createInquiry({
      ...parsed.data,
      userId: session?.user?.id,
    });
    let emailStatus: InquiryApiResponse["emailStatus"] = "sent";

    try {
      const emailResult = await sendInquiryNotificationEmails({
        inquiryId: inquiry.id,
        createdAt: inquiry.createdAt,
        ...parsed.data,
      });

      emailStatus = emailResult.status;

      if (emailResult.failureMessages.length > 0) {
        console.error(
          "Inquiry emails completed with issues.",
          emailResult.failureMessages,
        );
      }
    } catch (error) {
      emailStatus = "partial_failure";
      Sentry.captureException(error);
      console.error("Failed to send inquiry emails.", error);
    }

    const response: InquiryApiResponse = {
      success: true,
      message: getSuccessMessage(parsed.data.type, emailStatus),
      emailStatus,
    };

    return NextResponse.json(response, {
      status: 201,
      headers: buildRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Failed to create inquiry.", error);

    const response: InquiryApiResponse = {
      success: false,
      message:
        "We could not submit your request right now. Please try again in a moment.",
    };

    return NextResponse.json(response, {
      status: 500,
      headers: buildRateLimitHeaders(rateLimitResult),
    });
  }
}
