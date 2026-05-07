import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { ZodError } from "zod";

import {
  getAdminProductEditorHref,
} from "@/lib/admin-products";
import { requireAdminApiSession } from "@/lib/auth/require-admin-api";
import { isTrustedMutationOrigin } from "@/lib/security/request";
import { createAdminProductWithAutomation } from "@/lib/services/admin-products";
import { parseAdminProductPayload } from "@/lib/validations/admin-product";
import type { AdminProductMutationResponse } from "@/types";

function buildValidationResponse(error: ZodError) {
  const response: AdminProductMutationResponse = {
    success: false,
    message: "Please review the product form and try again.",
    fieldErrors: error.flatten().fieldErrors,
  };

  return NextResponse.json(response, { status: 400 });
}

export async function POST(request: Request) {
  const adminAccess = await requireAdminApiSession();

  if ("errorResponse" in adminAccess) {
    return adminAccess.errorResponse;
  }

  if (!isTrustedMutationOrigin(request)) {
    const response: AdminProductMutationResponse = {
      success: false,
      message: "This request origin is not allowed.",
    };

    return NextResponse.json(response, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    const response: AdminProductMutationResponse = {
      success: false,
      message: "We could not read the product form payload.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  try {
    const parsed = parseAdminProductPayload(body);
    const createdProduct = await createAdminProductWithAutomation({
      actor: {
        userId: adminAccess.session.user.id,
        email: adminAccess.session.user.email,
        role: adminAccess.session.user.role,
      },
      category:
        parsed.itemType === "VEHICLE"
          ? "vehicles"
          : parsed.itemType === "ENERGY_PRODUCT"
            ? "energy"
            : "shop",
      input: parsed,
    });

    const response: AdminProductMutationResponse = {
      success: true,
      message: "Product created successfully.",
      redirectTo: getAdminProductEditorHref(
        createdProduct.category,
        createdProduct.id,
      ),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return buildValidationResponse(error);
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const response: AdminProductMutationResponse = {
        success: false,
        message: "That slug is already in use for this product type.",
        fieldErrors: {
          slug: ["That slug is already in use for this product type."],
        },
      };

      return NextResponse.json(response, { status: 409 });
    }

    Sentry.captureException(error);
    console.error("Failed to create admin product.", error);

    const response: AdminProductMutationResponse = {
      success: false,
      message:
        "We could not create the product right now. Please try again in a moment.",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
