import Link from "next/link";

import type { AccountInquiryHistoryItem } from "@/lib/account/types";
import { formatDateTime } from "@/lib/format-date";

interface InquiryHistoryListProps {
  items: AccountInquiryHistoryItem[];
}

export function InquiryHistoryList({ items }: InquiryHistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-white/12 bg-white/[0.03] p-8 text-center shadow-halo">
        <p className="text-lg font-medium text-white">No inquiry history yet.</p>
        <p className="mt-3 text-sm leading-7 text-white/62 sm:text-base">
          Vehicle demo requests, product questions, and energy consultations
          will appear here once you send them.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex rounded-full border border-white/12 bg-black/30 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.22em] text-white/78">
              {item.typeLabel}
            </span>
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/45">
              {formatDateTime(item.createdAt)}
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            {item.title}
          </h3>
          <p className="mt-4 text-sm leading-7 text-white/68">
            {item.messagePreview}
          </p>

          {item.href ? (
            <Link
              href={item.href}
              className="mt-6 inline-flex min-h-[2.9rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
            >
              Reopen Product
            </Link>
          ) : null}
        </article>
      ))}
    </div>
  );
}
