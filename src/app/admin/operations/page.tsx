import Link from "next/link";

import { auditActionLabels } from "@/lib/audit";
import { automationRunStatusLabels } from "@/lib/admin-labels";
import { getRecentAutomationEventLogs } from "@/lib/db/automation-event-logs";
import { getAuditLogSummary, getRecentAuditLogs } from "@/lib/db/audit-logs";
import {
  getBackgroundJobSummary,
  getRecentBackgroundJobs,
} from "@/lib/db/background-jobs";
import { formatDateTime } from "@/lib/format-date";

export const dynamic = "force-dynamic";

async function safeRead<T>(read: () => Promise<T>, fallback: T) {
  try {
    return await read();
  } catch {
    return fallback;
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "FAILED":
      return "border-rose-400/20 bg-rose-400/12 text-rose-100";
    case "PARTIAL_FAILURE":
    case "PENDING":
    case "PROCESSING":
      return "border-amber-300/20 bg-amber-300/12 text-amber-50";
    case "SUCCEEDED":
    case "SUCCESS":
      return "border-emerald-400/20 bg-emerald-400/12 text-emerald-100";
    default:
      return "border-white/10 bg-black/24 text-white/58";
  }
}

export default async function AdminOperationsPage() {
  const [jobSummary, recentJobs, auditSummary, recentAuditLogs, automationLogs] =
    await Promise.all([
      safeRead(getBackgroundJobSummary, {
        pending: 0,
        processing: 0,
        succeeded: 0,
        failed: 0,
        cancelled: 0,
      }),
      safeRead(() => getRecentBackgroundJobs(10), []),
      safeRead(getAuditLogSummary, {
        totalCount: 0,
        topActions: [],
      }),
      safeRead(() => getRecentAuditLogs(10), []),
      safeRead(() => getRecentAutomationEventLogs(8), []),
    ]);

  return (
    <section className="section-shell py-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["Pending", jobSummary.pending],
            ["Processing", jobSummary.processing],
            ["Succeeded", jobSummary.succeeded],
            ["Failed", jobSummary.failed],
            ["Audit Logs", auditSummary.totalCount],
          ].map(([label, value]) => (
            <article
              key={label}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-halo backdrop-blur-sm"
            >
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                {label}
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {value}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.86fr)]">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                  Background Jobs
                </p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Retryable operational work.
                </h1>
              </div>
              <Link
                href="/admin"
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
              >
                Back to overview
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/12 bg-black/24 p-5 text-sm leading-6 text-white/62">
                No background jobs have been recorded yet.
              </div>
            ) : (
              <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-white/8">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-[1.1fr_0.9fr_0.8fr_1fr] gap-4 border-b border-white/8 bg-black/30 px-4 py-3 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-white/42">
                    <span>Kind</span>
                    <span>Status</span>
                    <span>Attempts</span>
                    <span>Updated</span>
                  </div>
                  {recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="grid grid-cols-[1.1fr_0.9fr_0.8fr_1fr] gap-4 border-b border-white/6 px-4 py-4 text-sm text-white/72 last:border-b-0"
                    >
                      <span className="break-words font-medium text-white">
                        {job.kind}
                      </span>
                      <span
                        className={[
                          "inline-flex w-fit rounded-full border px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.2em]",
                          getStatusClasses(job.status),
                        ].join(" ")}
                      >
                        {job.status}
                      </span>
                      <span>
                        {job.attempts}/{job.maxAttempts}
                      </span>
                      <span>{formatDateTime(job.updatedAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>

          <div className="grid gap-6">
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Audit Mix
              </p>
              <div className="mt-6 space-y-3">
                {auditSummary.topActions.length === 0 ? (
                  <p className="rounded-[1.25rem] border border-dashed border-white/12 bg-black/24 p-4 text-sm leading-6 text-white/62">
                    Admin audit records will appear as platform actions are taken.
                  </p>
                ) : (
                  auditSummary.topActions.map((action) => (
                    <div
                      key={action.action}
                      className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-white/8 bg-black/24 p-4"
                    >
                      <span className="text-sm font-medium text-white/78">
                        {auditActionLabels[action.action]}
                      </span>
                      <span className="text-sm text-white/52">{action.count}</span>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Automation Outcomes
              </p>
              <div className="mt-6 space-y-3">
                {automationLogs.length === 0 ? (
                  <p className="rounded-[1.25rem] border border-dashed border-white/12 bg-black/24 p-4 text-sm leading-6 text-white/62">
                    Workflow outcomes will appear after events run.
                  </p>
                ) : (
                  automationLogs.map((log) => (
                    <article
                      key={log.id}
                      className="rounded-[1.25rem] border border-white/8 bg-black/24 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={[
                            "inline-flex rounded-full border px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.2em]",
                            getStatusClasses(log.status),
                          ].join(" ")}
                        >
                          {automationRunStatusLabels[log.status]}
                        </span>
                        <span className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-white/42">
                          {log.handler}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-white/68">
                        {log.message}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </article>
          </div>
        </div>

        <article className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
            Recent Admin Actions
          </p>
          <div className="mt-6 space-y-3">
            {recentAuditLogs.length === 0 ? (
              <p className="rounded-[1.25rem] border border-dashed border-white/12 bg-black/24 p-4 text-sm leading-6 text-white/62">
                No admin actions have been audited yet.
              </p>
            ) : (
              recentAuditLogs.map((log) => (
                <article
                  key={log.id}
                  className="rounded-[1.25rem] border border-white/8 bg-black/24 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {auditActionLabels[log.action]}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/68">
                        {log.message}
                      </p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/38">
                      {formatDateTime(log.createdAt)}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-white/42">
                    <span>{log.entityType}</span>
                    {log.entityId ? <span>{log.entityId}</span> : null}
                    <span>{log.actorEmail ?? log.actor?.email ?? "system"}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
