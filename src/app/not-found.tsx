import Link from "next/link";

export default function AppNotFoundPage() {
  return (
    <section className="section-shell py-16 lg:py-24">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-center shadow-halo backdrop-blur-sm sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
          Not Found
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          We could not find the page you were looking for.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
          The route may have moved, the product may no longer be available, or
          the link may be outdated.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-white/90"
          >
            Return home
          </Link>
          <Link
            href="/vehicles"
            className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
          >
            Browse vehicles
          </Link>
        </div>
      </div>
    </section>
  );
}
