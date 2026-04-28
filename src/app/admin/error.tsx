"use client";

import Link from "next/link";

interface AdminErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function AdminErrorPage({ error, reset }: AdminErrorPageProps) {
  return (
    <section className="section-shell py-12 lg:py-16">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-rose-400/24 bg-rose-400/10 p-6 shadow-halo sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-rose-100/80">
          Admin Error
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          We could not load this admin view.
        </h2>
        <p className="mt-5 text-sm leading-7 text-rose-50/86 sm:text-base">
          {error.message ||
            "Something went wrong while preparing the admin dashboard. Please try again."}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-white/90"
          >
            Try again
          </button>
          <Link
            href="/account"
            className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
          >
            Return to account
          </Link>
        </div>
      </div>
    </section>
  );
}
