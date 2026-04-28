"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

interface AppErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function AppErrorPage({ error, reset }: AppErrorPageProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <section className="section-shell py-16 lg:py-24">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-rose-400/24 bg-rose-400/10 p-6 shadow-halo sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-rose-100/80">
          Route Error
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          We could not finish loading this page.
        </h1>
        <p className="mt-5 text-sm leading-7 text-rose-50/86 sm:text-base">
          {error.message ||
            "Something unexpected happened while loading this route. Please try again."}
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-white/90"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
