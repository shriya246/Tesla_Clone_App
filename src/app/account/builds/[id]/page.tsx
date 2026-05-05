import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { BuildSummary } from "@/components/configurator/BuildSummary";
import { DeleteSavedBuildButton } from "@/components/configurator/DeleteSavedBuildButton";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { getVehicleBySlug } from "@/lib/db/vehicles";
import { getSavedBuildById } from "@/lib/db/saved-builds";
import { formatDateTime } from "@/lib/format-date";
import { buildPageMetadata } from "@/lib/metadata";

interface SavedBuildDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: SavedBuildDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  return buildPageMetadata({
    title: `Saved Build ${id} | Tesla Inspired`,
    description: "Review a saved Tesla-inspired vehicle build and continue configuring from your account.",
    path: `/account/builds/${id}`,
    noIndex: true,
  });
}

export default async function SavedBuildDetailPage({
  params,
}: SavedBuildDetailPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=${encodeURIComponent("/account/builds")}`);
  }

  const { id } = await params;
  const savedBuild = await getSavedBuildById({
    buildId: id,
    userId: session.user.id,
  });

  if (!savedBuild) {
    notFound();
  }

  const vehicle = await getVehicleBySlug(savedBuild.vehicleSlug);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 pt-28 text-white">
        <section className="section-shell py-16 lg:py-20">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Saved Build Detail
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {savedBuild.buildLabel ?? `${savedBuild.vehicleTitle} Build`}
              </h1>
              <p className="mt-5 text-sm leading-7 text-white/72 sm:text-base">
                Review the saved configuration, compare it against the current
                vehicle baseline, and continue configuring from the same snapshot
                whenever you want.
              </p>
              <p className="mt-4 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-white/42">
                Last updated {formatDateTime(savedBuild.updatedAt)}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={savedBuild.configureHref}
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-white/90"
              >
                Continue Configuring
              </Link>
              <Link
                href="/account/builds"
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
              >
                Back to Saved Builds
              </Link>
            </div>
          </div>
        </section>

        <section className="section-shell border-t border-white/8 py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
            <BuildSummary
              title={savedBuild.vehicleTitle}
              subtitle="This snapshot preserves the choices you made across trim, range and performance, exterior finish, and cabin direction."
              vehiclePrice={savedBuild.vehiclePrice}
              estimatedPrice={savedBuild.estimatedPrice}
              selectedOptions={savedBuild.selectedOptions}
              buildLabel={savedBuild.buildLabel}
              meta={`Created ${formatDateTime(savedBuild.createdAt)}`}
            >
              <DeleteSavedBuildButton
                buildId={savedBuild.id}
                buildTitle={savedBuild.buildLabel ?? `${savedBuild.vehicleTitle} build`}
                redirectTo="/account/builds"
              />
            </BuildSummary>

            <div className="space-y-6">
              <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                  Comparison Starter
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Compare against the current vehicle baseline.
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">
                  This keeps the saved build useful even before richer
                  side-by-side comparison tools arrive.
                </p>

                {vehicle ? (
                  <div className="mt-8 space-y-4">
                    <div className="rounded-[1.5rem] border border-white/10 bg-black/24 p-5">
                      <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/40">
                        Current Vehicle Price
                      </p>
                      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
                        {vehicle.price}
                      </p>
                    </div>

                    {vehicle.specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="rounded-[1.5rem] border border-white/10 bg-black/24 p-5"
                      >
                        <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/40">
                          {spec.label}
                        </p>
                        <p className="mt-3 text-lg font-semibold tracking-tight text-white">
                          {spec.value}
                        </p>
                      </div>
                    ))}

                    <div className="pt-2">
                      <Link
                        href={`/vehicles/${vehicle.slug}`}
                        className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
                      >
                        Open Vehicle Detail
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/24 px-5 py-4 text-sm leading-6 text-white/62">
                    The current vehicle record is unavailable right now, but this
                    saved build snapshot is still preserved in your account.
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
