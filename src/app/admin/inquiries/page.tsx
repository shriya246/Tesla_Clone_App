import Link from "next/link";

import {
  adminInquiryTypeLabels,
  adminItemTypeLabels,
  getAllInquiries,
} from "@/lib/db/admin";
import { formatDateTime } from "@/lib/format-date";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await getAllInquiries();

  return (
    <section className="section-shell py-8 pb-16 lg:py-10 lg:pb-20">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Inquiries
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Submitted demo, consultation, and product requests.
              </h2>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
                Review the incoming request stream, including product context and
                message previews, without introducing a full inquiry-management
                back office yet.
              </p>
            </div>

            <div className="inline-flex w-fit rounded-full border border-white/10 bg-black/24 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white/72">
              {inquiries.length} total inquiries
            </div>
          </div>

          {inquiries.length === 0 ? (
            <div className="mt-10 rounded-[1.75rem] border border-dashed border-white/12 bg-black/24 p-8 text-center">
              <p className="text-lg font-medium text-white">
                No inquiry submissions yet.
              </p>
              <p className="mt-3 text-sm leading-6 text-white/62">
                Once customers submit demo, consultation, or product inquiry forms,
                they will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-10 space-y-4">
              {inquiries.map((inquiry) => (
                <article
                  key={inquiry.id}
                  className="rounded-[1.75rem] border border-white/8 bg-black/24 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/76">
                          {adminInquiryTypeLabels[inquiry.type]}
                        </span>
                        {inquiry.itemType ? (
                          <span className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-white/42">
                            {adminItemTypeLabels[inquiry.itemType]}
                          </span>
                        ) : null}
                        {inquiry.productSlug ? (
                          <span className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-white/42">
                            {inquiry.productSlug}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                        {inquiry.name}
                      </h3>

                      <div className="mt-3 flex flex-col gap-2 text-sm text-white/64 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                        <span>{inquiry.email}</span>
                        {inquiry.phone ? <span>{inquiry.phone}</span> : null}
                        {inquiry.userEmail ? (
                          <span>Signed in as {inquiry.userEmail}</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="shrink-0 text-left lg:text-right">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/38">
                        {formatDateTime(inquiry.createdAt)}
                      </p>
                      {inquiry.href ? (
                        <Link
                          href={inquiry.href}
                          className="mt-4 inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-4 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
                        >
                          Open public page
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-white/72 sm:text-base">
                    {inquiry.messagePreview}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
