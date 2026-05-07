import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { ZodError } from "zod";

import { requireAdminApiSession } from "@/lib/auth/require-admin-api";
import { isTrustedMutationOrigin } from "@/lib/security/request";
import { updateRecommendationRankingConfig } from "@/lib/services/recommendation-ranking";
import { recommendationRankingConfigPayloadSchema } from "@/lib/validations/recommendation-ranking";
import type { AdminRankingMutationResponse } from "@/types";

function buildValidationResponse(error: ZodError) {
  const response: AdminRankingMutationResponse = {
    success: false,
    message: "Please review the ranking settings and try again.",
    fieldErrors: error.flatten().fieldErrors,
  };

  return NextResponse.json(response, { status: 400 });
}

export async function PATCH(request: Request) {
  const adminAccess = await requireAdminApiSession();

  if ("errorResponse" in adminAccess) {
    return adminAccess.errorResponse;
  }

  if (!isTrustedMutationOrigin(request)) {
    const response: AdminRankingMutationResponse = {
      success: false,
      message: "This request origin is not allowed.",
    };

    return NextResponse.json(response, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    const response: AdminRankingMutationResponse = {
      success: false,
      message: "We could not read the ranking settings payload.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  try {
    const values = recommendationRankingConfigPayloadSchema.parse(body);

    await updateRecommendationRankingConfig({
      actor: {
        userId: adminAccess.session.user.id,
        email: adminAccess.session.user.email,
        role: adminAccess.session.user.role,
      },
      values,
    });

    const response: AdminRankingMutationResponse = {
      success: true,
      message:
        "Ranking settings updated. Recommendation and search surfaces will pick up the new weights on the next request.",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return buildValidationResponse(error);
    }

    Sentry.captureException(error);
    console.error("Failed to update ranking config.", error);

    const response: AdminRankingMutationResponse = {
      success: false,
      message:
        "We could not update the ranking settings right now. Please try again in a moment.",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
