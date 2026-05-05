import type { Metadata } from "next";
import { CatalogEmptyState } from "@/components/CatalogEmptyState";
import { FeatureCard } from "@/components/FeatureCard";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";
import { CatalogToolbar } from "@/components/search/CatalogToolbar";
import { SectionGrid } from "@/components/SectionGrid";
import { ShopCard } from "@/components/ShopCard";
import { shopFeatures, shopPageHeader } from "@/data/shop";
import { getAllShopProducts } from "@/lib/db/shop";
import { buildPageMetadata } from "@/lib/metadata";
import { pricedCatalogSortOptions } from "@/lib/search/constants";
import { getShopProductSearchFields } from "@/lib/search/fields";
import {
  filterAndSortCollection,
  parseSearchSort,
  sanitizeSearchQuery,
} from "@/lib/search/utils";

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

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const query = sanitizeSearchQuery(params.q);
  const sort = parseSearchSort(params.sort, "featured");
  const shopProducts = filterAndSortCollection(
    await getAllShopProducts(),
    {
      query,
      sort,
    },
    getShopProductSearchFields,
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white">
        <PageHeader header={shopPageHeader} />
        <CatalogToolbar
          action="/shop"
          defaultSort="featured"
          description="Search accessories, charging essentials, and lifestyle items by name, use case, or product intent, then sort the grid without leaving the shop flow."
          itemCount={shopProducts.length}
          placeholder="Search Wall Connector, bundle, apparel, and more"
          pluralLabel="shop products"
          query={query}
          searchAllHref="/search?type=shop"
          searchAllLabel="Search all categories"
          singularLabel="shop product"
          sort={sort}
          sortOptions={pricedCatalogSortOptions}
          suggestionType="shop"
          title="Refine the shop"
        />
        {shopProducts.length === 0 ? (
          <section className="section-shell py-16 lg:py-20">
            <CatalogEmptyState
              eyebrow="Shop"
              title={
                query
                  ? "No shop products matched this search."
                  : "Shop products are not available yet."
              }
              description={
                query
                  ? "Try a broader term, reset the filters, or search the full catalog for related vehicles and energy products."
                  : "The shop catalog is empty right now. Add or seed products to restore the full public shopping surface."
              }
              primaryHref={query ? "/shop" : "/admin/products"}
              primaryLabel={query ? "Reset shop search" : "Open admin products"}
              secondaryHref={query ? "/search" : "/"}
              secondaryLabel={query ? "Search all products" : "Return home"}
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
