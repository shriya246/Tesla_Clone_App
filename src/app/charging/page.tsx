import { ChargingSection } from "@/components/ChargingSection";
import { FeatureCard } from "@/components/FeatureCard";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";
import { SectionGrid } from "@/components/SectionGrid";
import {
  chargingHighlights,
  chargingNetworkSection,
  chargingPageHeader,
} from "@/data/charging";

export default function ChargingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white">
        <PageHeader header={chargingPageHeader} />
        <ChargingSection section={chargingNetworkSection} />
        <SectionGrid
          id="charging-highlights"
          title="Charging Highlights"
          description="Understand how charging fits into daily routines, long-distance travel, and the broader connected driving experience."
        >
          {chargingHighlights.map((highlight) => (
            <FeatureCard key={highlight.title} feature={highlight} />
          ))}
        </SectionGrid>
        <Footer />
      </main>
    </>
  );
}
