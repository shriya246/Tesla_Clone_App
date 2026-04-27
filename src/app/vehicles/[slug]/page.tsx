import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppButton } from "@/components/AppButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DetailHero } from "@/components/DetailHero";
import { DetailSpecs } from "@/components/DetailSpecs";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { RelatedItems } from "@/components/RelatedItems";
import { vehicleLineup } from "@/data/vehicles";
import { formatSlug } from "@/lib/formatSlug";
import { getVehicleBySlug } from "@/lib/getVehicleBySlug";

interface VehicleDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return vehicleLineup.map((vehicle) => ({
    slug: vehicle.slug,
  }));
}

export async function generateMetadata({
  params,
}: VehicleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = getVehicleBySlug(slug);

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
  const vehicle = getVehicleBySlug(slug);

  if (!vehicle) {
    notFound();
  }

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
