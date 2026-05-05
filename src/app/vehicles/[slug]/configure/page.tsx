import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContinueBuildSection } from "@/components/ContinueBuildSection";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { VehicleConfigurator } from "@/components/configurator/VehicleConfigurator";
import { sortBuildsForVehicleContinuity } from "@/lib/account";
import {
  getSelectionIdsFromSavedBuild,
  getVehicleConfiguratorDefinition,
  resolveVehicleConfiguratorState,
} from "@/lib/configurator/vehicle-configurator";
import {
  getRecentSavedBuildsByUser,
  getSavedBuildById,
} from "@/lib/db/saved-builds";
import { getVehicleBySlug } from "@/lib/db/vehicles";
import { formatSlug } from "@/lib/formatSlug";
import { buildPageMetadata } from "@/lib/metadata";
import { buildMediaBackgroundStyle } from "@/lib/media";

interface ConfigureVehiclePageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    build?: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ConfigureVehiclePageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    return buildPageMetadata({
      title: `${formatSlug(slug)} Configure | Vehicles | Tesla Inspired`,
      description: "Configure a Tesla-inspired vehicle build and save it to your account.",
      path: `/vehicles/${slug}/configure`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `Configure ${vehicle.title} | Tesla Inspired`,
    description: `Build out a ${vehicle.title} configuration with trim, performance, color, and interior options.`,
    path: `/vehicles/${vehicle.slug}/configure`,
    image: vehicle.image,
    noIndex: true,
  });
}

export default async function ConfigureVehiclePage({
  params,
  searchParams,
}: ConfigureVehiclePageProps) {
  const { slug } = await params;
  const { build } = await searchParams;
  const [vehicle, session] = await Promise.all([
    getVehicleBySlug(slug),
    auth().catch(() => null),
  ]);

  if (!vehicle) {
    notFound();
  }

  const [loadedBuild, recentBuilds] = await Promise.all([
    session?.user?.id && build
      ? getSavedBuildById({
          buildId: build,
          userId: session.user.id,
        })
      : Promise.resolve(null),
    session?.user?.id
      ? getRecentSavedBuildsByUser(session.user.id, 5)
      : Promise.resolve([]),
  ]);
  const definition = getVehicleConfiguratorDefinition(vehicle);
  const initialSelectionIds =
    loadedBuild && loadedBuild.vehicleSlug === vehicle.slug
      ? getSelectionIdsFromSavedBuild(loadedBuild.selectedOptions)
      : resolveVehicleConfiguratorState(definition).selectionIds;
  const currentPath = loadedBuild
    ? `/vehicles/${vehicle.slug}/configure?build=${loadedBuild.id}`
    : `/vehicles/${vehicle.slug}/configure`;
  const signInHref = `/signin?callbackUrl=${encodeURIComponent(currentPath)}`;
  const continuityBuilds = sortBuildsForVehicleContinuity(
    recentBuilds.filter((savedBuild) => savedBuild.id !== loadedBuild?.id),
    vehicle.slug,
  ).slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
        <section
          className="section-shell relative overflow-hidden pt-32 pb-14 sm:pb-20"
          style={buildMediaBackgroundStyle({
            image: vehicle.image,
            overlay:
              "linear-gradient(to bottom, rgba(6, 7, 10, 0.56), rgba(6, 7, 10, 0.9))",
          })}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_30%)]" />
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-black/28 shadow-halo backdrop-blur-md">
            <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] lg:px-10 lg:py-12">
              <div className="flex flex-col justify-center">
                <Breadcrumbs
                  items={[
                    { label: "Home", href: "/" },
                    { label: "Vehicles", href: "/vehicles" },
                    { label: vehicle.title, href: `/vehicles/${vehicle.slug}` },
                    { label: "Configure" },
                  ]}
                />

                <p className="mt-4 text-xs font-medium uppercase tracking-[0.32em] text-white/52">
                  Vehicle Configurator
                </p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Configure your {vehicle.title}.
                </h1>
                <p className="mt-4 max-w-3xl text-lg text-white/84 sm:text-xl">
                  Start with a premium build foundation, tune the essentials,
                  and keep a saved version in your account when it feels right.
                </p>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                  Choose a trim, range and performance posture, exterior color,
                  and interior theme. This foundation is intentionally practical
                  now and ready for richer configuration logic later.
                </p>

                <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row">
                  <Link
                    href="/account/builds"
                    className="inline-flex min-h-[3.125rem] items-center justify-center rounded-full bg-white px-6 text-sm font-medium tracking-[0.02em] text-slate-950 shadow-[0_12px_40px_rgba(255,255,255,0.14)] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/90"
                  >
                    View Saved Builds
                  </Link>
                  <Link
                    href={`/vehicles/${vehicle.slug}`}
                    className="inline-flex min-h-[3.125rem] items-center justify-center rounded-full bg-white/10 px-6 text-sm font-medium tracking-[0.02em] text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    Back to Vehicle
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm sm:p-8">
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                  Build Flow
                </p>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Save clean snapshots as you narrow the right fit.
                </h2>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.26em] text-white/42">
                      Vehicle
                    </p>
                    <p className="mt-2 text-lg font-medium text-white">
                      {vehicle.title}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.26em] text-white/42">
                      Starting Price
                    </p>
                    <p className="mt-2 text-lg font-medium text-white">
                      {vehicle.price}
                    </p>
                  </div>
                </div>

                {loadedBuild ? (
                  <div className="mt-8 rounded-[1.4rem] border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-sm leading-6 text-emerald-100">
                    Loaded from your saved build
                    {loadedBuild.buildLabel ? `, ${loadedBuild.buildLabel}` : ""}.
                    You can adjust the selections below and save a fresh snapshot.
                  </div>
                ) : (
                  <div className="mt-8 rounded-[1.4rem] border border-white/10 bg-black/20 px-5 py-4 text-sm leading-6 text-white/64">
                    Save works for signed-in users only. If you are not signed
                    in yet, we will route you through a lightweight sign-in flow
                    before you start building a saved shortlist.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {continuityBuilds.length > 0 ? (
          <ContinueBuildSection
            eyebrow="Continue Your Build"
            title={`Resume saved ${vehicle.title} directions without resetting the configurator.`}
            description="Recent builds stay attached to the configure flow so you can reopen another snapshot, compare directions, or keep refining the latest path."
            builds={continuityBuilds}
            actionHref="/account/builds"
            actionLabel="All Saved Builds"
            compact
          />
        ) : null}

        <section className="section-shell border-t border-white/8 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <VehicleConfigurator
              definition={definition}
              initialSelectionIds={initialSelectionIds}
              initialBuildLabel={loadedBuild?.buildLabel}
              isSignedIn={Boolean(session?.user?.id)}
              loadedBuildHref={loadedBuild?.buildHref}
              signInHref={signInHref}
            />
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
