import "server-only";

import * as Sentry from "@sentry/nextjs";

import {
  buildInquiryNotificationEmailMessages,
  sendInquiryNotificationEmails,
  type InquiryEmailDeliveryResult,
} from "@/lib/email/inquiries";
import { hasResendEnv } from "@/lib/env";
import { enqueueEmailDeliveryJob, processBackgroundJobById } from "@/lib/jobs";
import type {
  InquiryItemTypeValue,
  InquiryTypeValue,
} from "@/types";

interface InquiryEmailJobInput {
  inquiryId: string;
  createdAt: Date;
  type: InquiryTypeValue;
  itemType?: InquiryItemTypeValue;
  productSlug?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function queueInquiryNotificationEmails(
  input: InquiryEmailJobInput,
): Promise<InquiryEmailDeliveryResult> {
  if (!hasResendEnv) {
    return {
      status: "skipped",
      failureMessages: [
        "Transactional email is not fully configured on this environment.",
      ],
    };
  }

  try {
    const messages = await buildInquiryNotificationEmailMessages(input);

    if (messages.length === 0) {
      return {
        status: "skipped",
        failureMessages: [
          "No admin notification recipient is configured for inquiry emails.",
        ],
      };
    }

    const jobs = await Promise.all(
      messages.map((entry) =>
        enqueueEmailDeliveryJob({
          message: entry.message,
          dedupeKey: `email:inquiry:${input.inquiryId}:${entry.key}`,
        }),
      ),
    );
    const processedJobs = await Promise.all(
      jobs.map((job) => processBackgroundJobById(job.id)),
    );
    const failureMessages = processedJobs.flatMap((job, index) =>
      job.status === "SUCCEEDED" || jobs[index].status === "SUCCEEDED"
        ? []
        : [job.message],
    );

    if (failureMessages.length === 0) {
      return {
        status: "sent",
        failureMessages: [],
      };
    }

    return {
      status: "partial_failure",
      failureMessages,
    };
  } catch (error) {
    Sentry.captureException(error);
    console.error(
      "Failed to queue inquiry emails. Falling back to direct email delivery.",
      error,
    );

    return sendInquiryNotificationEmails(input);
  }
}
