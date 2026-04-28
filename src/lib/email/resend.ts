import "server-only";

import { Resend } from "resend";

import { env, hasResendEnv, requireServerEnv } from "@/lib/env";

let resendClient: Resend | null = null;

export function getResendClient() {
  if (!hasResendEnv) {
    throw new Error(
      "Resend is not configured. Add RESEND_API_KEY and EMAIL_FROM to enable transactional email.",
    );
  }

  if (!resendClient) {
    resendClient = new Resend(requireServerEnv("RESEND_API_KEY"));
  }

  return resendClient;
}

export function getEmailFromAddress() {
  return env.EMAIL_FROM ?? requireServerEnv("EMAIL_FROM");
}
