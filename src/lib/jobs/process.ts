import "server-only";

import * as Sentry from "@sentry/nextjs";
import { BackgroundJobKind } from "@prisma/client";

import {
  claimBackgroundJob,
  getDueBackgroundJobs,
  markBackgroundJobFailed,
  markBackgroundJobRetryableFailure,
  markBackgroundJobSucceeded,
  recoverStalledBackgroundJobs,
} from "@/lib/db/background-jobs";
import { backgroundJobHandlers } from "@/lib/jobs/handlers";
import { getNextRetryAt } from "@/lib/jobs/backoff";
import type { BackgroundJobProcessResult } from "@/lib/jobs/types";

const STALLED_JOB_TIMEOUT_MS = 15 * 60 * 1000;

function createWorkerId() {
  return `app-${process.pid ?? "edge"}-${crypto.randomUUID()}`;
}

function getFailureMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Background job failed unexpectedly.";
}

export async function processBackgroundJobById(
  id: string,
): Promise<BackgroundJobProcessResult> {
  const workerId = createWorkerId();
  const job = await claimBackgroundJob({
    id,
    lockedBy: workerId,
  });

  if (!job) {
    return {
      jobId: id,
      kind: BackgroundJobKind.WEBHOOK_DELIVERY,
      status: "SKIPPED",
      message: "The job was already claimed, completed, or is not due yet.",
    };
  }

  const handler = backgroundJobHandlers[job.kind];

  if (!handler) {
    await markBackgroundJobFailed({
      id: job.id,
      message: `No background job handler is registered for ${job.kind}.`,
    });

    return {
      jobId: job.id,
      kind: job.kind,
      status: "FAILED",
      message: `No background job handler is registered for ${job.kind}.`,
    };
  }

  try {
    const result = await handler(job);

    if (result.success) {
      await markBackgroundJobSucceeded(job.id);

      return {
        jobId: job.id,
        kind: job.kind,
        status: "SUCCEEDED",
        message: result.message,
      };
    }

    const failedAttemptCount = job.attempts + 1;
    const shouldRetry = result.retryable !== false &&
      failedAttemptCount < job.maxAttempts;

    if (shouldRetry) {
      await markBackgroundJobRetryableFailure({
        id: job.id,
        message: result.message,
        runAfter: getNextRetryAt(failedAttemptCount),
      });

      return {
        jobId: job.id,
        kind: job.kind,
        status: "RETRY_SCHEDULED",
        message: result.message,
      };
    }

    await markBackgroundJobFailed({
      id: job.id,
      message: result.message,
    });

    return {
      jobId: job.id,
      kind: job.kind,
      status: "FAILED",
      message: result.message,
    };
  } catch (error) {
    Sentry.captureException(error);

    const failedAttemptCount = job.attempts + 1;
    const message = getFailureMessage(error);

    if (failedAttemptCount < job.maxAttempts) {
      await markBackgroundJobRetryableFailure({
        id: job.id,
        message,
        runAfter: getNextRetryAt(failedAttemptCount),
      });

      return {
        jobId: job.id,
        kind: job.kind,
        status: "RETRY_SCHEDULED",
        message,
      };
    }

    await markBackgroundJobFailed({
      id: job.id,
      message,
    });

    return {
      jobId: job.id,
      kind: job.kind,
      status: "FAILED",
      message,
    };
  }
}

export async function processDueBackgroundJobs(input: {
  kinds?: BackgroundJobKind[];
  limit?: number;
} = {}) {
  const limit = Math.min(Math.max(input.limit ?? 10, 1), 50);
  const stalledBefore = new Date(Date.now() - STALLED_JOB_TIMEOUT_MS);

  await recoverStalledBackgroundJobs(stalledBefore);

  const jobs = await getDueBackgroundJobs({
    kinds: input.kinds,
    limit,
  });
  const results: BackgroundJobProcessResult[] = [];

  for (const job of jobs) {
    results.push(await processBackgroundJobById(job.id));
  }

  return {
    processedCount: results.length,
    succeededCount: results.filter((result) => result.status === "SUCCEEDED")
      .length,
    retryScheduledCount: results.filter(
      (result) => result.status === "RETRY_SCHEDULED",
    ).length,
    failedCount: results.filter((result) => result.status === "FAILED").length,
    results,
  };
}
