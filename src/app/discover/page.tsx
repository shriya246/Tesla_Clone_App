import type { Metadata } from "next";
import { FeatureCard } from "@/components/FeatureCard";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";
import { SectionGrid } from "@/components/SectionGrid";
import { discoverPageHeader, discoverTopics } from "@/data/discover";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Discover | Tesla Inspired",
  description:
    "Explore editorial-style Tesla-inspired topics covering travel, technology, energy, and lifestyle across the product ecosystem.",
  path: "/discover",
  keywords: [
    "Tesla inspired discover",
    "EV lifestyle",
    "energy stories",
    "technology features",
  ],
});

export default function DiscoverPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white">
        <PageHeader header={discoverPageHeader} />
        <SectionGrid
          id="discover-topics"
          title="Discover Topics"
          description="Editorial-style entries explore design, ownership, safety, charging, and lifestyle through a more immersive browsing experience."
        >
          {discoverTopics.map((topic) => (
            <FeatureCard key={topic.title} feature={topic} />
          ))}
        </SectionGrid>
        <Footer />
      </main>
    </>
  );
}
