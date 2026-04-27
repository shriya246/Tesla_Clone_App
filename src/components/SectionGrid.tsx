import type { ReactNode } from "react";

interface SectionGridProps {
  children: ReactNode;
  id?: string;
  title?: string;
  description?: string;
}

export function SectionGrid({
  children,
  id,
  title,
  description,
}: SectionGridProps) {
  return (
    <section
      id={id}
      className="section-shell border-t border-white/8 bg-slate-950 py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl">
        {title ? (
          <div className="mx-auto mb-10 max-w-3xl text-center lg:mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {title}
            </h2>

            {description ? (
              <p className="mt-4 text-sm leading-6 text-white/72 sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {children}
        </div>
      </div>
    </section>
  );
}
