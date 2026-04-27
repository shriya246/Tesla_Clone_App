import { AppButton } from "@/components/AppButton";
import type { OfferSectionData } from "@/types";

interface OfferCardProps {
  offer: OfferSectionData;
}

export function OfferCard({ offer }: OfferCardProps) {
  return (
    <article
      className="group relative flex min-h-[30rem] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-halo"
      style={{
        backgroundColor: "#06070a",
        backgroundImage: `linear-gradient(to bottom, rgba(6, 7, 10, 0.12), rgba(6, 7, 10, 0.78)), url(${offer.image})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_30%)] transition duration-500 group-hover:opacity-80" />

      <div className="relative z-10 flex w-full flex-col justify-between p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-sm">
            <h3 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {offer.title}
            </h3>

            <p className="mt-4 text-sm leading-6 text-white/78 sm:text-base">
              {offer.description}
            </p>
          </div>

          {offer.badge ? (
            <span className="inline-flex rounded-full border border-white/15 bg-black/25 px-4 py-1 text-[0.65rem] font-medium uppercase tracking-[0.26em] text-white/75 backdrop-blur-sm">
              {offer.badge}
            </span>
          ) : null}
        </div>

        <div className="flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row">
          <AppButton>{offer.primaryButton}</AppButton>
          <AppButton variant="secondary">{offer.secondaryButton}</AppButton>
        </div>
      </div>
    </article>
  );
}

