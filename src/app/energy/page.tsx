import type { Metadata } from "next";
import { CatalogEmptyState } from "@/components/CatalogEmptyState";
import { EnergyCard } from "@/components/EnergyCard";
import { FeatureCard } from "@/components/FeatureCard";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";
import { CatalogToolbar } from "@/components/search/CatalogToolbar";
import { SectionGrid } from "@/components/SectionGrid";
import { energyFeatures, energyPageHeader } from "@/data/energy";
import { getAllEnergyProducts } from "@/lib/db/energy";
import { buildPageMetadata } from "@/lib/metadata";
import { catalogSortOptions } from "@/lib/search/constants";
import { getEnergyProductSearchFields } from "@/lib/search/fields";
import {
  filterAndSortCollection,
  parseSearchSort,
  sanitizeSearchQuery,
} from "@/lib/search/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPageMetadata({
  title: "Energy | Tesla Inspired",
  description:
    "Browse Tesla-inspired solar and storage products with dedicated pages for home energy planning, resilience, and product consultation.",
  path: "/energy",
  keywords: [
    "home energy",
    "solar panels",
    "battery storage",
    "Powerwall",
    "energy consultation",
  ],
});

interface EnergyPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
  }>;
}

export default async function EnergyPage({ searchParams }: EnergyPageProps) {
  const params = await searchParams;
  const query = sanitizeSearchQuery(params.q);
  const sort = parseSearchSort(params.sort, "featured");
  const energyProducts = filterAndSortCollection(
    await getAllEnergyProducts(),
    {
      query,
      sort,
    },
    getEnergyProductSearchFields,
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white">
        <PageHeader header={energyPageHeader} />
        <CatalogToolbar
          action="/energy"
          defaultSort="featured"
          description="Search solar and storage products by product name, system fit, or home-energy language, then sort the catalog with minimal friction."
          itemCount={energyProducts.length}
          placeholder="Search Powerwall, solar, resilience, and more"
          pluralLabel="energy products"
          query={query}
          searchAllHref="/search?type=energy"
          searchAllLabel="Search all categories"
          singularLabel="energy product"
          sort={sort}
          sortOptions={catalogSortOptions}
          suggestionType="energy"
          title="Refine energy discovery"
        />
        {energyProducts.length === 0 ? (
          <section className="section-shell py-16 lg:py-20">
            <CatalogEmptyState
              eyebrow="Energy"
              title={
                query
                  ? "No energy products matched this search."
                  : "Energy products are not available yet."
              }
              description={
                query
                  ? "Try a broader term, reset the filters, or search the full catalog for matching vehicles or shop products."
                  : "The energy catalog is currently empty. Seed the database or create records from admin to restore the public experience."
              }
              primaryHref={query ? "/energy" : "/admin/products"}
              primaryLabel={query ? "Reset energy search" : "Open admin products"}
              secondaryHref={query ? "/search" : "/"}
              secondaryLabel={query ? "Search all products" : "Return home"}
            />
          </section>
        ) : (
          <SectionGrid
            id="energy-products"
            title="Energy Products"
            description="Build a cleaner, more resilient home energy system with solar generation and battery storage designed to work together."
          >
            {energyProducts.map((product) => (
              <EnergyCard
                key={product.slug}
                section={product}
                detailHref={`/energy/${product.slug}`}
              />
            ))}
          </SectionGrid>
        )}
        <SectionGrid
          id="energy-features"
          title="Why Home Energy Matters"
          description="Explore the product benefits, system behavior, and energy ecosystem advantages that shape the Tesla-inspired home stack."
        >
          {energyFeatures.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </SectionGrid>
        <Footer />
      </main>
    </>
  );
}
