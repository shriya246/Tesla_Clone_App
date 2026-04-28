import Link from "next/link";

import { AppButton } from "@/components/AppButton";
import { buildMediaBackgroundStyle } from "@/lib/media";
import type { EnergySectionData } from "@/types";

interface EnergyCardProps {
  section: EnergySectionData;
  detailHref?: string;
}

export function EnergyCard({ section, detailHref }: EnergyCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-halo backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.05]">
      <div
        className="relative h-72 overflow-hidden sm:h-80"
        style={buildMediaBackgroundStyle({
          image: section.image,
          overlay:
            "linear-gradient(to bottom, rgba(12, 15, 21, 0.1), rgba(12, 15, 21, 0.48))",
          backgroundColor: "#0c0f15",
        })}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_34%)] transition duration-500 group-hover:opacity-80" />
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        {detailHref ? (
          <Link
            href={detailHref}
            className="text-2xl font-semibold tracking-tight text-white transition hover:text-white/84 sm:text-3xl"
          >
            {section.title}
          </Link>
        ) : (
          <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {section.title}
          </h3>
        )}

        <p className="mt-4 flex-1 text-sm leading-6 text-white/72 sm:text-base">
          {section.description}
        </p>

        {detailHref ? (
          <Link
            href={detailHref}
            className="mt-6 inline-flex text-sm font-medium tracking-[0.02em] text-white transition hover:text-white/76"
          >
            View details
          </Link>
        ) : null}

        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row">
          <AppButton>{section.primaryButton}</AppButton>
          <AppButton href={detailHref} variant="secondary">
            {section.secondaryButton}
          </AppButton>
        </div>
      </div>
    </article>
  );
}
