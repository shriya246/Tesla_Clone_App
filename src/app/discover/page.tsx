import { FeatureCard } from "@/components/FeatureCard";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";
import { SectionGrid } from "@/components/SectionGrid";
import { discoverPageHeader, discoverTopics } from "@/data/discover";

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
