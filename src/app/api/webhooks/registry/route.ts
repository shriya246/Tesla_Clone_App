import { NextResponse } from "next/server";
import { AuditAction } from "@prisma/client";

import { recordAuditLogSafely } from "@/lib/audit";
import { requireAdminApiSession } from "@/lib/auth/require-admin-api";
import { appEventTypes } from "@/lib/events/types";
import { getWebhookRegistrySummary } from "@/lib/webhooks";

export async function GET() {
  const adminAccess = await requireAdminApiSession();

  if ("errorResponse" in adminAccess) {
    return adminAccess.errorResponse;
  }

  const endpoints = getWebhookRegistrySummary();

  await recordAuditLogSafely({
    action: AuditAction.WEBHOOK_REGISTRY_VIEWED,
    actor: {
      userId: adminAccess.session.user.id,
      email: adminAccess.session.user.email,
      role: adminAccess.session.user.role,
    },
    entity: {
      type: "WEBHOOK_REGISTRY",
    },
    message: `Viewed the configured webhook registry with ${endpoints.length} endpoints.`,
    metadata: {
      endpointCount: endpoints.length,
    },
  });

  return NextResponse.json(
    {
      supportedEvents: appEventTypes,
      endpoints,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
