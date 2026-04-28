import Link from "next/link";

export default function AdminNotFoundPage() {
  return (
    <section className="section-shell py-8 pb-16 lg:py-10 lg:pb-20">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-center shadow-halo backdrop-blur-sm sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
          Admin Not Found
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          That admin resource is no longer available.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
          The product or inquiry may have been removed, or the admin link may
          be out of date.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/admin"
            className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-white/90"
          >
            Return to dashboard
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
          >
            Review products
          </Link>
        </div>
      </div>
    </section>
  );
}
