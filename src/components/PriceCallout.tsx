import { AppButton } from "@/components/AppButton";
import type { DetailSpec } from "@/types";

interface PriceCalloutProps {
  price: string;
  title: string;
  description: string;
  primaryButton: string;
  secondaryButton: string;
  primaryHref?: string;
  secondaryHref?: string;
  specs?: DetailSpec[];
}

export function PriceCallout({
  price,
  title,
  description,
  primaryButton,
  secondaryButton,
  primaryHref,
  secondaryHref,
  specs = [],
}: PriceCalloutProps) {
  return (
    <section className="section-shell border-t border-white/8 bg-slate-950 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
              Pricing
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/72 sm:text-base">
              {description}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/24 p-6">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
              Starting at
            </p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {price}
            </p>

            {specs.length > 0 ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {specs.map((spec) => (
                  <div
                    key={`${spec.label}-${spec.value}`}
                    className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4"
                  >
                    <p className="text-[0.65rem] uppercase tracking-[0.24em] text-white/40">
                      {spec.label}
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <AppButton href={primaryHref}>{primaryButton}</AppButton>
              <AppButton href={secondaryHref} variant="secondary">
                {secondaryButton}
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
