import type { Metadata } from "next";
import { CatalogEmptyState } from "@/components/CatalogEmptyState";
import { FeatureCard } from "@/components/FeatureCard";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";
import { SectionGrid } from "@/components/SectionGrid";
import { ShopCard } from "@/components/ShopCard";
import { shopFeatures, shopPageHeader } from "@/data/shop";
import { getAllShopProducts } from "@/lib/db/shop";
import { buildPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPageMetadata({
  title: "Shop | Tesla Inspired",
  description:
    "Browse Tesla-inspired accessories, charging essentials, and lifestyle products with product-specific inquiry support.",
  path: "/shop",
  keywords: [
    "Tesla shop",
    "charging accessories",
    "EV accessories",
    "Wall Connector",
    "lifestyle gear",
  ],
});

export default async function ShopPage() {
  const shopProducts = await getAllShopProducts();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white">
        <PageHeader header={shopPageHeader} />
        {shopProducts.length === 0 ? (
          <section className="section-shell py-16 lg:py-20">
            <CatalogEmptyState
              eyebrow="Shop"
              title="Shop products are not available yet."
              description="The shop catalog is empty right now. Add or seed products to restore the full public shopping surface."
              primaryHref="/admin/products"
              primaryLabel="Open admin products"
              secondaryHref="/"
              secondaryLabel="Return home"
            />
          </section>
        ) : (
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
        )}
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
