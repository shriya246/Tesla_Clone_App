import { NextResponse } from "next/server";
import { AuditAction } from "@prisma/client";
import { z } from "zod";

import { recordAuditLogSafely, type AuditActor } from "@/lib/audit";
import { requireAdminApiSession } from "@/lib/auth/require-admin-api";
import { env } from "@/lib/env";
import { processDueBackgroundJobs } from "@/lib/jobs";
import { isTrustedMutationOrigin } from "@/lib/security/request";

const processJobsPayloadSchema = z.object({
  limit: z.number().int().min(1).max(50).optional(),
});

function isAuthorizedJobRunnerRequest(request: Request) {
  const authorization = request.headers.get("authorization");

  return Boolean(
    env.JOB_RUNNER_SECRET &&
      authorization === `Bearer ${env.JOB_RUNNER_SECRET}`,
  );
}

async function readPayload(request: Request) {
  const rawBody = await request.text();

  if (!rawBody.trim()) {
    return {};
  }

  return JSON.parse(rawBody);
}

async function authorizeRequest(request: Request): Promise<
  | {
      actor?: AuditActor;
    }
  | {
      errorResponse: NextResponse;
    }
> {
  if (isAuthorizedJobRunnerRequest(request)) {
    return {
      actor: {
        email: "job-runner",
      },
    };
  }

  const adminAccess = await requireAdminApiSession();

  if ("errorResponse" in adminAccess && adminAccess.errorResponse) {
    return {
      errorResponse: adminAccess.errorResponse,
    };
  }

  if (!isTrustedMutationOrigin(request)) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          message: "This request origin is not allowed.",
        },
        { status: 403 },
      ),
    };
  }

  return {
    actor: {
      userId: adminAccess.session.user.id,
      email: adminAccess.session.user.email,
      role: adminAccess.session.user.role,
    },
  };
}

export async function POST(request: Request) {
  const authorization = await authorizeRequest(request);

  if ("errorResponse" in authorization) {
    return authorization.errorResponse;
  }

  let payload: unknown;

  try {
    payload = await readPayload(request);
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "We could not read the background job processor payload.",
      },
      { status: 400 },
    );
  }

  const parsed = processJobsPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Use a limit between 1 and 50 when processing jobs.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const result = await processDueBackgroundJobs({
    limit: parsed.data.limit,
  });

  await recordAuditLogSafely({
    action: AuditAction.BACKGROUND_JOBS_PROCESSED,
    actor: authorization.actor,
    entity: {
      type: "BACKGROUND_JOB_RUN",
    },
    message: `Processed ${result.processedCount} due background jobs.`,
    metadata: {
      processedCount: result.processedCount,
      succeededCount: result.succeededCount,
      retryScheduledCount: result.retryScheduledCount,
      failedCount: result.failedCount,
    },
  });

  return NextResponse.json(
    {
      success: true,
      ...result,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
