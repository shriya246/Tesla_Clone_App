import type { ChargingStatData } from "@/types";

interface StatCardProps {
  stat: ChargingStatData;
}

export function StatCard({ stat }: StatCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm sm:p-6">
      <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {stat.value}
      </p>

      <p className="mt-2 text-sm font-medium tracking-wide text-white/88">
        {stat.label}
      </p>

      {stat.description ? (
        <p className="mt-3 text-sm leading-6 text-white/60">
          {stat.description}
        </p>
      ) : null}
    </article>
  );
}

