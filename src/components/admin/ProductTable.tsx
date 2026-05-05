import Link from "next/link";

import {
  getAdminProductCreateHref,
  type AdminProductCategoryConfig,
} from "@/lib/admin-products";
import { formatDateTime } from "@/lib/format-date";
import { buildMediaBackgroundStyle } from "@/lib/media";
import type { AdminProductListItem } from "@/types";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

interface ProductTableProps {
  config: AdminProductCategoryConfig;
  items: AdminProductListItem[];
}

export function ProductTable({ config, items }: ProductTableProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
            {config.collectionTitle}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
            {config.collectionDescription}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex w-fit rounded-full border border-white/10 bg-black/24 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white/72">
            {items.length} items
          </span>
          <Link
            href={getAdminProductCreateHref(config.category)}
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-white/10 bg-white px-4 text-sm font-medium text-slate-950 transition hover:bg-white/90"
          >
            New {config.categoryLabel}
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-[1.75rem] border border-dashed border-white/12 bg-black/24 p-6 text-center">
          <p className="text-lg font-medium text-white">Nothing here yet.</p>
          <p className="mt-3 text-sm leading-6 text-white/62">
            Create the first {config.categoryLabel.toLowerCase()} when you are ready to
            expand this catalog section.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-[1.75rem] border border-white/8 bg-black/24 p-5"
            >
              <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div
                  className="h-44 rounded-[1.4rem] border border-white/10"
                  style={buildMediaBackgroundStyle({
                    image: item.image,
                    overlay:
                      "linear-gradient(to bottom, rgba(12, 15, 21, 0.14), rgba(12, 15, 21, 0.62))",
                    backgroundColor: "#0c0f15",
                  })}
                />

                <div className="min-w-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                        {item.categoryLabel}
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 break-all text-sm text-white/56">{item.slug}</p>
                    </div>

                    <div className="text-left sm:text-right">
                      {item.price ? (
                        <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/58">
                          {item.price}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/38">
                        Updated {formatDateTime(item.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/78">
                      {item.isRemoteImage ? "Remote image" : "Local asset"}
                    </span>
                    <span className="inline-flex rounded-full border border-white/10 bg-black/24 px-4 py-1 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/68">
                      {item.engagement.views} views
                    </span>
                    <span className="inline-flex rounded-full border border-white/10 bg-black/24 px-4 py-1 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/68">
                      {item.engagement.favorites} favorites
                    </span>
                    {item.itemType === "VEHICLE" ? (
                      <span className="inline-flex rounded-full border border-white/10 bg-black/24 px-4 py-1 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/68">
                        {item.engagement.savedBuilds} builds
                      </span>
                    ) : null}
                    <span className="inline-flex rounded-full border border-white/10 bg-black/24 px-4 py-1 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/68">
                      {item.engagement.inquiries} inquiries
                    </span>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-white/72 sm:text-base">
                    {item.summary}
                  </p>

                  <div className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Link
                        href={item.href}
                        className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
                      >
                        View public page
                      </Link>
                      <Link
                        href={item.adminHref}
                        className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-black/24 px-5 text-sm font-medium text-white/68 transition hover:border-white/18 hover:text-white"
                      >
                        Edit product
                      </Link>
                    </div>

                    <DeleteProductButton
                      category={item.category}
                      compact
                      id={item.id}
                      title={item.title}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
