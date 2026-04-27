import { ChargingSection } from "@/components/ChargingSection";
import { EnergyCard } from "@/components/EnergyCard";
import { FeatureCard } from "@/components/FeatureCard";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { OfferCard } from "@/components/OfferCard";
import { ProductSection } from "@/components/ProductSection";
import { SectionGrid } from "@/components/SectionGrid";
import {
  chargingSection,
  energySections,
  featureSections,
  heroSection,
  offerSections,
  productSections,
} from "@/data/homeSections";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="top" className="overflow-x-hidden bg-slate-950 text-white">
        <HeroSection section={heroSection} />
        <div id="vehicles">
          {productSections.map((section) => (
            <ProductSection key={section.title} section={section} />
          ))}
        </div>
        <SectionGrid
          title="Exclusive Offers"
          description="Flexible ways to step into the Tesla ecosystem with premium incentives and tailored ownership advantages."
        >
          {offerSections.map((offer) => (
            <OfferCard key={offer.title} offer={offer} />
          ))}
        </SectionGrid>
        <SectionGrid
          id="discover"
          title="Designed Around Confidence"
          description="A focused look at the standard technology and safety-first engineering that shape the Tesla driving experience."
        >
          {featureSections.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </SectionGrid>
        <ChargingSection section={chargingSection} />
        <SectionGrid
          id="energy"
          title="Energy Independence, Designed for Home"
          description="Store power, generate clean energy, and build a more resilient ecosystem with Tesla energy products."
        >
          {energySections.map((section) => (
            <EnergyCard key={section.title} section={section} />
          ))}
        </SectionGrid>
        <Footer />
      </main>
    </>
  );
}
