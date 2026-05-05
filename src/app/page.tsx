import type { Metadata } from "next";
import { ChargingSection } from "@/components/ChargingSection";
import { ContinueBuildSection } from "@/components/ContinueBuildSection";
import { ContinuityStrip } from "@/components/ContinuityStrip";
import { EnergyCard } from "@/components/EnergyCard";
import { FeatureCard } from "@/components/FeatureCard";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { OfferCard } from "@/components/OfferCard";
import { ProductSection } from "@/components/ProductSection";
import { RecommendationSection } from "@/components/RecommendationSection";
import { SectionGrid } from "@/components/SectionGrid";
import { auth } from "@/auth";
import {
  chargingSection,
  energySections,
  featureSections,
  heroSection,
  offerSections,
  productSections,
} from "@/data/homeSections";
import { getRecentSavedBuildsByUser } from "@/lib/db/saved-builds";
import { buildPageMetadata, SITE_TITLE } from "@/lib/metadata";
import {
  getPersonalizedHomepageData,
  getRecentlyViewed,
} from "@/lib/recommendations";

export const metadata: Metadata = buildPageMetadata({
  title: SITE_TITLE,
  description:
    "Browse a Tesla-inspired digital storefront spanning vehicles, charging, home energy, accessories, and guided inquiry flows.",
  path: "/",
  keywords: [
    "Tesla inspired app",
    "EV storefront",
    "vehicle lineup",
    "home energy",
    "charging network",
  ],
});

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth().catch(() => null);
  const userId = session?.user?.id;
  const [personalizedSections, recentlyViewedItems, recentBuilds] = userId
    ? await Promise.all([
        getPersonalizedHomepageData(userId),
        getRecentlyViewed(userId, 4),
        getRecentSavedBuildsByUser(userId, 3),
      ])
    : [[], [], []];

  return (
    <>
      <Navbar />
      <main id="top" className="overflow-x-hidden bg-slate-950 text-white">
        <HeroSection section={heroSection} />
        {recentBuilds.length > 0 ? (
          <ContinueBuildSection
            eyebrow="Continue Your Build"
            title="Resume the build direction you already started."
            description="Recent saved builds now stay close on the homepage so you can move straight back into configuration without hunting through your account first."
            builds={recentBuilds}
            actionHref="/account/builds"
            actionLabel="Open Saved Builds"
            compact
          />
        ) : null}
        {recentlyViewedItems.length > 0 ? (
          <ContinuityStrip
            eyebrow="Recently Viewed"
            title="Keep the catalog thread intact"
            description="Your recent product views stay one click away so browsing across Vehicles, Energy, and Shop feels continuous instead of fragmented."
            items={recentlyViewedItems}
            actionHref="/account"
            actionLabel="Open Account"
            compact
          />
        ) : null}
        {personalizedSections.map((section) => (
          <RecommendationSection key={section.id} section={section} />
        ))}
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
