import Link from "next/link";

import { formatDateTime } from "@/lib/format-date";
import type { AdminProductListItem } from "@/types";

interface ProductInsightsTableProps {
  items: AdminProductListItem[];
}

export function ProductInsightsTable({ items }: ProductInsightsTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-white/12 bg-black/24 p-6 text-center">
        <p className="text-lg font-medium text-white">
          No product engagement has been tracked yet.
        </p>
        <p className="mt-3 text-sm leading-6 text-white/62">
          Views, favorites, saved builds, and inquiries will start shaping this
          table as customers interact with the catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/8 bg-black/24">
      <div className="hidden grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(88px,0.55fr))] gap-4 border-b border-white/8 px-5 py-4 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-white/42 md:grid">
        <span>Product</span>
        <span>Views</span>
        <span>Favorites</span>
        <span>Builds</span>
        <span>Inquiries</span>
        <span>Score</span>
      </div>

      <div className="divide-y divide-white/8">
        {items.map((item) => (
          <article
            key={`${item.category}-${item.id}`}
            className="grid gap-5 px-5 py-5 md:grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(88px,0.55fr))] md:items-center"
          >
            <div className="min-w-0">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-white/42">
                {item.categoryLabel}
              </p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">
                {item.title}
              </h3>
              <p className="mt-2 break-all text-sm text-white/56">{item.slug}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={item.adminHref}
                  className="inline-flex min-h-[2.5rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-4 text-sm font-medium text-white/82 transition hover:bg-white/18 hover:text-white"
                >
                  Edit
                </Link>
                <Link
                  href={item.href}
                  className="inline-flex min-h-[2.5rem] items-center justify-center rounded-full border border-white/10 bg-black/24 px-4 text-sm font-medium text-white/68 transition hover:border-white/18 hover:text-white"
                >
                  Public page
                </Link>
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/38">
                Updated {formatDateTime(item.updatedAt)}
              </p>
            </div>

            {[
              item.engagement.views,
              item.engagement.favorites,
              item.engagement.savedBuilds,
              item.engagement.inquiries,
              item.engagement.weightedScore,
            ].map((value, index) => (
              <div
                key={`${item.id}-${index}`}
                className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 md:bg-transparent md:p-0"
              >
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/42 md:hidden">
                  {["Views", "Favorites", "Builds", "Inquiries", "Score"][index]}
                </p>
                <p className="mt-2 text-lg font-semibold text-white md:mt-0">
                  {value}
                </p>
              </div>
            ))}
          </article>
        ))}
      </div>
    </div>
  );
}
