import Link from "next/link";

import { getInsightsSnapshot } from "@/lib/admin-insights";
import {
  adminProductCategoryConfigs,
  getAdminProductCreateHref,
} from "@/lib/admin-products";
import {
  adminInquiryTypeLabels,
  adminItemTypeLabels,
  getAllAdminProducts,
  getAdminDashboardSummary,
  getAllInquiries,
} from "@/lib/db/admin";
import { formatDateTime } from "@/lib/format-date";

export const dynamic = "force-dynamic";

const statCards = [
  {
    key: "totalProducts",
    label: "Catalog Items",
    description: "Vehicles, energy products, and shop items currently available.",
  },
  {
    key: "inquiryCount",
    label: "Inquiries",
    description: "All inbound demo, consultation, and product inquiry records.",
  },
  {
    key: "favoriteCount",
    label: "Favorites",
    description: "Saved catalog items tied to signed-in account activity.",
  },
  {
    key: "savedBuildCount",
    label: "Saved Builds",
    description: "Vehicle configuration saves that signal stronger model intent.",
  },
  {
    key: "searchEventCount",
    label: "Search Events",
    description: "Tracked catalog searches that now support discovery insight surfaces.",
  },
  {
    key: "userCount",
    label: "Users",
    description: "Authenticated customer and admin accounts created so far.",
  },
] as const;

export default async function AdminOverviewPage() {
  const [summary, inquiries, products, insightSnapshot] = await Promise.all([
    getAdminDashboardSummary(),
    getAllInquiries(),
    getAllAdminProducts(),
    getInsightsSnapshot(),
  ]);

  const recentInquiries = inquiries.slice(0, 4);
  const recentlyUpdatedProducts = [
    ...products.vehicles,
    ...products.energyProducts,
    ...products.shopProducts,
  ]
    .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
    .slice(0, 4);

  return (
    <>
      <section className="section-shell py-8 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <article
                key={card.key}
                className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm"
              >
                <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                  {card.label}
                </p>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
                  {summary[card.key]}
                </p>
                <p className="mt-4 text-sm leading-6 text-white/62">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/8 py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.88fr)]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                  Insight Snapshot
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  What is trending right now.
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">
                  A quick operational read on the strongest product and discovery signals
                  before you move into the deeper insight view.
                </p>
              </div>

              <Link
                href="/admin/insights"
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-white/90"
              >
                Open insights
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <article className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
                <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                  Top viewed product
                </p>
                <p className="mt-4 text-xl font-semibold tracking-tight text-white">
                  {insightSnapshot.topViewedProduct?.title ?? "No data yet"}
                </p>
                <p className="mt-3 text-sm leading-6 text-white/62">
                  {insightSnapshot.topViewedProduct
                    ? `${insightSnapshot.topViewedProduct.engagement.views} tracked views so far.`
                    : "Signed-in detail views will surface here once product activity builds."}
                </p>
              </article>

              <article className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
                <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                  Most favorited item
                </p>
                <p className="mt-4 text-xl font-semibold tracking-tight text-white">
                  {insightSnapshot.topFavoritedProduct?.title ?? "No data yet"}
                </p>
                <p className="mt-3 text-sm leading-6 text-white/62">
                  {insightSnapshot.topFavoritedProduct
                    ? `${insightSnapshot.topFavoritedProduct.engagement.favorites} favorites and ${insightSnapshot.topFavoritedProduct.engagement.inquiries} inquiries so far.`
                    : "Saved-item demand will show up here once customers begin curating products."}
                </p>
              </article>

              <article className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
                <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                  Top search query
                </p>
                <p className="mt-4 text-xl font-semibold tracking-tight text-white">
                  {insightSnapshot.topSearchQuery?.label ?? "No data yet"}
                </p>
                <p className="mt-3 text-sm leading-6 text-white/62">
                  {insightSnapshot.topSearchQuery
                    ? `${insightSnapshot.topSearchQuery.count} searches, last seen ${formatDateTime(insightSnapshot.topSearchQuery.lastSearchedAt)}.`
                    : "Tracked search submissions will appear here once discovery activity starts flowing."}
                </p>
              </article>
            </div>
          </div>

          <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
              Quick Actions
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Move from signal to action quickly.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/68">
              Use the richer insight view to spot what is trending, then jump straight
              into the product or inquiry workflow that needs attention next.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/admin/insights"
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white text-sm font-medium text-slate-950 transition hover:bg-white/90"
              >
                Review insights
              </Link>
              <Link
                href="/admin/products"
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
              >
                Review products
              </Link>
              <Link
                href="/admin/inquiries"
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-black/24 text-sm font-medium text-white/72 transition hover:border-white/18 hover:text-white"
              >
                Review inquiries
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section-shell border-t border-white/8 py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                  Recent Inquiries
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Latest inbound requests.
                </h2>
              </div>

              <Link
                href="/admin/inquiries"
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
              >
                Open inquiries
              </Link>
            </div>

            {recentInquiries.length === 0 ? (
              <div className="mt-8 rounded-[1.75rem] border border-dashed border-white/12 bg-black/24 p-6 text-center">
                <p className="text-lg font-medium text-white">
                  No inquiries have come in yet.
                </p>
                <p className="mt-3 text-sm leading-6 text-white/62">
                  Inquiry submissions will appear here as soon as public forms are used.
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                {recentInquiries.map((inquiry) => (
                  <article
                    key={inquiry.id}
                    className="rounded-[1.75rem] border border-white/8 bg-black/24 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                          {adminInquiryTypeLabels[inquiry.type]}
                        </p>
                        <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">
                          {inquiry.name}
                        </h3>
                        <p className="mt-2 text-sm text-white/62">
                          {inquiry.email}
                        </p>
                      </div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                        {formatDateTime(inquiry.createdAt)}
                      </p>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-white/72">
                      {inquiry.messagePreview}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-white/46">
                      {inquiry.itemType ? (
                        <span>{adminItemTypeLabels[inquiry.itemType]}</span>
                      ) : null}
                      {inquiry.productSlug ? <span>{inquiry.productSlug}</span> : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6">
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Catalog Breakdown
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
                  <p className="text-sm font-medium text-white">Vehicles</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                    {summary.vehicleCount}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
                  <p className="text-sm font-medium text-white">Energy</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                    {summary.energyCount}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
                  <p className="text-sm font-medium text-white">Shop</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                    {summary.shopCount}
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Quick Actions
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                Run everyday catalog and inquiry work from one place.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/68">
                Create or revise products, then review inbound requests with a
                cleaner admin workflow that stays lightweight and maintainable.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/admin/products"
                  className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white text-sm font-medium text-slate-950 transition hover:bg-white/90"
                >
                  Review Products
                </Link>
                <Link
                  href="/admin/inquiries"
                  className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
                >
                  Review Inquiries
                </Link>
                <Link
                  href="/admin/insights"
                  className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-black/24 text-sm font-medium text-white/72 transition hover:border-white/18 hover:text-white"
                >
                  Review Insights
                </Link>
                {Object.values(adminProductCategoryConfigs).map((config) => (
                  <Link
                    key={config.category}
                    href={getAdminProductCreateHref(config.category)}
                    className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-black/24 text-sm font-medium text-white/72 transition hover:border-white/18 hover:text-white"
                  >
                    New {config.categoryLabel}
                  </Link>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section-shell border-t border-white/8 py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                  Recently Updated Products
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Catalog entries that changed most recently.
                </h2>
              </div>
              <Link
                href="/admin/products"
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
              >
                Open products
              </Link>
            </div>

            {recentlyUpdatedProducts.length === 0 ? (
              <div className="mt-8 rounded-[1.75rem] border border-dashed border-white/12 bg-black/24 p-6 text-center">
                <p className="text-lg font-medium text-white">
                  No product records are available yet.
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                {recentlyUpdatedProducts.map((product) => (
                  <article
                    key={`${product.category}-${product.id}`}
                    className="rounded-[1.75rem] border border-white/8 bg-black/24 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                          {product.categoryLabel}
                        </p>
                        <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">
                          {product.title}
                        </h3>
                        <p className="mt-2 break-all text-sm text-white/56">
                          {product.slug}
                        </p>
                      </div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/38">
                        {formatDateTime(product.updatedAt)}
                      </p>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/72">
                      {product.summary}
                    </p>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href={product.adminHref}
                        className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-white/10 bg-white text-sm font-medium text-slate-950 transition hover:bg-white/90"
                      >
                        Edit product
                      </Link>
                      <Link
                        href={product.href}
                        className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-white/10 bg-black/24 text-sm font-medium text-white/72 transition hover:border-white/18 hover:text-white"
                      >
                        View public page
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                  Inquiry Follow-Up
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Continue from the saved request.
                </h2>
              </div>
              <Link
                href="/admin/inquiries"
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
              >
                Open inquiries
              </Link>
            </div>

            {recentInquiries.length === 0 ? (
              <div className="mt-8 rounded-[1.75rem] border border-dashed border-white/12 bg-black/24 p-6 text-center">
                <p className="text-lg font-medium text-white">No inquiries yet.</p>
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                {recentInquiries.map((inquiry) => (
                  <article
                    key={inquiry.id}
                    className="rounded-[1.75rem] border border-white/8 bg-black/24 p-5"
                  >
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                      {adminInquiryTypeLabels[inquiry.type]}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">
                      {inquiry.name}
                    </h3>
                    <p className="mt-2 text-sm text-white/62">{inquiry.email}</p>
                    <p className="mt-4 text-sm leading-6 text-white/72">
                      {inquiry.messagePreview}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-white/46">
                      {inquiry.itemType ? (
                        <span>{adminItemTypeLabels[inquiry.itemType]}</span>
                      ) : null}
                      {inquiry.productSlug ? <span>{inquiry.productSlug}</span> : null}
                      <span>{formatDateTime(inquiry.createdAt)}</span>
                    </div>
                    <div className="mt-5 flex flex-col gap-3">
                      <Link
                        href={inquiry.adminHref}
                        className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-white/10 bg-white text-sm font-medium text-slate-950 transition hover:bg-white/90"
                      >
                        Open inquiry detail
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
