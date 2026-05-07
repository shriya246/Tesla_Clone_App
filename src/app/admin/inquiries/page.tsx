import { InquiryTable } from "@/components/admin/InquiryTable";
import { InsightBarList } from "@/components/admin/InsightBarList";
import { InsightSectionCard } from "@/components/admin/InsightSectionCard";
import {
  getAllInquiries,
  getInquiryWorkflowSummary,
} from "@/lib/db/admin";
import { getInquiryTrends } from "@/lib/admin-insights";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const [inquiries, inquiryTrends, workflowSummary] = await Promise.all([
    getAllInquiries(),
    getInquiryTrends(),
    getInquiryWorkflowSummary(),
  ]);
  const topInquiryType = inquiryTrends.byType[0];

  return (
    <section className="section-shell py-8 pb-16 lg:py-10 lg:pb-20">
      <div className="mx-auto max-w-7xl space-y-6">
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

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                Total
              </p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
                {inquiryTrends.totalCount}
              </p>
              <p className="mt-4 text-sm leading-6 text-white/62">
                All saved demo, consultation, and product inquiry records.
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                Last 30 Days
              </p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
                {inquiryTrends.recent30DayCount}
              </p>
              <p className="mt-4 text-sm leading-6 text-white/62">
                A practical recent-volume snapshot without building a larger reporting stack.
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                Leading Type
              </p>
              <p className="mt-4 text-2xl font-semibold tracking-tight text-white">
                {topInquiryType?.label ?? "No data yet"}
              </p>
              <p className="mt-4 text-sm leading-6 text-white/62">
                {topInquiryType
                  ? `${topInquiryType.count} inquiries currently lead the mix.`
                  : "The inquiry mix will show up here once requests are submitted."}
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                Prioritized
              </p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
                {workflowSummary.prioritizedCount}
              </p>
              <p className="mt-4 text-sm leading-6 text-white/62">
                Requests auto-marked for faster follow-up by the workflow rules.
              </p>
            </article>
          </div>

          <InquiryTable inquiries={inquiries} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <InsightSectionCard
            eyebrow="Inquiry Mix"
            title="Inquiry Volume by Type"
            description="A focused count by form intent so admins can see which workflows are driving the most follow-up."
          >
            <InsightBarList
              items={inquiryTrends.byType}
              emptyDescription="Inquiry type breakdowns will appear once requests come in."
              emptyTitle="No inquiry trend data yet."
            />
          </InsightSectionCard>

          <InsightSectionCard
            eyebrow="Product Context"
            title="Most Referenced Product Slugs"
            description="The product routes showing up most often in inquiry submissions."
          >
            <InsightBarList
              items={inquiryTrends.topProductSlugs}
              emptyDescription="Product-linked inquiry trends will appear once visitors submit item-specific requests."
              emptyTitle="No product-linked inquiries yet."
            />
          </InsightSectionCard>
        </div>
      </div>
    </section>
  );
}
