import Link from "next/link";

interface CatalogEmptyStateProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function CatalogEmptyState({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: CatalogEmptyStateProps) {
  return (
    <div className="mx-auto max-w-5xl rounded-[2rem] border border-dashed border-white/12 bg-white/[0.03] p-8 text-center shadow-halo">
      <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/62 sm:text-base">
        {description}
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href={primaryHref}
          className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-white/90"
        >
          {primaryLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
