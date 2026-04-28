import type { Metadata } from "next";
import { CatalogEmptyState } from "@/components/CatalogEmptyState";
import { EnergyCard } from "@/components/EnergyCard";
import { FeatureCard } from "@/components/FeatureCard";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";
import { SectionGrid } from "@/components/SectionGrid";
import { energyFeatures, energyPageHeader } from "@/data/energy";
import { getAllEnergyProducts } from "@/lib/db/energy";
import { buildPageMetadata } from "@/lib/metadata";

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

export default async function EnergyPage() {
  const energyProducts = await getAllEnergyProducts();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white">
        <PageHeader header={energyPageHeader} />
        {energyProducts.length === 0 ? (
          <section className="section-shell py-16 lg:py-20">
            <CatalogEmptyState
              eyebrow="Energy"
              title="Energy products are not available yet."
              description="The energy catalog is currently empty. Seed the database or create records from admin to restore the public experience."
              primaryHref="/admin/products"
              primaryLabel="Open admin products"
              secondaryHref="/"
              secondaryLabel="Return home"
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
