import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FavoriteItemType } from "@prisma/client";
import { auth } from "@/auth";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DetailHero } from "@/components/DetailHero";
import { FavoriteToggle } from "@/components/FavoriteToggle";
import { Footer } from "@/components/Footer";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { Navbar } from "@/components/Navbar";
import { RelatedItems } from "@/components/RelatedItems";
import {
  getAllEnergyProducts,
  getEnergyProductBySlug,
} from "@/lib/db/energy";
import { isFavorited } from "@/lib/db/favorites";
import { formatSlug } from "@/lib/formatSlug";

interface EnergyDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: EnergyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getEnergyProductBySlug(slug);

  if (!product) {
    return {
      title: `${formatSlug(slug)} | Energy | Tesla Inspired`,
    };
  }

  return {
    title: `${product.title} | Energy | Tesla Inspired`,
    description: product.description,
  };
}

export default async function EnergyDetailPage({
  params,
}: EnergyDetailPageProps) {
  const { slug } = await params;
  const [product, energyProducts, session] = await Promise.all([
    getEnergyProductBySlug(slug),
    getAllEnergyProducts(),
    auth().catch(() => null),
  ]);

  if (!product) {
    notFound();
  }

  const favoriteState = session?.user?.id
    ? await isFavorited({
        userId: session.user.id,
        itemType: FavoriteItemType.ENERGY_PRODUCT,
        itemSlug: product.slug,
      })
    : false;

  const relatedProducts = energyProducts
    .filter((item) => item.slug !== product.slug)
    .map((item) => ({
      title: item.title,
      description: item.description,
      href: `/energy/${item.slug}`,
      image: item.image,
      eyebrow: "Energy",
    }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
        <DetailHero
          hero={{
            eyebrow: "Energy",
            title: product.title,
            subtitle: product.description,
            description: product.longDescription,
            image: product.image,
            primaryButton: product.primaryButton,
            secondaryButton: "Back to Energy",
            secondaryHref: "/energy",
          }}
        >
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Energy", href: "/energy" },
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
                Built for cleaner energy and stronger control at home.
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/72 sm:text-base">
                {product.longDescription}
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                System fit
              </p>
              <p className="mt-4 text-lg leading-8 text-white/80">
                {product.description}
              </p>
              <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">
                Designed to fit into a broader home-energy journey with a clear
                path from product discovery to a more complete ecosystem view.
              </p>

              <div className="mt-6">
                <FavoriteToggle
                  isFavorited={favoriteState}
                  isSignedIn={Boolean(session?.user?.id)}
                  itemSlug={product.slug}
                  itemTitle={product.title}
                  itemType="ENERGY_PRODUCT"
                  redirectPath={`/energy/${product.slug}`}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell border-t border-white/8 bg-slate-950 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Highlights
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Why this product matters in the home stack.
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

        <section className="section-shell border-t border-white/8 bg-slate-950 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Supporting Info
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Supporting details for a more complete energy picture.
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {product.supportingFeatures.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-[2rem] border border-white/10 bg-black/24 p-6 shadow-halo sm:p-8"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/38">
                    Feature
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/72 sm:text-base">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell border-t border-white/8 bg-slate-950 py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Consultation
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Request a tailored energy conversation.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                Share a little about your home, project timing, or the kind of
                energy setup you are exploring. We can follow up with product
                guidance specific to {product.title}.
              </p>

              <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/38">
                  Best for
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Home planning
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      Ask about system fit, timeline, and the broader energy
                      setup.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Product comparison
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      Mention whether you are comparing solar, storage, or both.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Guided next steps
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      We can route your request with the right product context.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <InquiryForm
              contextLabel="Energy Product"
              contextValue={product.title}
              defaultMessage={`I would like to request a consultation about ${product.title}.`}
              description="Tell us about your energy goals, the kind of setup you are considering, or what you want to understand before moving forward."
              itemType="ENERGY_PRODUCT"
              messageLabel="What are you planning for your home?"
              messagePlaceholder={`I would like to understand whether ${product.title} fits my home, usage goals, and next-step planning.`}
              productSlug={product.slug}
              submitLabel="Request Consultation"
              successMessage={`We have received your consultation request for ${product.title} and will follow up soon.`}
              successTitle="Consultation request received"
              title="Request a Consultation"
              type="ENERGY_CONSULTATION"
            />
          </div>
        </section>

        <RelatedItems
          title="Explore related energy products"
          description="See how additional products expand the resilience, storage, and visibility of the home-energy experience."
          items={relatedProducts}
        />

        <Footer />
      </main>
    </>
  );
}
