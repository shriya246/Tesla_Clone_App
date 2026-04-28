import Link from "next/link";

import { AppButton } from "@/components/AppButton";
import { buildMediaBackgroundStyle } from "@/lib/media";
import type { ProductSectionData } from "@/types";

interface ProductSectionProps {
  section: ProductSectionData;
  detailHref?: string;
  detailLabel?: string;
  primaryButtonHref?: string;
  secondaryButtonHref?: string;
}

export function ProductSection({
  section,
  detailHref,
  detailLabel = "View details",
  primaryButtonHref,
  secondaryButtonHref,
}: ProductSectionProps) {
  return (
    <section
      className="section-shell relative flex min-h-screen items-end justify-center overflow-hidden py-16 text-center"
      style={buildMediaBackgroundStyle({
        image: section.image,
        overlay:
          "linear-gradient(to bottom, rgba(6, 7, 10, 0.14), rgba(6, 7, 10, 0.26) 34%, rgba(6, 7, 10, 0.78))",
      })}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_34%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-950/60 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[72vh] w-full max-w-6xl flex-col items-center justify-between gap-12 pt-24 sm:pt-20">
        <div className="max-w-3xl">
          {detailHref ? (
            <Link
              href={detailHref}
              className="inline-flex rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-white/76 transition hover:border-white/20 hover:bg-black/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {detailLabel}
            </Link>
          ) : null}

          {detailHref ? (
            <Link href={detailHref} className="group inline-block">
              <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white transition group-hover:text-white/84 sm:text-5xl lg:text-6xl">
                {section.title}
              </h2>
            </Link>
          ) : (
            <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {section.title}
            </h2>
          )}

          {section.price ? (
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.28em] text-white/58 sm:text-base">
              Starting at {section.price}
            </p>
          ) : null}

          <p className="mt-4 text-base text-white/80 sm:text-lg">
            {section.subtitle}
          </p>
        </div>

        <div className="flex w-full max-w-md flex-col gap-3 pb-4 sm:max-w-none sm:flex-row sm:justify-center">
          <AppButton href={primaryButtonHref}>{section.primaryButton}</AppButton>
          <AppButton href={secondaryButtonHref} variant="secondary">
            {section.secondaryButton}
          </AppButton>
        </div>
      </div>
    </section>
  );
}
