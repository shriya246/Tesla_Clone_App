import Link from "next/link";
import type { ReactNode } from "react";

interface InsightSectionCardProps {
  eyebrow: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
}

export function InsightSectionCard({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  children,
}: InsightSectionCardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>

        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>

      <div className="mt-8">{children}</div>
    </section>
  );
}
