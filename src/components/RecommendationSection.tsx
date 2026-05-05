import Link from "next/link";

import { buildMediaBackgroundStyle } from "@/lib/media";
import type { RecommendationSectionData } from "@/lib/recommendations/types";

interface RecommendationSectionProps {
  section: RecommendationSectionData;
}

export function RecommendationSection({ section }: RecommendationSectionProps) {
  if (section.items.length === 0) {
    return null;
  }

  return (
    <section className="section-shell border-t border-white/8 bg-slate-950 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
              {section.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {section.title}
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/72 sm:text-base">
              {section.description}
            </p>
          </div>

          {section.actionHref && section.actionLabel ? (
            <Link
              href={section.actionHref}
              className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
            >
              {section.actionLabel}
            </Link>
          ) : null}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {section.items.map((item) => (
            <Link
              key={`${item.itemType}-${item.slug}`}
              href={item.href}
              className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-halo backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.05]"
            >
              <div
                className="relative h-64 overflow-hidden"
                style={buildMediaBackgroundStyle({
                  image: item.image,
                  overlay:
                    "linear-gradient(to bottom, rgba(12, 15, 21, 0.14), rgba(12, 15, 21, 0.62))",
                  backgroundColor: "#0c0f15",
                })}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_32%)] transition duration-500 group-hover:opacity-85" />
                <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-4">
                  <span className="inline-flex rounded-full border border-white/12 bg-black/30 px-4 py-1 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/78 backdrop-blur-sm">
                    {item.eyebrow ?? "Explore"}
                  </span>
                  {item.price ? (
                    <span className="text-xs font-medium uppercase tracking-[0.24em] text-white/65">
                      {item.price}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-white/72 sm:text-base">
                  {item.description}
                </p>
                <p className="mt-6 text-sm font-medium tracking-[0.02em] text-white transition group-hover:text-white/76">
                  View details
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
