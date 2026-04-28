import "server-only";

import {
  getAdminNotificationEmail,
  hasResendEnv,
} from "@/lib/env";
import {
  getEnergyProductBySlug,
  getShopProductBySlug,
  getVehicleBySlug,
} from "@/lib/db";
import { sendEmail } from "@/lib/email/send-email";
import {
  buildAdminDemoRequestEmail,
  buildAdminInquiryNotificationEmail,
  buildUserDemoRequestConfirmationEmail,
  buildUserInquiryConfirmationEmail,
  type InquiryEmailContext,
} from "@/lib/email/templates";
import type {
  InquiryItemTypeValue,
  InquiryTypeValue,
} from "@/types";

interface InquiryEmailInput {
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

export interface InquiryEmailDeliveryResult {
  status: "sent" | "partial_failure" | "skipped";
  failureMessages: string[];
}

async function resolveProductContext(input: {
  itemType?: InquiryItemTypeValue;
  productSlug?: string;
}) {
  if (!input.itemType || !input.productSlug) {
    return {};
  }

  switch (input.itemType) {
    case "VEHICLE": {
      const product = await getVehicleBySlug(input.productSlug);

      return {
        productTitle: product?.title,
        productCategoryLabel: "Vehicle",
      };
    }
    case "ENERGY_PRODUCT": {
      const product = await getEnergyProductBySlug(input.productSlug);

      return {
        productTitle: product?.title,
        productCategoryLabel: "Energy Product",
      };
    }
    case "SHOP_PRODUCT": {
      const product = await getShopProductBySlug(input.productSlug);

      return {
        productTitle: product?.title,
        productCategoryLabel: "Shop Product",
      };
    }
  }
}

function buildInquiryEmailContext(
  input: InquiryEmailInput,
  productContext: Awaited<ReturnType<typeof resolveProductContext>>,
): InquiryEmailContext {
  return {
    inquiryId: input.inquiryId,
    createdAt: input.createdAt,
    type: input.type,
    itemType: input.itemType,
    requesterName: input.name,
    requesterEmail: input.email,
    requesterPhone: input.phone,
    message: input.message,
    productSlug: input.productSlug,
    productTitle: productContext.productTitle,
    productCategoryLabel: productContext.productCategoryLabel,
  };
}

function buildEmailTemplates(context: InquiryEmailContext) {
  const isDemoRequest = context.type === "VEHICLE_DEMO_REQUEST";

  return {
    admin: isDemoRequest
      ? buildAdminDemoRequestEmail(context)
      : buildAdminInquiryNotificationEmail(context),
    user: isDemoRequest
      ? buildUserDemoRequestConfirmationEmail(context)
      : buildUserInquiryConfirmationEmail(context),
  };
}

export async function sendInquiryNotificationEmails(
  input: InquiryEmailInput,
): Promise<InquiryEmailDeliveryResult> {
  const adminNotificationEmail = getAdminNotificationEmail();

  if (!hasResendEnv || !adminNotificationEmail) {
    return {
      status: "skipped",
      failureMessages: [
        "Transactional email is not fully configured on this environment.",
      ],
    };
  }

  const productContext = await resolveProductContext({
    itemType: input.itemType,
    productSlug: input.productSlug,
  });
  const context = buildInquiryEmailContext(input, productContext);
  const templates = buildEmailTemplates(context);

  const [adminResult, userResult] = await Promise.all([
    sendEmail({
      to: adminNotificationEmail,
      subject: templates.admin.subject,
      html: templates.admin.html,
      text: templates.admin.text,
      replyTo: input.email,
    }),
    sendEmail({
      to: input.email,
      subject: templates.user.subject,
      html: templates.user.html,
      text: templates.user.text,
      replyTo: adminNotificationEmail,
    }),
  ]);

  const failureMessages: string[] = [];

  if (!adminResult.success) {
    failureMessages.push(
      `Admin notification failed${adminResult.errorMessage ? `: ${adminResult.errorMessage}` : "."}`,
    );
  }

  if (!userResult.success) {
    failureMessages.push(
      `User confirmation failed${userResult.errorMessage ? `: ${userResult.errorMessage}` : "."}`,
    );
  }

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
}
