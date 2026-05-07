import { NextResponse } from "next/server";
import { AuditAction } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { ZodError } from "zod";

import { recordAuditLogSafely } from "@/lib/audit";
import { requireAdminApiSession } from "@/lib/auth/require-admin-api";
import { isTrustedMutationOrigin } from "@/lib/security/request";
import {
  applyProductImport,
  findDuplicateProductImportKeys,
  previewProductImport,
  productImportPayloadSchema,
} from "@/lib/imports/products";

export async function POST(request: Request) {
  const adminAccess = await requireAdminApiSession();

  if ("errorResponse" in adminAccess) {
    return adminAccess.errorResponse;
  }

  if (!isTrustedMutationOrigin(request)) {
    return NextResponse.json(
      {
        success: false,
        message: "This request origin is not allowed.",
      },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "We could not read the product import payload.",
      },
      { status: 400 },
    );
  }

  try {
    const parsed = productImportPayloadSchema.parse(body);
    const duplicates = findDuplicateProductImportKeys(parsed.items);

    if (duplicates.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Duplicate product import keys were found: ${duplicates.join(", ")}.`,
        },
        { status: 400 },
      );
    }

    const preview = await previewProductImport(parsed.items);

    if (parsed.mode === "validate") {
      await recordAuditLogSafely({
        action: AuditAction.IMPORT_VALIDATED,
        actor: {
          userId: adminAccess.session.user.id,
          email: adminAccess.session.user.email,
          role: adminAccess.session.user.role,
        },
        entity: {
          type: "PRODUCT_IMPORT",
        },
        message: `Validated a product import payload with ${parsed.items.length} items.`,
        metadata: {
          receivedCount: parsed.items.length,
          createCount: preview.filter((item) => item.action === "create").length,
          updateCount: preview.filter((item) => item.action === "update").length,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message:
            "Product import payload is valid. Review the preview before applying it.",
          mode: "validate",
          summary: {
            receivedCount: parsed.items.length,
            createCount: preview.filter((item) => item.action === "create").length,
            updateCount: preview.filter((item) => item.action === "update").length,
          },
          items: preview,
        },
        { status: 200 },
      );
    }

    const appliedItems = await applyProductImport({
      actor: {
        userId: adminAccess.session.user.id,
        email: adminAccess.session.user.email,
        role: adminAccess.session.user.role,
      },
      items: parsed.items,
    });
    const failedCount = appliedItems.filter((item) => item.status === "failed").length;
    const appliedCount = appliedItems.filter((item) => item.status === "applied").length;

    await recordAuditLogSafely({
      action: AuditAction.IMPORT_APPLIED,
      actor: {
        userId: adminAccess.session.user.id,
        email: adminAccess.session.user.email,
        role: adminAccess.session.user.role,
      },
      entity: {
        type: "PRODUCT_IMPORT",
      },
      message: `Applied a product import with ${appliedCount} successful items and ${failedCount} failures.`,
      metadata: {
        receivedCount: parsed.items.length,
        createCount: appliedItems.filter((item) => item.action === "create").length,
        updateCount: appliedItems.filter((item) => item.action === "update").length,
        appliedCount,
        failedCount,
      },
    });

    return NextResponse.json(
      {
        success: failedCount === 0,
        message:
          failedCount === 0
            ? "Product import completed successfully."
            : "Product import completed with some item-level failures.",
        mode: "upsert",
        summary: {
          receivedCount: parsed.items.length,
          createCount: appliedItems.filter((item) => item.action === "create").length,
          updateCount: appliedItems.filter((item) => item.action === "update").length,
          appliedCount,
          failedCount,
        },
        items: appliedItems,
      },
      { status: failedCount === 0 ? 200 : 207 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Please review the import payload and try again.",
          fieldErrors: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    Sentry.captureException(error);
    console.error("Failed to process product import.", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "We could not process the product import right now. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}
