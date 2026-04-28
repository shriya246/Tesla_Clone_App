import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FavoriteItemType } from "@prisma/client";
import { auth } from "@/auth";
import { AppButton } from "@/components/AppButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DetailHero } from "@/components/DetailHero";
import { DetailSpecs } from "@/components/DetailSpecs";
import { FavoriteToggle } from "@/components/FavoriteToggle";
import { Footer } from "@/components/Footer";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { Navbar } from "@/components/Navbar";
import { RelatedItems } from "@/components/RelatedItems";
import { isFavorited } from "@/lib/db/favorites";
import { getAllVehicles, getVehicleBySlug } from "@/lib/db/vehicles";
import { formatSlug } from "@/lib/formatSlug";

interface VehicleDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: VehicleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    return {
      title: `${formatSlug(slug)} | Vehicles | Tesla Inspired`,
    };
  }

  return {
    title: `${vehicle.title} | Vehicles | Tesla Inspired`,
    description: vehicle.subtitle,
  };
}

export default async function VehicleDetailPage({
  params,
}: VehicleDetailPageProps) {
  const { slug } = await params;
  const [vehicle, vehicleLineup, session] = await Promise.all([
    getVehicleBySlug(slug),
    getAllVehicles(),
    auth().catch(() => null),
  ]);

  if (!vehicle) {
    notFound();
  }

  const favoriteState = session?.user?.id
    ? await isFavorited({
        userId: session.user.id,
        itemType: FavoriteItemType.VEHICLE,
        itemSlug: vehicle.slug,
      })
    : false;

  const relatedVehicles = vehicleLineup
    .filter((item) => item.slug !== vehicle.slug)
    .slice(0, 3)
    .map((item) => ({
      title: item.title,
      description: item.subtitle,
      href: `/vehicles/${item.slug}`,
      image: item.image,
      eyebrow: "Vehicle",
      price: item.price,
    }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
        <DetailHero
          hero={{
            eyebrow: "Vehicle",
            title: vehicle.title,
            subtitle: vehicle.subtitle,
            description: vehicle.longDescription,
            image: vehicle.image,
            price: vehicle.price,
            primaryButton: vehicle.primaryButton,
            secondaryButton: "Back to Vehicles",
            secondaryHref: "/vehicles",
          }}
        >
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Vehicles", href: "/vehicles" },
              { label: vehicle.title },
            ]}
          />
        </DetailHero>

        <section className="section-shell border-t border-white/8 bg-slate-950 py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Overview
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                A focused product story, built around the drive.
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/72 sm:text-base">
                {vehicle.longDescription}
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Why it stands out
              </p>
              <p className="mt-4 text-lg leading-8 text-white/80">
                {vehicle.subtitle}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <AppButton>{vehicle.primaryButton}</AppButton>
                <AppButton href="/vehicles" variant="secondary">
                  Compare lineup
                </AppButton>
              </div>

              <div className="mt-6">
                <FavoriteToggle
                  isFavorited={favoriteState}
                  isSignedIn={Boolean(session?.user?.id)}
                  itemSlug={vehicle.slug}
                  itemTitle={vehicle.title}
                  itemType="VEHICLE"
                  redirectPath={`/vehicles/${vehicle.slug}`}
                />
              </div>
            </div>
          </div>
        </section>

        <DetailSpecs
          title="Performance at a glance"
          description="A quick scan of the core figures and capability cues that shape the personality of this vehicle."
          items={vehicle.specs}
        />

        <section className="section-shell border-t border-white/8 bg-slate-950 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Highlights
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Built to feel distinct in the lineup.
              </h2>
              <p className="mt-4 text-sm leading-6 text-white/72 sm:text-base">
                Each model brings its own balance of comfort, capability, and
                electric performance to the broader Tesla-inspired experience.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {vehicle.highlights.map((highlight) => (
                <article
                  key={highlight.title}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8"
                >
                  <h3 className="text-2xl font-semibold tracking-tight text-white">
                    {highlight.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/72 sm:text-base">
                    {highlight.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell border-t border-white/8 bg-slate-950 py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Demo Drive
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Request time behind the wheel.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                Share a little about what you want to experience with{" "}
                {vehicle.title}, and the team can follow up with the right
                product context, next steps, and availability.
              </p>

              <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/38">
                  What to expect
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Tailored follow-up
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      We can respond with context specific to this vehicle.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Flexible timing
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      Use the message field to mention scheduling preferences.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      No account required
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      This request works as a lightweight product inquiry flow.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <InquiryForm
              contextLabel="Vehicle"
              contextValue={vehicle.title}
              defaultMessage={`I am interested in scheduling a demo drive for ${vehicle.title}.`}
              description="Tell us how you plan to use the vehicle, what you want to compare, or what questions you want answered before the next step."
              itemType="VEHICLE"
              messageLabel="What would you like to experience?"
              messagePlaceholder={`I would like to learn more about ${vehicle.title}, range expectations, and demo availability.`}
              productSlug={vehicle.slug}
              submitLabel="Request Demo Drive"
              successMessage={`We have received your request for ${vehicle.title} and will follow up soon.`}
              successTitle="Demo request received"
              title="Request a Demo Drive"
              type="VEHICLE_DEMO_REQUEST"
            />
          </div>
        </section>

        <RelatedItems
          title="Explore more vehicles"
          description="Continue through the lineup with related models built around different priorities, from efficiency to utility."
          items={relatedVehicles}
        />

        <Footer />
      </main>
    </>
  );
}
