import Link from "next/link";

import { formatDateTime } from "@/lib/format-date";
import { buildMediaBackgroundStyle } from "@/lib/media";
import type { SavedBuildData } from "@/types";

interface ContinueBuildSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  builds: SavedBuildData[];
  actionHref?: string;
  actionLabel?: string;
  compact?: boolean;
}

function getBuildHighlights(build: SavedBuildData) {
  return [
    build.selectedOptions.trim.optionLabel,
    build.selectedOptions.range.optionLabel,
    build.selectedOptions.exteriorColor.optionLabel,
  ].filter((value): value is string => Boolean(value));
}

export function ContinueBuildSection({
  eyebrow,
  title,
  description,
  builds,
  actionHref,
  actionLabel,
  compact = false,
}: ContinueBuildSectionProps) {
  if (builds.length === 0) {
    return null;
  }

  const [featuredBuild, ...secondaryBuilds] = builds;
  const highlights = getBuildHighlights(featuredBuild);

  return (
    <section
      className={`section-shell border-t border-white/8 ${
        compact ? "py-12 lg:py-14" : "py-16 lg:py-20"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
              {eyebrow}
            </p>
            <h2
              className={`mt-4 font-semibold tracking-tight text-white ${
                compact
                  ? "text-3xl sm:text-4xl"
                  : "text-3xl sm:text-4xl lg:text-5xl"
              }`}
            >
              {title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
              {description}
            </p>
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

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-halo">
            <div
              className="relative min-h-[19rem] overflow-hidden p-6 sm:p-8"
              style={buildMediaBackgroundStyle({
                image: featuredBuild.vehicleImage,
                overlay:
                  "linear-gradient(120deg, rgba(8,10,14,0.9), rgba(8,10,14,0.6) 55%, rgba(8,10,14,0.88))",
                backgroundColor: "#0b0d11",
              })}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_30%)]" />
              <div className="relative flex h-full flex-col justify-between gap-8">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex rounded-full border border-white/12 bg-black/30 px-4 py-1 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/78 backdrop-blur-sm">
                      {featuredBuild.buildLabel ?? "Latest Saved Build"}
                    </span>
                    <span className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/58">
                      Updated {formatDateTime(featuredBuild.updatedAt)}
                    </span>
                  </div>

                  <h3 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Continue configuring {featuredBuild.vehicleTitle}.
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/74 sm:text-base">
                    Resume this saved build with the exact trim, range, and
                    finish direction you last kept in your account.
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-3">
                    {highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-white/78"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={featuredBuild.configureHref}
                      className="inline-flex min-h-[3.125rem] items-center justify-center rounded-full bg-white px-6 text-sm font-medium tracking-[0.02em] text-slate-950 shadow-[0_12px_40px_rgba(255,255,255,0.14)] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/90"
                    >
                      Continue Your Build
                    </Link>
                    <Link
                      href={featuredBuild.buildHref}
                      className="inline-flex min-h-[3.125rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-6 text-sm font-medium tracking-[0.02em] text-white/84 transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/20"
                    >
                      Open Build Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <div className="grid gap-4">
            {secondaryBuilds.slice(0, 2).map((build) => (
              <article
                key={build.id}
                className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm"
              >
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/40">
                  {build.buildLabel ?? "Saved build"}
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  {build.vehicleTitle}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/68">
                  {build.estimatedPrice} - Updated {formatDateTime(build.updatedAt)}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {getBuildHighlights(build)
                    .slice(0, 2)
                    .map((highlight) => (
                      <span
                        key={highlight}
                        className="inline-flex rounded-full border border-white/10 bg-black/24 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.2em] text-white/70"
                      >
                        {highlight}
                      </span>
                    ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={build.configureHref}
                    className="inline-flex min-h-[2.9rem] flex-1 items-center justify-center rounded-full border border-white/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-white/90"
                  >
                    Resume
                  </Link>
                  <Link
                    href={build.buildHref}
                    className="inline-flex min-h-[2.9rem] flex-1 items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
                  >
                    View
                  </Link>
                </div>
              </article>
            ))}

            {secondaryBuilds.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-white/12 bg-white/[0.03] p-6 text-sm leading-7 text-white/62">
                Save more builds as you compare trims and range priorities, and
                this continuity rail will keep each direction close at hand.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
