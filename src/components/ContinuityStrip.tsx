import Link from "next/link";

import { buildMediaBackgroundStyle } from "@/lib/media";

export interface ContinuityStripItem {
  title: string;
  description: string;
  href: string;
  image: string;
  eyebrow?: string;
  price?: string;
}

interface ContinuityStripProps {
  eyebrow: string;
  title: string;
  description: string;
  items: ContinuityStripItem[];
  actionHref?: string;
  actionLabel?: string;
  compact?: boolean;
}

export function ContinuityStrip({
  eyebrow,
  title,
  description,
  items,
  actionHref,
  actionLabel,
  compact = false,
}: ContinuityStripProps) {
  if (items.length === 0) {
    return null;
  }

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

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <Link
              key={`${item.href}-${item.title}`}
              href={item.href}
              className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] shadow-halo transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.05]"
            >
              <div
                className={`relative overflow-hidden ${
                  compact ? "h-40" : "h-48"
                }`}
                style={buildMediaBackgroundStyle({
                  image: item.image,
                  overlay:
                    "linear-gradient(to bottom, rgba(12, 15, 21, 0.14), rgba(12, 15, 21, 0.72))",
                  backgroundColor: "#0c0f15",
                })}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_32%)] transition duration-500 group-hover:opacity-85" />
                <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
                  <span className="inline-flex rounded-full border border-white/12 bg-black/30 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.22em] text-white/78 backdrop-blur-sm">
                    {item.eyebrow ?? "Continue"}
                  </span>
                  {item.price ? (
                    <span className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/65">
                      {item.price}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <h3 className="text-xl font-semibold tracking-tight text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/68">
                  {item.description}
                </p>
                <p className="mt-5 text-sm font-medium tracking-[0.02em] text-white transition group-hover:text-white/76">
                  Jump back in
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
