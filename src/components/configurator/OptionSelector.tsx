"use client";

import type { VehicleConfiguratorOptionGroup } from "@/types";

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

interface OptionSelectorProps {
  group: VehicleConfiguratorOptionGroup;
  selectedOptionId: string;
  onChange: (optionId: string) => void;
}

export function OptionSelector({
  group,
  selectedOptionId,
  onChange,
}: OptionSelectorProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
          {group.label}
        </p>
        <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">
          {group.description}
        </p>
      </div>

      <div
        className="mt-6 grid gap-4 lg:grid-cols-2"
        aria-label={group.label}
        role="radiogroup"
      >
        {group.options.map((option) => {
          const isSelected = selectedOptionId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={[
                "rounded-[1.6rem] border px-5 py-5 text-left transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                isSelected
                  ? "border-white/18 bg-white/[0.08] shadow-[0_20px_40px_rgba(0,0,0,0.24)]"
                  : "border-white/10 bg-black/24 hover:border-white/16 hover:bg-white/[0.05]",
              ].join(" ")}
              onClick={() => onChange(option.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                      {option.label}
                    </p>
                    {option.badge ? (
                      <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/72">
                        {option.badge}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-3 text-sm leading-6 text-white/68">
                    {option.description}
                  </p>
                </div>

                {option.swatch ? (
                  <span
                    aria-hidden="true"
                    className="mt-1 h-8 w-8 rounded-full border border-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                    style={{ backgroundColor: option.swatch }}
                  />
                ) : null}
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/8 pt-4">
                <span className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-white/42">
                  {isSelected ? "Selected" : "Available"}
                </span>
                <span className="text-sm font-medium text-white/78">
                  {formatPriceDelta(option.priceDelta)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
