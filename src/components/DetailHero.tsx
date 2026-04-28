import type { ReactNode } from "react";

import { AppButton } from "@/components/AppButton";
import { buildMediaBackgroundStyle } from "@/lib/media";
import type { DetailHeroData } from "@/types";

interface DetailHeroProps {
  hero: DetailHeroData;
  children?: ReactNode;
}

export function DetailHero({ hero, children }: DetailHeroProps) {
  return (
    <section
      className="section-shell relative overflow-hidden pt-32 pb-14 sm:pb-20"
      style={buildMediaBackgroundStyle({
        image: hero.image,
        overlay:
          "linear-gradient(to bottom, rgba(6, 7, 10, 0.58), rgba(6, 7, 10, 0.88))",
      })}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_30%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_28%)]" />

      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-black/28 shadow-halo backdrop-blur-md">
        <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] lg:px-10 lg:py-12">
          <div className="flex flex-col justify-center">
            {children}

            {hero.eyebrow ? (
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.32em] text-white/52">
                {hero.eyebrow}
              </p>
            ) : null}

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>

            <p className="mt-4 max-w-3xl text-lg text-white/84 sm:text-xl">
              {hero.subtitle}
            </p>

            {hero.price ? (
              <p className="mt-5 text-sm font-medium uppercase tracking-[0.28em] text-white/54 sm:text-base">
                Starting at {hero.price}
              </p>
            ) : null}

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
              {hero.description}
            </p>

            <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row">
              <AppButton href={hero.primaryHref}>{hero.primaryButton}</AppButton>
              <AppButton href={hero.secondaryHref} variant="secondary">
                {hero.secondaryButton}
              </AppButton>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm sm:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
              Detail Overview
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Designed to make the next step feel clear.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">
              Browse a richer product story with a dedicated detail layout,
              persistent navigation, and content blocks built to scale across
              vehicles, energy, and shop experiences.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-white/42">
                  Category
                </p>
                <p className="mt-2 text-lg font-medium text-white">
                  {hero.eyebrow ?? "Product Detail"}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-white/42">
                  Experience
                </p>
                <p className="mt-2 text-lg font-medium text-white">
                  Browse to detail
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
