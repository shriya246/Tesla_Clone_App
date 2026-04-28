import { InquiryTable } from "@/components/admin/InquiryTable";
import {
  getAllInquiries,
} from "@/lib/db/admin";

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

          <InquiryTable inquiries={inquiries} />
        </div>
      </div>
    </section>
  );
}
