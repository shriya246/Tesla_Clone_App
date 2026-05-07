import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CatalogEmptyState } from "@/components/CatalogEmptyState";
import { ContinueBuildSection } from "@/components/ContinueBuildSection";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { RecommendationSection } from "@/components/RecommendationSection";
import { formatDateTime } from "@/lib/format-date";
import {
  getRecentSavedBuildsByUser,
  getSavedBuildsByUser,
} from "@/lib/db/saved-builds";
import {
  getFeatureFlagActorFromSession,
  getFeatureFlags,
} from "@/lib/flags";
import { buildPageMetadata } from "@/lib/metadata";
import { buildMediaBackgroundStyle } from "@/lib/media";
import { getRecommendedItems } from "@/lib/recommendations";
import { buildRecommendationKey } from "@/lib/recommendations/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPageMetadata({
  title: "Saved Builds | Tesla Inspired",
  description:
    "Review saved vehicle configurations, revisit your selections, and continue refining builds from your account.",
  path: "/account/builds",
  noIndex: true,
});

export default async function AccountBuildsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=%2Faccount%2Fbuilds");
  }

  const flags = getFeatureFlags({
    actor: getFeatureFlagActorFromSession(session),
    path: "/account/builds",
  });
  const [savedBuilds, recentBuilds] = await Promise.all([
    getSavedBuildsByUser(session.user.id),
    getRecentSavedBuildsByUser(session.user.id, 3),
  ]);
  const inspiredBySavedBuilds =
    flags.savedBuildRecommendations.enabled && savedBuilds.length
    ? await getRecommendedItems({
        userId: session.user.id,
        seeds: savedBuilds.slice(0, 3).map((build) => ({
          itemType: "VEHICLE",
          slug: build.vehicleSlug,
          weight: 5,
          extraTokens: Object.values(build.selectedOptions).flatMap((option) => [
            option.optionLabel,
            option.description,
            option.badge,
          ]),
        })),
        preferredItemTypes: ["VEHICLE"],
        excludeItemKeys: savedBuilds.map((build) =>
          buildRecommendationKey("VEHICLE", build.vehicleSlug),
        ),
        limit: 3,
      })
    : [];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 pt-28 text-white">
        <section className="section-shell py-16 lg:py-20">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Saved Builds
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your vehicle configuration snapshots.
              </h1>
              <p className="mt-5 text-sm leading-7 text-white/72 sm:text-base">
                Revisit saved builds, open a detailed build view, or continue
                configuring from any snapshot when you are ready to refine the
                next step.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/vehicles"
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
              >
                Browse Vehicles
              </Link>
              <Link
                href="/account"
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-black/24 px-5 text-sm font-medium text-white/72 transition hover:border-white/16 hover:bg-white/[0.05] hover:text-white"
              >
                Back to Account
              </Link>
            </div>
          </div>
        </section>

        {recentBuilds.length > 0 ? (
          <ContinueBuildSection
            eyebrow="Continue Your Build"
            title="Pick up your latest configuration snapshot."
            description="This dedicated builds view now keeps your freshest saved configurations at the top so resuming a vehicle decision takes one clean step."
            builds={recentBuilds}
            actionHref="/vehicles"
            actionLabel="Start Another Build"
            compact
          />
        ) : null}

        {inspiredBySavedBuilds.length > 0 ? (
          <RecommendationSection
            section={{
              id: "inspired-by-saved-builds",
              eyebrow: "Builds",
              title: "Inspired by Your Saved Builds",
              description:
                "These recommendations stay close to the trims, range priorities, and vehicle shapes already showing up in your saved configurations.",
              items: inspiredBySavedBuilds,
            }}
          />
        ) : null}

        <section className="section-shell border-t border-white/8 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            {savedBuilds.length === 0 ? (
              <CatalogEmptyState
                eyebrow="Saved Builds"
                title="No saved builds yet."
                description="Open any vehicle configurator, choose a few starter options, and save the build to return here later."
                primaryHref="/vehicles"
                primaryLabel="Start a vehicle build"
                secondaryHref="/account"
                secondaryLabel="Return to account"
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {savedBuilds.map((build) => (
                  <article
                    key={build.id}
                    className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-halo backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.05]"
                  >
                    <div
                      className="relative h-64 overflow-hidden"
                      style={buildMediaBackgroundStyle({
                        image: build.vehicleImage,
                        overlay:
                          "linear-gradient(to bottom, rgba(12, 15, 21, 0.14), rgba(12, 15, 21, 0.62))",
                        backgroundColor: "#0c0f15",
                      })}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_32%)] transition duration-500 group-hover:opacity-85" />
                      <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-4">
                        <span className="inline-flex rounded-full border border-white/12 bg-black/30 px-4 py-1 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/78 backdrop-blur-sm">
                          {build.buildLabel ?? "Saved Build"}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-[0.24em] text-white/65">
                          {build.estimatedPrice}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8">
                      <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/42">
                        Updated {formatDateTime(build.updatedAt)}
                      </p>
                      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                        {build.vehicleTitle}
                      </h2>

                      <div className="mt-5 space-y-3">
                        {Object.values(build.selectedOptions).map((option) => (
                          <div
                            key={option.key}
                            className="rounded-[1.2rem] border border-white/8 bg-black/24 px-4 py-3"
                          >
                            <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/40">
                              {option.label}
                            </p>
                            <p className="mt-2 text-sm font-medium text-white">
                              {option.optionLabel}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Link
                          href={build.buildHref}
                          className="inline-flex min-h-[3rem] flex-1 items-center justify-center rounded-full border border-white/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-white/90"
                        >
                          View Build
                        </Link>
                        <Link
                          href={build.configureHref}
                          className="inline-flex min-h-[3rem] flex-1 items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
                        >
                          Continue Configuring
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
