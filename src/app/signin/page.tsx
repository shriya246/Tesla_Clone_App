import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { buildPageMetadata } from "@/lib/metadata";
import { hasGoogleAuthEnv } from "@/lib/env";

export const metadata: Metadata = buildPageMetadata({
  title: "Sign In | Tesla Inspired",
  description:
    "Sign in to save favorites, revisit products, and access your lightweight Tesla-inspired account area.",
  path: "/signin",
  noIndex: true,
});

interface SignInPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const redirectTo = callbackUrl || "/account";
  const isGoogleAuthReady = hasGoogleAuthEnv;

  if (session?.user) {
    redirect(redirectTo);
  }

  async function signInWithGoogle() {
    "use server";

    await signIn("google", {
      redirectTo,
    });
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 pt-28 text-white">
        <section className="section-shell py-16 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Sign In
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Save products and continue where you left off.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                Sign in with Google to keep a lightweight account, save
                favorites across Vehicles, Energy, and Shop, and access your
                personal account page.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Account Access
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {isGoogleAuthReady
                  ? "Continue with Google"
                  : "Authentication setup needed"}
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/72 sm:text-base">
                {isGoogleAuthReady
                  ? "This keeps authentication simple and gives you access to saved items without adding extra account-management friction."
                  : "Google sign-in is not configured on this machine yet. Add AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET to your local environment when you are ready to enable account features."}
              </p>

              {isGoogleAuthReady ? (
                <form action={signInWithGoogle} className="mt-8">
                  <button
                    type="submit"
                    className="inline-flex min-h-[3.125rem] w-full items-center justify-center rounded-full bg-white px-6 text-sm font-medium tracking-[0.02em] text-slate-950 shadow-[0_12px_40px_rgba(255,255,255,0.14)] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Sign In with Google
                  </button>
                </form>
              ) : (
                <div className="mt-8 rounded-[1.5rem] border border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm leading-6 text-amber-50">
                  Add your Google OAuth credentials locally to enable account,
                  favorites, and admin access.
                </div>
              )}

              <p className="mt-6 text-sm leading-6 text-white/52">
                After signing in, you will return to the page you came from when
                possible.
              </p>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
