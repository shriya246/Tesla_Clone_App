import { InsightBarList } from "@/components/admin/InsightBarList";
import { InsightSectionCard } from "@/components/admin/InsightSectionCard";
import { ProductInsightsTable } from "@/components/admin/ProductInsightsTable";
import {
  getInquiryTrends,
  getProductPopularity,
  getSearchTrends,
} from "@/lib/admin-insights";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { getAdminDashboardSummary } from "@/lib/db/admin";
import {
  getFeatureFlagActorFromSession,
  getFeatureFlags,
} from "@/lib/flags";
import { formatDateTime } from "@/lib/format-date";

export const dynamic = "force-dynamic";

export default async function AdminInsightsPage() {
  const session = await requireAdminSession("/admin/insights");
  const flags = getFeatureFlags({
    actor: getFeatureFlagActorFromSession(session),
    path: "/admin/insights",
  });
  const showAdvancedAdminInsights = flags.advancedAdminInsights.enabled;
  const [summary, productPopularity, inquiryTrends, searchTrends] =
    await Promise.all([
      getAdminDashboardSummary(),
      getProductPopularity(),
      getInquiryTrends(),
      showAdvancedAdminInsights ? getSearchTrends() : Promise.resolve(null),
    ]);

  const summaryCards = [
    {
      label: "Tracked Views",
      value: productPopularity.totalTrackedViews,
      description:
        "Signed-in detail-page views currently stored through the recent-view signal model.",
    },
    {
      label: "Favorites",
      value: productPopularity.totalFavorites,
      description: "Saved-item signals tied to products across the full catalog.",
    },
    {
      label: "Saved Builds",
      value: productPopularity.totalSavedBuilds,
      description: "Vehicle build saves that signal stronger buying intent.",
    },
    {
      label: "Product Inquiries",
      value: productPopularity.totalProductInquiries,
      description:
        "Inquiry records attached to a specific vehicle, energy item, or shop product.",
    },
    {
      label: "Search Events",
      value: summary.searchEventCount,
      description: "Tracked search submissions that help surface discovery trends.",
    },
    {
      label: "Active Products",
      value: productPopularity.activeProducts,
      description:
        "Products with at least one tracked view, favorite, build, or inquiry signal.",
    },
  ];

  return (
    <section className="section-shell py-8 pb-16 lg:py-10 lg:pb-20">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
            Insights
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Product popularity and discovery trends, kept operationally useful.
          </h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
            This view keeps the analytics surface focused on the signals that
            already exist in the app: views, favorites, saved builds, inquiries,
            and search behavior. It is designed to help admins prioritize product
            decisions without turning the MVP into a BI suite.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => (
              <article
                key={card.label}
                className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5"
              >
                <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                  {card.label}
                </p>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
                  {card.value}
                </p>
                <p className="mt-4 text-sm leading-6 text-white/62">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <InsightSectionCard
            eyebrow="Views"
            title="Most Viewed Vehicles"
            description="The strongest signed-in vehicle view signals right now."
          >
            <InsightBarList
              items={productPopularity.topViewedVehicles.map((item) => ({
                key: item.id,
                label: item.title,
                count: item.engagement.views,
                href: item.adminHref,
                secondaryLabel: `${item.engagement.savedBuilds} builds | ${item.engagement.favorites} favorites`,
              }))}
              emptyDescription="Vehicle view trends will appear here once signed-in browsing activity builds up."
              emptyTitle="No tracked vehicle views yet."
            />
          </InsightSectionCard>

          <InsightSectionCard
            eyebrow="Views"
            title="Most Viewed Products Overall"
            description="A cross-category view of the products drawing the most repeat attention."
          >
            <InsightBarList
              items={productPopularity.topViewedProducts.map((item) => ({
                key: item.id,
                label: item.title,
                count: item.engagement.views,
                href: item.adminHref,
                secondaryLabel: `${item.categoryLabel} | score ${item.engagement.weightedScore}`,
              }))}
              emptyDescription="Once signed-in customers start revisiting products, the leading items will surface here."
              emptyTitle="No tracked product views yet."
            />
          </InsightSectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <InsightSectionCard
            eyebrow="Favorites"
            title="Most Favorited Items"
            description="Products that users deliberately saved into their account shortlist."
          >
            <InsightBarList
              items={productPopularity.mostFavoritedItems.map((item) => ({
                key: item.id,
                label: item.title,
                count: item.engagement.favorites,
                href: item.adminHref,
                secondaryLabel: `${item.categoryLabel} | ${item.engagement.views} views`,
              }))}
              emptyDescription="Favorite trends will show up as soon as customers start saving products."
              emptyTitle="No favorites have been tracked yet."
            />
          </InsightSectionCard>

          <InsightSectionCard
            eyebrow="Builds"
            title="Most Saved Build Models"
            description="Vehicle models that are showing the strongest configurator-save intent."
          >
            <InsightBarList
              items={productPopularity.mostSavedBuildVehicles.map((item) => ({
                key: item.id,
                label: item.title,
                count: item.engagement.savedBuilds,
                href: item.adminHref,
                secondaryLabel: `${item.engagement.views} views | ${item.engagement.inquiries} inquiries`,
              }))}
              emptyDescription="Saved-build rankings will appear once customers begin saving vehicle configurations."
              emptyTitle="No saved build trends yet."
            />
          </InsightSectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <InsightSectionCard
            eyebrow="Categories"
            title="Top Categories Users Engage With"
            description="A practical cross-category snapshot using views, favorites, builds, and inquiries."
          >
            <InsightBarList
              items={productPopularity.topCategories.map((item) => ({
                key: item.itemType,
                label: item.label,
                count: item.weightedScore,
                secondaryLabel: `${item.views} views | ${item.favorites} favorites | ${item.savedBuilds} builds | ${item.inquiries} inquiries`,
              }))}
              emptyDescription="Category engagement will show up here once product interactions accumulate."
              emptyTitle="No category engagement signals yet."
            />
          </InsightSectionCard>

          {showAdvancedAdminInsights && searchTrends ? (
            <InsightSectionCard
              eyebrow="Search"
              title="Top Search Queries"
              description="Search phrases from the last 30 days, along with result context and zero-result pressure."
            >
              {searchTrends.topQueries.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-white/12 bg-black/24 p-6 text-center">
                  <p className="text-lg font-medium text-white">
                    No search trends have been recorded yet.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/62">
                    Search events are now tracked when users submit real catalog
                    queries.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchTrends.topQueries.map((query) => (
                    <article
                      key={query.normalizedQuery}
                      className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {query.label}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/42">
                            {query.scopeLabel}
                            {query.topResultLabel
                              ? ` | top results: ${query.topResultLabel}`
                              : ""}
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-white">
                          {query.count}
                        </p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em] text-white/46">
                        <span>avg results {query.averageResultCount}</span>
                        <span>zero results {query.zeroResultCount}</span>
                        <span>last {formatDateTime(query.lastSearchedAt)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </InsightSectionCard>
          ) : (
            <InsightSectionCard
              eyebrow="Rollout"
              title="Advanced insight modules are rolling out safely."
              description="Search-trend and daily-volume panels are limited to development, preview mode, and selected admin accounts while this foundation settles."
            >
              <div className="rounded-[1.75rem] border border-dashed border-white/12 bg-black/24 p-6">
                <p className="text-lg font-medium text-white">
                  Core product-popularity reporting remains available.
                </p>
                <p className="mt-3 text-sm leading-6 text-white/62">
                  Flip preview mode or add an admin to the beta allowlist when
                  you want to expand access to the deeper search and activity
                  modules.
                </p>
              </div>
            </InsightSectionCard>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <InsightSectionCard
            eyebrow="Inquiry Trends"
            title="Inquiry Volume by Type"
            description={`All-time inquiry volume with ${inquiryTrends.recent30DayCount} inquiries in the last 30 days.`}
          >
            <InsightBarList
              items={inquiryTrends.byType}
              emptyDescription="Submitted public forms will surface here once inbound requests begin to accumulate."
              emptyTitle="No inquiry trends yet."
            />
          </InsightSectionCard>

          {showAdvancedAdminInsights && searchTrends ? (
            <InsightSectionCard
              eyebrow="Discovery"
              title="Search Scope Mix"
              description={`${searchTrends.recent30DayCount} tracked search events in the last 30 days, with ${searchTrends.zeroResultCount} zero-result searches.`}
            >
              <InsightBarList
                items={searchTrends.byScope.map((item) => ({
                  key: item.scope,
                  label: item.label,
                  count: item.count,
                  secondaryLabel: `avg results ${item.averageResultCount}`,
                }))}
                emptyDescription="Once users search the catalog, scope trends will appear here."
                emptyTitle="No search scope trends yet."
              />
            </InsightSectionCard>
          ) : (
            <InsightSectionCard
              eyebrow="Rollout"
              title="Search activity modules are currently limited."
              description="The advanced search mix and daily activity cards stay behind a controlled rollout for now."
            >
              <div className="rounded-[1.75rem] border border-dashed border-white/12 bg-black/24 p-6">
                <p className="text-lg font-medium text-white">
                  Product-popularity and inquiry reporting remain stable for all
                  admins.
                </p>
                <p className="mt-3 text-sm leading-6 text-white/62">
                  Enable preview mode or beta-allowlisted admins to expand into
                  the deeper discovery-monitoring panels.
                </p>
              </div>
            </InsightSectionCard>
          )}
        </div>

        {showAdvancedAdminInsights && searchTrends ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <InsightSectionCard
              eyebrow="Daily Volume"
              title="Recent Inquiry Activity"
              description="A simple rolling 14-day view of inquiry volume."
            >
              <InsightBarList
                items={inquiryTrends.recentDailyVolume.map((point) => ({
                  key: point.label,
                  label: point.label,
                  count: point.count,
                }))}
                emptyDescription="Daily inquiry bars will populate automatically once inquiries exist."
                emptyTitle="No recent inquiry activity yet."
              />
            </InsightSectionCard>

            <InsightSectionCard
              eyebrow="Daily Volume"
              title="Recent Search Activity"
              description="A simple rolling 14-day view of catalog search submissions."
            >
              <InsightBarList
                items={searchTrends.recentDailyVolume.map((point) => ({
                  key: point.label,
                  label: point.label,
                  count: point.count,
                }))}
                emptyDescription="Daily search bars will populate automatically once users submit searches."
                emptyTitle="No recent search activity yet."
              />
            </InsightSectionCard>
          </div>
        ) : null}

        <InsightSectionCard
          eyebrow="Products"
          title="Product Engagement Table"
          description="The most engaged products right now, sorted by a practical weighted score that values favorites, saved builds, and inquiries more heavily than single views."
        >
          <ProductInsightsTable
            items={productPopularity.productEngagementTable.slice(0, 12)}
          />
        </InsightSectionCard>
      </div>
    </section>
  );
}
