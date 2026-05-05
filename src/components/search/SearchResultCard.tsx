import Link from "next/link";

import { buildMediaBackgroundStyle } from "@/lib/media";
import type { SearchResultItem } from "@/types";

interface SearchResultCardProps {
  item: SearchResultItem;
}

export function SearchResultCard({ item }: SearchResultCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-halo backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.05]">
      <div
        className="relative h-72 overflow-hidden sm:h-80"
        style={buildMediaBackgroundStyle({
          image: item.image,
          overlay:
            "linear-gradient(to bottom, rgba(12, 15, 21, 0.1), rgba(12, 15, 21, 0.54))",
          backgroundColor: "#0c0f15",
        })}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_34%)] transition duration-500 group-hover:opacity-80" />

        <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="inline-flex rounded-full border border-white/12 bg-black/30 px-4 py-1 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/78 backdrop-blur-sm">
              {item.typeLabel}
            </span>

            {item.badge ? (
              <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-white/70">
                {item.badge}
              </span>
            ) : null}
          </div>

          {item.price ? (
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-white/68">
              {item.price}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <Link
          href={item.href}
          className="text-2xl font-semibold tracking-tight text-white transition hover:text-white/84 sm:text-3xl"
        >
          {item.title}
        </Link>

        <p className="mt-4 flex-1 text-sm leading-6 text-white/72 sm:text-base">
          {item.description}
        </p>

        <Link
          href={item.href}
          className="mt-6 inline-flex text-sm font-medium tracking-[0.02em] text-white transition hover:text-white/76"
        >
          {item.ctaLabel}
        </Link>
      </div>
    </article>
  );
}
