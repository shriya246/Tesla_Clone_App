import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { ZodError } from "zod";

import {
  getAdminProductEditorHref,
  getAdminProductCategoryConfig,
  getProductHref,
  isAdminProductCategory,
} from "@/lib/admin-products";
import { requireAdminApiSession } from "@/lib/auth/require-admin-api";
import {
  deleteAdminProduct,
  updateAdminProduct,
} from "@/lib/db/admin-products";
import { isTrustedMutationOrigin } from "@/lib/security/request";
import { parseAdminProductPayload } from "@/lib/validations/admin-product";
import type { AdminProductMutationResponse } from "@/types";

interface UpdateAdminProductRouteContext {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

function buildValidationResponse(error: ZodError) {
  const response: AdminProductMutationResponse = {
    success: false,
    message: "Please review the product form and try again.",
    fieldErrors: error.flatten().fieldErrors,
  };

  return NextResponse.json(response, { status: 400 });
}

function revalidateProductPaths(itemType: "VEHICLE" | "ENERGY_PRODUCT" | "SHOP_PRODUCT", slug: string) {
  const href = getProductHref(itemType, slug);
  const listingPath = `/${href.split("/")[1]}`;

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/account");
  revalidatePath(listingPath);
  revalidatePath(href);
}

export async function PATCH(
  request: Request,
  context: UpdateAdminProductRouteContext,
) {
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

  const { category, id } = await context.params;

  if (!isAdminProductCategory(category)) {
    const response: AdminProductMutationResponse = {
      success: false,
      message: "Unknown product category.",
    };

    return NextResponse.json(response, { status: 404 });
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
    const categoryConfig = getAdminProductCategoryConfig(category);

    if (parsed.itemType !== categoryConfig.itemType) {
      const response: AdminProductMutationResponse = {
        success: false,
        message: "The product type does not match this editor route.",
      };

      return NextResponse.json(response, { status: 400 });
    }

    const updatedProduct = await updateAdminProduct(category, id, parsed);

    revalidateProductPaths(updatedProduct.itemType, updatedProduct.slug);

    const response: AdminProductMutationResponse = {
      success: true,
      message: "Product updated successfully.",
      redirectTo: getAdminProductEditorHref(
        updatedProduct.category,
        updatedProduct.id,
      ),
    };

    return NextResponse.json(response, { status: 200 });
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

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      const response: AdminProductMutationResponse = {
        success: false,
        message: "We could not find that product anymore.",
      };

      return NextResponse.json(response, { status: 404 });
    }

    Sentry.captureException(error);
    console.error("Failed to update admin product.", error);

    const response: AdminProductMutationResponse = {
      success: false,
      message:
        "We could not update the product right now. Please try again in a moment.",
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: UpdateAdminProductRouteContext,
) {
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

  const { category, id } = await context.params;

  if (!isAdminProductCategory(category)) {
    const response: AdminProductMutationResponse = {
      success: false,
      message: "Unknown product category.",
    };

    return NextResponse.json(response, { status: 404 });
  }

  try {
    const deletedProduct = await deleteAdminProduct(category, id);

    revalidateProductPaths(deletedProduct.itemType, deletedProduct.slug);

    const response: AdminProductMutationResponse = {
      success: true,
      message: "Product deleted successfully.",
      redirectTo: "/admin/products",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      const response: AdminProductMutationResponse = {
        success: false,
        message: "We could not find that product anymore.",
      };

      return NextResponse.json(response, { status: 404 });
    }

    Sentry.captureException(error);
    console.error("Failed to delete admin product.", error);

    const response: AdminProductMutationResponse = {
      success: false,
      message:
        "We could not delete the product right now. Please try again in a moment.",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
