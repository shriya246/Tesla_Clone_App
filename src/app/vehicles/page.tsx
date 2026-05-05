import type { Metadata } from "next";
import { CatalogEmptyState } from "@/components/CatalogEmptyState";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";
import { ProductSection } from "@/components/ProductSection";
import { CatalogToolbar } from "@/components/search/CatalogToolbar";
import { vehiclesPageHeader } from "@/data/vehicles";
import { getAllVehicles } from "@/lib/db/vehicles";
import { buildPageMetadata } from "@/lib/metadata";
import { pricedCatalogSortOptions } from "@/lib/search/constants";
import { getVehicleSearchFields } from "@/lib/search/fields";
import {
  filterAndSortCollection,
  parseSearchSort,
  sanitizeSearchQuery,
} from "@/lib/search/utils";

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

interface VehiclesPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
  }>;
}

export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
  const params = await searchParams;
  const query = sanitizeSearchQuery(params.q);
  const sort = parseSearchSort(params.sort, "featured");
  const vehicleLineup = filterAndSortCollection(
    await getAllVehicles(),
    {
      query,
      sort,
    },
    getVehicleSearchFields,
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white">
        <PageHeader header={vehiclesPageHeader} />
        <CatalogToolbar
          action="/vehicles"
          defaultSort="featured"
          description="Search the lineup by model name, capability cues, or pricing language, then sort the lineup without leaving the immersive vehicle experience."
          itemCount={vehicleLineup.length}
          placeholder="Search Model Y, long range, seating, and more"
          pluralLabel="vehicles"
          query={query}
          searchAllHref="/search?type=vehicle"
          searchAllLabel="Search all categories"
          singularLabel="vehicle"
          sort={sort}
          sortOptions={pricedCatalogSortOptions}
          suggestionType="vehicle"
          title="Refine the lineup"
        />
        <div id="vehicles-lineup">
          {vehicleLineup.length === 0 ? (
            <section className="section-shell py-16 lg:py-20">
              <CatalogEmptyState
                eyebrow="Vehicles"
                title={
                  query
                    ? "No vehicles matched this search."
                    : "The lineup is not available yet."
                }
                description={
                  query
                    ? "Try a broader query, reset the filters, or search across the full catalog for related Energy or Shop results."
                    : "Vehicle records have not been loaded into the catalog yet. You can seed the database or review the admin area when you are ready."
                }
                primaryHref={query ? "/vehicles" : "/admin/products"}
                primaryLabel={query ? "Reset vehicle search" : "Open admin products"}
                secondaryHref={query ? "/search" : "/"}
                secondaryLabel={query ? "Search all products" : "Return home"}
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
