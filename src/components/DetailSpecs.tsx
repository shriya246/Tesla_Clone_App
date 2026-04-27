import type { DetailSpec } from "@/types";

interface DetailSpecsProps {
  title: string;
  description?: string;
  items: DetailSpec[];
}

export function DetailSpecs({
  title,
  description,
  items,
}: DetailSpecsProps) {
  return (
    <section className="section-shell border-t border-white/8 bg-slate-950 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
            Specs
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 text-sm leading-6 text-white/72 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <article
              key={`${item.label}-${item.value}`}
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm"
            >
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/40">
                {item.label}
              </p>
              <p className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {item.value}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
