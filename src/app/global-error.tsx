"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

interface GlobalErrorPageProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function GlobalErrorPage({
  error,
  reset,
}: GlobalErrorPageProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-950 text-white">
        <main className="flex min-h-screen items-center justify-center px-6 py-16">
          <section className="w-full max-w-3xl rounded-[2rem] border border-rose-400/24 bg-rose-400/10 p-6 shadow-halo sm:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-rose-100/80">
              Application Error
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Something went wrong while loading this experience.
            </h1>
            <p className="mt-5 text-sm leading-7 text-rose-50/86 sm:text-base">
              {error.message ||
                "An unexpected error occurred. Please try again."}
            </p>

            <button
              type="button"
              onClick={() => reset()}
              className="mt-8 inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-white/90"
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
