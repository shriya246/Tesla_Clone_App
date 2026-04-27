import { AppButton } from "@/components/AppButton";
import { StatCard } from "@/components/StatCard";
import type { ChargingSectionData } from "@/types";

interface ChargingSectionProps {
  section: ChargingSectionData;
}

export function ChargingSection({ section }: ChargingSectionProps) {
  return (
    <section
      id="charging"
      className="section-shell border-t border-white/8 bg-slate-950 py-16 lg:py-20"
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        <div
          className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-halo"
          style={{
            backgroundColor: "#06070a",
            backgroundImage: `linear-gradient(to bottom, rgba(6, 7, 10, 0.12), rgba(6, 7, 10, 0.68)), url(${section.image})`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_35%)]" />
          <div className="relative z-10 flex min-h-[30rem] flex-col justify-between p-6 sm:min-h-[36rem] sm:p-8 lg:p-10">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-white/15 bg-black/25 px-4 py-1 text-[0.65rem] font-medium uppercase tracking-[0.26em] text-white/75 backdrop-blur-sm">
                Charging
              </span>

              <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {section.title}
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/78 sm:text-base">
                {section.description}
              </p>
            </div>

            <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row">
              <AppButton>{section.primaryButton}</AppButton>
              <AppButton variant="secondary">{section.secondaryButton}</AppButton>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-halo backdrop-blur-sm sm:p-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/45">
              Network Reach
            </p>

            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Charge almost anywhere with speed, simplicity, and a growing global footprint.
            </h3>
          </div>

          <div className="grid gap-4">
            {section.stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
