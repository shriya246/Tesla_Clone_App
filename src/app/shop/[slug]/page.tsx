import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DetailHero } from "@/components/DetailHero";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PriceCallout } from "@/components/PriceCallout";
import { RelatedItems } from "@/components/RelatedItems";
import { shopProducts } from "@/data/shop";
import { formatSlug } from "@/lib/formatSlug";
import { getShopItemBySlug } from "@/lib/getShopItemBySlug";

interface ShopDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return shopProducts.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ShopDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getShopItemBySlug(slug);

  if (!product) {
    return {
      title: `${formatSlug(slug)} | Shop | Tesla Inspired`,
    };
  }

  return {
    title: `${product.title} | Shop | Tesla Inspired`,
    description: product.description,
  };
}

export default async function ShopDetailPage({ params }: ShopDetailPageProps) {
  const { slug } = await params;
  const product = getShopItemBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = shopProducts
    .filter((item) => item.slug !== product.slug)
    .slice(0, 3)
    .map((item) => ({
      title: item.title,
      description: item.description,
      href: `/shop/${item.slug}`,
      image: item.image,
      eyebrow: item.badge ?? "Shop",
      price: item.price,
    }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
        <DetailHero
          hero={{
            eyebrow: "Shop",
            title: product.title,
            subtitle: product.description,
            description: product.longDescription,
            image: product.image,
            price: product.price,
            primaryButton: product.primaryButton,
            secondaryButton: "Back to Shop",
            secondaryHref: "/shop",
          }}
        >
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
              { label: product.title },
            ]}
          />
        </DetailHero>

        <section className="section-shell border-t border-white/8 bg-slate-950 py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Overview
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Designed to extend the ownership experience.
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/72 sm:text-base">
                {product.longDescription}
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Product fit
              </p>
              <p className="mt-4 text-lg leading-8 text-white/80">
                {product.description}
              </p>
              {product.badge ? (
                <span className="mt-6 inline-flex rounded-full border border-white/12 bg-black/30 px-4 py-1 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/78">
                  {product.badge}
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <PriceCallout
          price={product.price}
          title="Pricing and purchase snapshot"
          description="A quick way to understand the value, role, and fit of this product before moving deeper into the broader shop experience."
          primaryButton={product.primaryButton}
          secondaryButton="Continue shopping"
          secondaryHref="/shop"
          specs={product.specs}
        />

        <section className="section-shell border-t border-white/8 bg-slate-950 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Highlights
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Built around utility, presentation, and everyday fit.
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {product.highlights.map((highlight) => (
                <article
                  key={highlight.title}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8"
                >
                  <h3 className="text-2xl font-semibold tracking-tight text-white">
                    {highlight.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/72 sm:text-base">
                    {highlight.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <RelatedItems
          title="Explore related shop products"
          description="Browse more accessories, charging gear, and lifestyle items built to round out the Tesla-inspired ownership journey."
          items={relatedProducts}
        />

        <Footer />
      </main>
    </>
  );
}
