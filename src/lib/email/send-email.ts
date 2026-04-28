import "server-only";

import * as Sentry from "@sentry/nextjs";
import { getEmailFromAddress, getResendClient } from "@/lib/email/resend";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string | string[];
}

export interface SendEmailResult {
  success: boolean;
  emailId?: string;
  errorMessage?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: getEmailFromAddress(),
      to,
      subject,
      html,
      text,
      replyTo,
    });

    if (error) {
      Sentry.captureException(new Error(`Resend send failure: ${error.message}`));

      return {
        success: false,
        errorMessage: error.message,
      };
    }

    return {
      success: true,
      emailId: data?.id,
    };
  } catch (error) {
    Sentry.captureException(error);

    return {
      success: false,
      errorMessage:
        error instanceof Error ? error.message : "Unknown email error.",
    };
  }
}
