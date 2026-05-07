import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { ZodError } from "zod";

import { requireAdminApiSession } from "@/lib/auth/require-admin-api";
import { isTrustedMutationOrigin } from "@/lib/security/request";
import {
  removeProductRankingOverrideAndRefresh,
  upsertProductRankingOverride,
} from "@/lib/services/recommendation-ranking";
import { productRankingOverridePayloadSchema } from "@/lib/validations/recommendation-ranking";
import type { AdminRankingMutationResponse } from "@/types";

function buildValidationResponse(error: ZodError) {
  const response: AdminRankingMutationResponse = {
    success: false,
    message: "Please review the product ranking override and try again.",
    fieldErrors: error.flatten().fieldErrors,
  };

  return NextResponse.json(response, { status: 400 });
}

async function requireTrustedAdminRequest(request: Request) {
  const adminAccess = await requireAdminApiSession();

  if ("errorResponse" in adminAccess) {
    return adminAccess;
  }

  if (!isTrustedMutationOrigin(request)) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          message: "This request origin is not allowed.",
        } satisfies AdminRankingMutationResponse,
        { status: 403 },
      ),
    };
  }

  return adminAccess;
}

export async function POST(request: Request) {
  const adminAccess = await requireTrustedAdminRequest(request);

  if ("errorResponse" in adminAccess) {
    return adminAccess.errorResponse;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "We could not read the override payload.",
      } satisfies AdminRankingMutationResponse,
      { status: 400 },
    );
  }

  try {
    const values = productRankingOverridePayloadSchema.parse(body);

    await upsertProductRankingOverride({
      actor: {
        userId: adminAccess.session.user.id,
        email: adminAccess.session.user.email,
        role: adminAccess.session.user.role,
      },
      values,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product ranking override updated successfully.",
      } satisfies AdminRankingMutationResponse,
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return buildValidationResponse(error);
    }

    Sentry.captureException(error);
    console.error("Failed to upsert product ranking override.", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "We could not update that product ranking override right now. Please try again in a moment.",
      } satisfies AdminRankingMutationResponse,
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const adminAccess = await requireTrustedAdminRequest(request);

  if ("errorResponse" in adminAccess) {
    return adminAccess.errorResponse;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "We could not read the override removal payload.",
      } satisfies AdminRankingMutationResponse,
      { status: 400 },
    );
  }

  try {
    const values = productRankingOverridePayloadSchema.parse(body);

    await removeProductRankingOverrideAndRefresh({
      actor: {
        userId: adminAccess.session.user.id,
        email: adminAccess.session.user.email,
        role: adminAccess.session.user.role,
      },
      itemType: values.itemType,
      itemSlug: values.itemSlug,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product ranking override removed successfully.",
      } satisfies AdminRankingMutationResponse,
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return buildValidationResponse(error);
    }

    Sentry.captureException(error);
    console.error("Failed to remove product ranking override.", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "We could not remove that product ranking override right now. Please try again in a moment.",
      } satisfies AdminRankingMutationResponse,
      { status: 500 },
    );
  }
}
