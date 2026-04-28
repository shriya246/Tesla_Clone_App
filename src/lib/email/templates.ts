import "server-only";

import { formatDateTime } from "@/lib/format-date";
import type {
  InquiryItemTypeValue,
  InquiryTypeValue,
} from "@/types";

export interface InquiryEmailContext {
  inquiryId: string;
  createdAt: Date;
  type: InquiryTypeValue;
  itemType?: InquiryItemTypeValue;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  message: string;
  productSlug?: string;
  productTitle?: string;
  productCategoryLabel?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMultilineText(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function renderDetailRows(
  details: Array<{
    label: string;
    value?: string;
  }>,
) {
  return details
    .filter((detail) => detail.value)
    .map(
      (detail) => `
        <tr>
          <td style="padding:10px 0;color:#6b7280;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;vertical-align:top;">
            ${escapeHtml(detail.label)}
          </td>
          <td style="padding:10px 0;color:#111827;font-size:14px;line-height:1.6;">
            ${escapeHtml(detail.value ?? "")}
          </td>
        </tr>
      `,
    )
    .join("");
}

function renderEmailLayout(input: {
  eyebrow: string;
  title: string;
  intro: string;
  details: Array<{
    label: string;
    value?: string;
  }>;
  messageLabel: string;
  message: string;
  footer: string;
}) {
  return `
    <div style="margin:0;padding:32px 16px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid rgba(17,24,39,0.08);">
        <div style="padding:32px 32px 24px;background:#0f172a;color:#ffffff;">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.65);">
            ${escapeHtml(input.eyebrow)}
          </div>
          <h1 style="margin:18px 0 0;font-size:30px;line-height:1.2;font-weight:700;color:#ffffff;">
            ${escapeHtml(input.title)}
          </h1>
          <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.78);">
            ${escapeHtml(input.intro)}
          </p>
        </div>
        <div style="padding:28px 32px 32px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            ${renderDetailRows(input.details)}
          </table>
          <div style="margin-top:24px;padding:20px 22px;border-radius:18px;background:#f8fafc;border:1px solid rgba(148,163,184,0.22);">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#64748b;">
              ${escapeHtml(input.messageLabel)}
            </div>
            <p style="margin:12px 0 0;font-size:14px;line-height:1.8;color:#0f172a;">
              ${renderMultilineText(input.message)}
            </p>
          </div>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#6b7280;">
            ${escapeHtml(input.footer)}
          </p>
        </div>
      </div>
    </div>
  `;
}

function buildProductReference(context: InquiryEmailContext) {
  if (context.productTitle) {
    return context.productTitle;
  }

  if (context.productSlug) {
    return context.productSlug;
  }

  return "your request";
}

function getInquiryTypeLabel(type: InquiryTypeValue) {
  switch (type) {
    case "VEHICLE_DEMO_REQUEST":
      return "Vehicle Demo Request";
    case "ENERGY_CONSULTATION":
      return "Energy Consultation Request";
    case "PRODUCT_INQUIRY":
      return "Product Inquiry";
    case "GENERAL":
      return "General Inquiry";
  }
}

function getUserConfirmationTitle(context: InquiryEmailContext) {
  switch (context.type) {
    case "VEHICLE_DEMO_REQUEST":
      return `We received your demo drive request for ${buildProductReference(context)}.`;
    case "ENERGY_CONSULTATION":
      return `We received your energy consultation request for ${buildProductReference(context)}.`;
    case "PRODUCT_INQUIRY":
      return `We received your inquiry about ${buildProductReference(context)}.`;
    case "GENERAL":
      return "We received your inquiry.";
  }
}

function getUserConfirmationIntro(context: InquiryEmailContext) {
  switch (context.type) {
    case "VEHICLE_DEMO_REQUEST":
      return "Your request has been saved, and a specialist can follow up with next steps, timing, and product context.";
    case "ENERGY_CONSULTATION":
      return "Your consultation request has been saved, and the team can follow up with product guidance for your home-energy planning.";
    case "PRODUCT_INQUIRY":
      return "Your product inquiry has been saved, and the team can follow up with compatibility details and next-step guidance.";
    case "GENERAL":
      return "Your message has been saved, and the team can follow up soon.";
  }
}

function getUserConfirmationSubject(context: InquiryEmailContext) {
  switch (context.type) {
    case "VEHICLE_DEMO_REQUEST":
      return `Demo request received: ${buildProductReference(context)}`;
    case "ENERGY_CONSULTATION":
      return `Consultation request received: ${buildProductReference(context)}`;
    case "PRODUCT_INQUIRY":
      return `Inquiry received: ${buildProductReference(context)}`;
    case "GENERAL":
      return "Inquiry received";
  }
}

function buildSharedDetails(context: InquiryEmailContext) {
  return [
    {
      label: "Request Type",
      value: getInquiryTypeLabel(context.type),
    },
    {
      label: "Submitted",
      value: formatDateTime(context.createdAt),
    },
    {
      label: "Inquiry ID",
      value: context.inquiryId,
    },
    {
      label: "Name",
      value: context.requesterName,
    },
    {
      label: "Email",
      value: context.requesterEmail,
    },
    {
      label: "Phone",
      value: context.requesterPhone,
    },
    {
      label: context.productCategoryLabel ?? "Product",
      value: context.productTitle ?? context.productSlug,
    },
    {
      label: "Slug",
      value: context.productSlug,
    },
  ];
}

export function buildAdminDemoRequestEmail(
  context: InquiryEmailContext,
): EmailTemplate {
  const subject = `New demo request: ${buildProductReference(context)}`;
  const html = renderEmailLayout({
    eyebrow: "Admin Notification",
    title: "A new vehicle demo request was submitted.",
    intro:
      "A visitor has asked for time behind the wheel. Review the request details below and follow up directly.",
    details: buildSharedDetails(context),
    messageLabel: "Customer Message",
    message: context.message,
    footer:
      "This notification was sent from the Tesla Inspired inquiry flow through the Resend email service.",
  });

  const text = [
    "A new vehicle demo request was submitted.",
    "",
    `Request Type: ${getInquiryTypeLabel(context.type)}`,
    `Submitted: ${formatDateTime(context.createdAt)}`,
    `Inquiry ID: ${context.inquiryId}`,
    `Name: ${context.requesterName}`,
    `Email: ${context.requesterEmail}`,
    context.requesterPhone ? `Phone: ${context.requesterPhone}` : undefined,
    context.productTitle
      ? `${context.productCategoryLabel ?? "Product"}: ${context.productTitle}`
      : undefined,
    context.productSlug ? `Slug: ${context.productSlug}` : undefined,
    "",
    "Customer Message:",
    context.message,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject,
    html,
    text,
  };
}

export function buildAdminInquiryNotificationEmail(
  context: InquiryEmailContext,
): EmailTemplate {
  const subject = `New ${getInquiryTypeLabel(context.type).toLowerCase()}: ${buildProductReference(context)}`;
  const html = renderEmailLayout({
    eyebrow: "Admin Notification",
    title: "A new inquiry was submitted.",
    intro:
      "A customer submitted a product or consultation inquiry. Review the saved details below and follow up directly.",
    details: buildSharedDetails(context),
    messageLabel: "Customer Message",
    message: context.message,
    footer:
      "This notification was sent from the Tesla Inspired inquiry flow through the Resend email service.",
  });

  const text = [
    "A new inquiry was submitted.",
    "",
    `Request Type: ${getInquiryTypeLabel(context.type)}`,
    `Submitted: ${formatDateTime(context.createdAt)}`,
    `Inquiry ID: ${context.inquiryId}`,
    `Name: ${context.requesterName}`,
    `Email: ${context.requesterEmail}`,
    context.requesterPhone ? `Phone: ${context.requesterPhone}` : undefined,
    context.productTitle
      ? `${context.productCategoryLabel ?? "Product"}: ${context.productTitle}`
      : undefined,
    context.productSlug ? `Slug: ${context.productSlug}` : undefined,
    "",
    "Customer Message:",
    context.message,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject,
    html,
    text,
  };
}

export function buildUserDemoRequestConfirmationEmail(
  context: InquiryEmailContext,
): EmailTemplate {
  const subject = getUserConfirmationSubject(context);
  const html = renderEmailLayout({
    eyebrow: "Request Received",
    title: getUserConfirmationTitle(context),
    intro: getUserConfirmationIntro(context),
    details: buildSharedDetails(context),
    messageLabel: "Your Message",
    message: context.message,
    footer:
      "This confirmation was sent automatically after your request was saved in the Tesla Inspired experience.",
  });

  const text = [
    getUserConfirmationTitle(context),
    "",
    getUserConfirmationIntro(context),
    "",
    `Request Type: ${getInquiryTypeLabel(context.type)}`,
    `Submitted: ${formatDateTime(context.createdAt)}`,
    `Inquiry ID: ${context.inquiryId}`,
    context.productTitle
      ? `${context.productCategoryLabel ?? "Product"}: ${context.productTitle}`
      : undefined,
    context.productSlug ? `Slug: ${context.productSlug}` : undefined,
    "",
    "Your Message:",
    context.message,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject,
    html,
    text,
  };
}

export function buildUserInquiryConfirmationEmail(
  context: InquiryEmailContext,
): EmailTemplate {
  const subject = getUserConfirmationSubject(context);
  const html = renderEmailLayout({
    eyebrow: "Inquiry Received",
    title: getUserConfirmationTitle(context),
    intro: getUserConfirmationIntro(context),
    details: buildSharedDetails(context),
    messageLabel: "Your Message",
    message: context.message,
    footer:
      "This confirmation was sent automatically after your request was saved in the Tesla Inspired experience.",
  });

  const text = [
    getUserConfirmationTitle(context),
    "",
    getUserConfirmationIntro(context),
    "",
    `Request Type: ${getInquiryTypeLabel(context.type)}`,
    `Submitted: ${formatDateTime(context.createdAt)}`,
    `Inquiry ID: ${context.inquiryId}`,
    context.productTitle
      ? `${context.productCategoryLabel ?? "Product"}: ${context.productTitle}`
      : undefined,
    context.productSlug ? `Slug: ${context.productSlug}` : undefined,
    "",
    "Your Message:",
    context.message,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject,
    html,
    text,
  };
}
