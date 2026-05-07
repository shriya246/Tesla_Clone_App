import { NextResponse } from "next/server";
import { AuditAction } from "@prisma/client";
import { z } from "zod";

import { recordAuditLogSafely } from "@/lib/audit";
import { requireAdminApiSession } from "@/lib/auth/require-admin-api";
import {
  buildInquiryExportCsv,
  getInquiryExportRows,
} from "@/lib/exports/inquiries";

const formatSchema = z.enum(["csv", "json"]);

export async function GET(request: Request) {
  const adminAccess = await requireAdminApiSession();

  if ("errorResponse" in adminAccess) {
    return adminAccess.errorResponse;
  }

  const url = new URL(request.url);
  const format = formatSchema.safeParse(url.searchParams.get("format") ?? "csv");

  if (!format.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Use format=csv or format=json for inquiry exports.",
      },
      { status: 400 },
    );
  }

  if (format.data === "json") {
    const items = await getInquiryExportRows();

    await recordAuditLogSafely({
      action: AuditAction.EXPORT_REQUESTED,
      actor: {
        userId: adminAccess.session.user.id,
        email: adminAccess.session.user.email,
        role: adminAccess.session.user.role,
      },
      entity: {
        type: "INQUIRY_EXPORT",
      },
      message: `Requested a JSON inquiry export with ${items.length} rows.`,
      metadata: {
        format: "json",
        itemCount: items.length,
      },
    });

    return NextResponse.json(
      {
        exportedAt: new Date().toISOString(),
        items,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const csv = await buildInquiryExportCsv();

  await recordAuditLogSafely({
    action: AuditAction.EXPORT_REQUESTED,
    actor: {
      userId: adminAccess.session.user.id,
      email: adminAccess.session.user.email,
      role: adminAccess.session.user.role,
    },
    entity: {
      type: "INQUIRY_EXPORT",
    },
    message: "Requested a CSV inquiry export.",
    metadata: {
      format: "csv",
    },
  });

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": 'attachment; filename="inquiries-export.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
