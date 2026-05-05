import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FavoriteItemType } from "@prisma/client";
import { auth } from "@/auth";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContinuityStrip } from "@/components/ContinuityStrip";
import { DetailHero } from "@/components/DetailHero";
import { FavoriteToggle } from "@/components/FavoriteToggle";
import { Footer } from "@/components/Footer";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { GuestRecentlyViewedStrip } from "@/components/GuestRecentlyViewedStrip";
import { Navbar } from "@/components/Navbar";
import { PriceCallout } from "@/components/PriceCallout";
import { RecentlyViewedTracker } from "@/components/RecentlyViewedTracker";
import { RelatedItems } from "@/components/RelatedItems";
import { isFavorited } from "@/lib/db/favorites";
import { getShopProductBySlug } from "@/lib/db/shop";
import { formatSlug } from "@/lib/formatSlug";
import { buildPageMetadata } from "@/lib/metadata";
import {
  getContextualRecommendationsForItem,
  getRecentlyViewed,
  trackRecentlyViewed,
} from "@/lib/recommendations";

interface ShopDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ShopDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getShopProductBySlug(slug);

  if (!product) {
    return buildPageMetadata({
      title: `${formatSlug(slug)} | Shop | Tesla Inspired`,
      description:
        "Explore Tesla-inspired accessories, charging gear, and product support.",
      path: `/shop/${slug}`,
    });
  }

  return buildPageMetadata({
    title: `${product.title} | Shop | Tesla Inspired`,
    description: product.description,
    path: `/shop/${product.slug}`,
    image: product.image,
  });
}

export default async function ShopDetailPage({ params }: ShopDetailPageProps) {
  const { slug } = await params;
  const [product, session] = await Promise.all([
    getShopProductBySlug(slug),
    auth().catch(() => null),
  ]);

  if (!product) {
    notFound();
  }

  const favoriteState = session?.user?.id
    ? await isFavorited({
        userId: session.user.id,
        itemType: FavoriteItemType.SHOP_PRODUCT,
        itemSlug: product.slug,
      })
    : false;
  const [relatedProducts, _tracked, recentlyViewedItems] = await Promise.all([
    getContextualRecommendationsForItem({
      userId: session?.user?.id,
      itemType: "SHOP_PRODUCT",
      slug: product.slug,
      limit: 3,
    }),
    session?.user?.id
      ? trackRecentlyViewed({
          userId: session.user.id,
          itemType: "SHOP_PRODUCT",
          itemSlug: product.slug,
        })
      : Promise.resolve(false),
    session?.user?.id
      ? getRecentlyViewed(session.user.id, 5)
      : Promise.resolve([]),
  ]);
  const continuityItems = recentlyViewedItems
    .filter((item) => item.slug !== product.slug)
    .slice(0, 4);

  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
        <RecentlyViewedTracker
          item={{
            itemType: "SHOP_PRODUCT",
            slug: product.slug,
            title: product.title,
            description: product.description,
            href: `/shop/${product.slug}`,
            image: product.image,
            eyebrow: product.badge ?? "Shop",
            price: product.price,
          }}
        />
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

              <div className="mt-6">
                <FavoriteToggle
                  isFavorited={favoriteState}
                  isSignedIn={Boolean(session?.user?.id)}
                  itemSlug={product.slug}
                  itemTitle={product.title}
                  itemType="SHOP_PRODUCT"
                  redirectPath={`/shop/${product.slug}`}
                />
              </div>
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

        {session?.user?.id ? (
          continuityItems.length > 0 ? (
            <ContinuityStrip
              eyebrow="Recently Viewed"
              title="Keep nearby ownership gear close"
              description="Your recent product views stay attached to the shop flow so accessory research keeps moving without extra backtracking."
              items={continuityItems}
              actionHref="/account"
              actionLabel="Open Account"
              compact
            />
          ) : null
        ) : (
          <GuestRecentlyViewedStrip
            currentItem={{
              itemType: "SHOP_PRODUCT",
              slug: product.slug,
            }}
          />
        )}

        <section className="section-shell border-t border-white/8 bg-slate-950 py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Product Inquiry
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Ask about this product before the next step.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                Use this inquiry flow for product questions, compatibility
                details, bundle fit, or anything else you want clarified about{" "}
                {product.title}.
              </p>

              <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/38">
                  Helpful topics
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Compatibility
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      Ask how the product fits your setup or use case.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Product details
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      Use the message field for questions before you commit.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Purchase planning
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      We can respond with context tied to this specific item.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <InquiryForm
              contextLabel="Product"
              contextValue={product.title}
              defaultMessage={`I have a question about ${product.title}.`}
              description="Tell us what you are comparing, what compatibility questions you have, or what you want clarified about this item."
              itemType="SHOP_PRODUCT"
              messageLabel="What would you like to ask?"
              messagePlaceholder={`I would like to learn more about ${product.title}, how it fits my setup, and what to consider before purchasing.`}
              productSlug={product.slug}
              submitLabel="Send Product Inquiry"
              successMessage={`We have received your inquiry about ${product.title} and will follow up soon.`}
              successTitle="Inquiry received"
              title="Ask About This Product"
              type="PRODUCT_INQUIRY"
            />
          </div>
        </section>

        {relatedProducts ? (
          <RelatedItems
            eyebrow={relatedProducts.eyebrow}
            title={relatedProducts.title}
            description={relatedProducts.description}
            items={relatedProducts.items}
          />
        ) : null}

        <Footer />
      </main>
    </>
  );
}
