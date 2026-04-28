import Link from "next/link";

import {
  adminInquiryTypeLabels,
  adminItemTypeLabels,
} from "@/lib/db/admin";
import { formatDateTime } from "@/lib/format-date";
import type { AdminInquiryDetailItem } from "@/types";

interface InquiryDetailCardProps {
  inquiry: AdminInquiryDetailItem;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/8 bg-black/24 p-4">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/40">
        {label}
      </p>
      <p className="mt-3 break-words text-sm leading-6 text-white/78">
        {value && value.trim().length > 0 ? value : "Not provided"}
      </p>
    </div>
  );
}

export function InquiryDetailCard({ inquiry }: InquiryDetailCardProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 border-b border-white/8 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
              Inquiry Detail
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {inquiry.name}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
              Review the full request payload, user contact context, and related
              product routing from one focused admin view.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/inquiries"
              className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-black/24 px-5 text-sm font-medium text-white/72 transition hover:border-white/18 hover:text-white"
            >
              Back to inquiries
            </Link>
            {inquiry.href ? (
              <Link
                href={inquiry.href}
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
              >
                Open public page
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/78">
            {adminInquiryTypeLabels[inquiry.type]}
          </span>
          {inquiry.itemType ? (
            <span className="inline-flex rounded-full border border-white/10 bg-black/24 px-4 py-1 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/62">
              {adminItemTypeLabels[inquiry.itemType]}
            </span>
          ) : null}
          <span className="inline-flex rounded-full border border-white/10 bg-black/24 px-4 py-1 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/62">
            {formatDateTime(inquiry.createdAt)}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
            Full Message
          </p>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            Customer context and request details.
          </h3>
          <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-white/78 sm:text-base">
              {inquiry.message}
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
            Request Metadata
          </p>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            Operational details for follow-up.
          </h3>
          <div className="mt-6 grid gap-4">
            <DetailRow label="Inquiry ID" value={inquiry.id} />
            <DetailRow label="Email" value={inquiry.email} />
            <DetailRow label="Phone" value={inquiry.phone} />
            <DetailRow label="Product Slug" value={inquiry.productSlug} />
            <DetailRow label="Signed-In User" value={inquiry.userEmail ?? inquiry.userName} />
          </div>
        </section>
      </div>
    </div>
  );
}
