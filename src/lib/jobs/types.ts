import type { BackgroundJob, BackgroundJobKind } from "@prisma/client";

export interface BackgroundJobHandlerResult {
  success: boolean;
  message: string;
  retryable?: boolean;
  metadata?: Record<string, unknown>;
}

export interface BackgroundJobProcessResult {
  jobId: string;
  kind: BackgroundJobKind;
  status: "SUCCEEDED" | "FAILED" | "RETRY_SCHEDULED" | "SKIPPED";
  message: string;
}

export type BackgroundJobHandler = (
  job: BackgroundJob,
) => Promise<BackgroundJobHandlerResult>;
