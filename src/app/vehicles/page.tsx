import type { Metadata } from "next";
import { CatalogEmptyState } from "@/components/CatalogEmptyState";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";
import { ProductSection } from "@/components/ProductSection";
import { vehiclesPageHeader } from "@/data/vehicles";
import { getAllVehicles } from "@/lib/db/vehicles";
import { buildPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPageMetadata({
  title: "Vehicles | Tesla Inspired",
  description:
    "Explore the Tesla-inspired vehicle lineup with model-level detail pages focused on range, performance, and ownership intent.",
  path: "/vehicles",
  keywords: [
    "Tesla vehicles",
    "electric vehicle lineup",
    "Model S",
    "Model 3",
    "Model X",
    "Model Y",
    "Cybertruck",
  ],
});

export default async function VehiclesPage() {
  const vehicleLineup = await getAllVehicles();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white">
        <PageHeader header={vehiclesPageHeader} />
        <div id="vehicles-lineup">
          {vehicleLineup.length === 0 ? (
            <section className="section-shell py-16 lg:py-20">
              <CatalogEmptyState
                eyebrow="Vehicles"
                title="The lineup is not available yet."
                description="Vehicle records have not been loaded into the catalog yet. You can seed the database or review the admin area when you are ready."
                primaryHref="/admin/products"
                primaryLabel="Open admin products"
                secondaryHref="/"
                secondaryLabel="Return home"
              />
            </section>
          ) : (
            vehicleLineup.map((vehicle) => (
              <ProductSection
                key={vehicle.slug}
                section={vehicle}
                detailHref={`/vehicles/${vehicle.slug}`}
                detailLabel="Explore vehicle"
                secondaryButtonHref={`/vehicles/${vehicle.slug}`}
              />
            ))
          )}
        </div>
        <Footer />
      </main>
    </>
  );
}
