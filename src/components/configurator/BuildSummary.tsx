import type { ReactNode } from "react";

import type { SavedBuildSelectedOptions } from "@/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatPriceDelta(value: number) {
  if (value <= 0) {
    return "Included";
  }

  return `+${currencyFormatter.format(value)}`;
}

interface BuildSummaryProps {
  title: string;
  subtitle: string;
  vehiclePrice: string;
  estimatedPrice: string;
  selectedOptions: SavedBuildSelectedOptions;
  buildLabel?: string;
  meta?: string;
  children?: ReactNode;
}

export function BuildSummary({
  title,
  subtitle,
  vehiclePrice,
  estimatedPrice,
  selectedOptions,
  buildLabel,
  meta,
  children,
}: BuildSummaryProps) {
  return (
    <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
      <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
        Build Summary
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">
        {subtitle}
      </p>

      {buildLabel ? (
        <div className="mt-5 inline-flex rounded-full border border-white/10 bg-black/24 px-4 py-2 text-sm font-medium text-white/84">
          {buildLabel}
        </div>
      ) : null}

      {meta ? (
        <p className="mt-4 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-white/40">
          {meta}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.5rem] border border-white/10 bg-black/24 p-5">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/40">
            Vehicle Price
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {vehiclePrice}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/40">
            Estimated Build
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {estimatedPrice}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {Object.values(selectedOptions).map((option) => (
          <div
            key={option.key}
            className="rounded-[1.5rem] border border-white/10 bg-black/24 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/40">
                  {option.label}
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-white">
                  {option.optionLabel}
                </p>
              </div>

              {option.swatch ? (
                <span
                  aria-hidden="true"
                  className="mt-1 h-7 w-7 rounded-full border border-white/12"
                  style={{ backgroundColor: option.swatch }}
                />
              ) : null}
            </div>

            <p className="mt-3 text-sm leading-6 text-white/68">
              {option.description}
            </p>
            <p className="mt-4 text-sm font-medium text-white/78">
              {formatPriceDelta(option.priceDelta)}
            </p>
          </div>
        ))}
      </div>

      {children ? <div className="mt-8 border-t border-white/8 pt-8">{children}</div> : null}
    </aside>
  );
}
