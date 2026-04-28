import Link from "next/link";

import {
  adminInquiryTypeLabels,
  adminItemTypeLabels,
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
    key: "userCount",
    label: "Users",
    description: "Authenticated customer and admin accounts created so far.",
  },
] as const;

export default async function AdminOverviewPage() {
  const [summary, inquiries] = await Promise.all([
    getAdminDashboardSummary(),
    getAllInquiries(),
  ]);

  const recentInquiries = inquiries.slice(0, 4);

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
                Next Steps
              </p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                Keep V0.3 operationally clean.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/68">
                Use Products for read-focused catalog QA and Inquiries for
                monitoring inbound demo, consultation, and shop questions.
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
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
