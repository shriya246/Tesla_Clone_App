import { buildMediaBackgroundStyle } from "@/lib/media";
import type { FeatureSectionData } from "@/types";

interface FeatureCardProps {
  feature: FeatureSectionData;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-halo backdrop-blur-sm">
      <div
        className="relative h-64 overflow-hidden sm:h-72"
        style={buildMediaBackgroundStyle({
          image: feature.image,
          overlay:
            "linear-gradient(to bottom, rgba(12, 15, 21, 0.08), rgba(12, 15, 21, 0.4))",
          backgroundColor: "#0c0f15",
        })}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_32%)]" />
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {feature.title}
        </h3>

        <p className="mt-4 flex-1 text-sm leading-6 text-white/72 sm:text-base">
          {feature.description}
        </p>

        {feature.linkText ? (
          <a
            href="#top"
            className="mt-6 inline-flex text-sm font-medium tracking-wide text-white transition hover:text-white/75"
          >
            {feature.linkText}
          </a>
        ) : null}
      </div>
    </article>
  );
}
