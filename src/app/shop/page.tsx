import { FeatureCard } from "@/components/FeatureCard";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";
import { SectionGrid } from "@/components/SectionGrid";
import { ShopCard } from "@/components/ShopCard";
import { shopFeatures, shopPageHeader, shopProducts } from "@/data/shop";

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white">
        <PageHeader header={shopPageHeader} />
        <SectionGrid
          id="shop-products"
          title="Shop Products"
          description="Curated accessories, charging essentials, and travel-ready gear extend the Tesla-inspired experience beyond the vehicle."
        >
          {shopProducts.map((product) => (
            <ShopCard
              key={product.slug}
              product={product}
              detailHref={`/shop/${product.slug}`}
            />
          ))}
        </SectionGrid>
        <SectionGrid
          id="shop-features"
          title="Shop Features"
          description="Go beyond the product grid with feature-led highlights focused on utility, charging readiness, and lifestyle fit."
        >
          {shopFeatures.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </SectionGrid>
        <Footer />
      </main>
    </>
  );
}
