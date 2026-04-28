import { EnergyCard } from "@/components/EnergyCard";
import { FeatureCard } from "@/components/FeatureCard";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";
import { SectionGrid } from "@/components/SectionGrid";
import { energyFeatures, energyPageHeader } from "@/data/energy";
import { getAllEnergyProducts } from "@/lib/db/energy";

export const dynamic = "force-dynamic";

export default async function EnergyPage() {
  const energyProducts = await getAllEnergyProducts();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white">
        <PageHeader header={energyPageHeader} />
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
