import { requireAdminSession } from "@/lib/auth/require-admin";
import { getAllAdminProducts } from "@/lib/db/admin";
import { getAllProductRankingOverrides } from "@/lib/db/product-ranking-overrides";
import { formatDateTime } from "@/lib/format-date";
import {
  getRecommendationDebugPreview,
  getRankingConfig,
} from "@/lib/recommendations";
import { ProductRankingOverridesManager } from "@/components/admin/ProductRankingOverridesManager";
import { RecommendationConfigForm } from "@/components/admin/RecommendationConfigForm";

export const dynamic = "force-dynamic";

export default async function AdminRankingPage() {
  const session = await requireAdminSession("/admin/ranking");
  const [rankingConfig, products, overrides, previewItems] = await Promise.all([
    getRankingConfig(),
    getAllAdminProducts(),
    getAllProductRankingOverrides(),
    getRecommendationDebugPreview({
      userId: session.user.id,
      limit: 5,
    }),
  ]);
  const allProducts = [
    ...products.vehicles,
    ...products.energyProducts,
    ...products.shopProducts,
  ]
    .map((product) => ({
      itemType: product.itemType,
      slug: product.slug,
      title: product.title,
      categoryLabel: product.categoryLabel,
      href: product.href,
      engagementScore: product.engagement.weightedScore,
    }))
    .sort((left, right) => {
      if (right.engagementScore !== left.engagementScore) {
        return right.engagementScore - left.engagementScore;
      }

      return left.title.localeCompare(right.title);
    });
  const pinnedCount = overrides.filter((override) => override.pinned).length;
  const boostedCount = overrides.filter((override) => override.boostScore !== 0).length;

  return (
    <section className="section-shell py-8 pb-16 lg:py-10 lg:pb-20">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Ranking Controls
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Tune recommendation and discovery behavior without rewriting app logic.
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/68 sm:text-base">
                V0.6 Phase 3 moves recommendation and ranking rules into a shared,
                explainable configuration layer. These settings drive personalized modules,
                contextual recommendation sections, and search discovery tie-breaks.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-black/24 px-5 py-4">
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-white/42">
                Last updated
              </p>
              <p className="mt-3 text-base font-medium text-white">
                {rankingConfig.updatedAt
                  ? formatDateTime(rankingConfig.updatedAt)
                  : "Using default weights"}
              </p>
              <p className="mt-1 text-sm text-white/62">
                Shared ranking config for recommendations and search.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                Active Overrides
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {overrides.length}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/62">
                Product-level ranking overrides currently affecting discovery.
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                Pinned Products
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {pinnedCount}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/62">
                Items receiving the fixed pin bonus across search and recommendation surfaces.
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                Boosted Products
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {boostedCount}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/62">
                Items currently receiving a manual positive or negative boost score.
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-white/42">
                Preview Items
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {previewItems.length}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/62">
                Current top debug recommendations for this signed-in admin session.
              </p>
            </article>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
            <RecommendationConfigForm initialValues={rankingConfig} />
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
              <ProductRankingOverridesManager
                overrides={overrides}
                products={allProducts}
              />
            </div>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
              <div className="max-w-3xl">
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                  Explainability Preview
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                  Why products are surfacing right now.
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/62">
                  This preview uses the same internal scoring path as live recommendations.
                  If your admin account has weak personal signals, the preview naturally leans
                  on popularity, freshness, and any active manual promotions.
                </p>
              </div>

              {previewItems.length === 0 ? (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/12 bg-white/[0.03] p-5 text-sm leading-6 text-white/62">
                  No preview candidates are available yet. Add more catalog content or build up
                  engagement signals to populate the debug surface.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {previewItems.map((item) => (
                    <article
                      key={`${item.itemType}:${item.slug}`}
                      className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/72">
                              {item.eyebrow ?? item.itemType}
                            </span>
                            {item.pinned ? (
                              <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/12 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-emerald-100">
                                pinned
                              </span>
                            ) : null}
                            {item.boostScore !== 0 ? (
                              <span className="inline-flex rounded-full border border-white/10 bg-black/24 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/68">
                                boost {item.boostScore.toFixed(2)}
                              </span>
                            ) : null}
                          </div>
                          <h4 className="mt-4 text-xl font-semibold tracking-tight text-white">
                            {item.title}
                          </h4>
                          <p className="mt-3 text-sm leading-6 text-white/62">
                            {item.description}
                          </p>
                        </div>

                        <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
                          <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/42">
                            Score
                          </p>
                          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                            {item.score.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)]">
                        <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
                          <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/42">
                            Top Reasons
                          </p>
                          <div className="mt-3 space-y-2">
                            {item.reasons.map((reason) => (
                              <p key={reason} className="text-sm leading-6 text-white/68">
                                {reason}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
                          <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/42">
                            Score Breakdown
                          </p>
                          <div className="mt-3 space-y-2">
                            {item.scoreBreakdown
                              .filter((component) => Math.abs(component.score) > 0.01)
                              .slice(0, 5)
                              .map((component) => (
                                <div
                                  key={component.id}
                                  className="flex items-center justify-between gap-4 text-sm text-white/68"
                                >
                                  <span>{component.label}</span>
                                  <span className="font-medium text-white">
                                    {component.score.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </section>
  );
}
