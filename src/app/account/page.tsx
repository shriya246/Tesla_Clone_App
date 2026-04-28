import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { getUserFavoriteItems } from "@/lib/db/favorites";
import { buildMediaBackgroundStyle } from "@/lib/media";

export const dynamic = "force-dynamic";

interface AccountPageProps {
  searchParams: Promise<{
    notice?: string;
  }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const session = await auth();
  const { notice } = await searchParams;

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=%2Faccount");
  }

  const favoriteItems = await getUserFavoriteItems(session.user.id);

  async function signOutAction() {
    "use server";

    await signOut({
      redirectTo: "/",
    });
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 pt-28 text-white">
        <section className="section-shell py-16 lg:py-20">
          {notice === "admin" ? (
            <div className="mx-auto mb-8 max-w-7xl rounded-[1.75rem] border border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm leading-6 text-amber-50 sm:px-6">
              Admin access is limited to approved accounts. If you should have
              access, add your email to <code className="rounded bg-black/20 px-2 py-1">ADMIN_EMAILS</code>{" "}
              and sign in again.
            </div>
          ) : null}

          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.85fr)]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Account
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your saved Tesla-inspired catalog.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                Review the products you have saved across Vehicles, Energy, and
                Shop, and return to any detail page whenever you want to pick up
                the journey again.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black/28 text-lg font-semibold text-white">
                  {session.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={session.user.name ?? "Account profile image"}
                      className="h-full w-full object-cover"
                      src={session.user.image}
                    />
                  ) : (
                    <span>{session.user.name?.charAt(0) ?? "A"}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/40">
                    Signed in as
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    {session.user.name ?? "Account User"}
                  </h2>
                  <p className="mt-2 break-words text-sm text-white/62">
                    {session.user.email}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/24 p-5">
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/40">
                    Saved Items
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                    {favoriteItems.length}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-black/24 p-5">
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/40">
                    Access
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/68">
                    {session.user.role === "ADMIN"
                      ? "You have customer account access plus the lightweight admin dashboard."
                      : "Use this lightweight account area to revisit saved catalog items and continue browsing."}
                  </p>
                </div>
              </div>

              {session.user.role === "ADMIN" ? (
                <Link
                  href="/admin"
                  className="mt-4 inline-flex min-h-[3rem] w-full items-center justify-center rounded-full border border-white/10 bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-white/90"
                >
                  Open Admin Dashboard
                </Link>
              ) : null}

              <form action={signOutAction} className="mt-8">
                <button
                  type="submit"
                  className="inline-flex min-h-[3.125rem] w-full items-center justify-center rounded-full border border-white/10 bg-white/10 px-6 text-sm font-medium tracking-[0.02em] text-white transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="section-shell border-t border-white/8 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                  Favorites
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Saved items from your account.
                </h2>
              </div>
              <Link
                href="/vehicles"
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
              >
                Keep Browsing
              </Link>
            </div>

            {favoriteItems.length === 0 ? (
              <div className="mt-10 rounded-[2rem] border border-dashed border-white/12 bg-white/[0.03] p-8 text-center shadow-halo">
                <p className="text-lg font-medium text-white">
                  No saved items yet.
                </p>
                <p className="mt-3 text-sm leading-7 text-white/62 sm:text-base">
                  Save vehicles, energy products, or shop items from any detail
                  page to build your own shortlist here.
                </p>
              </div>
            ) : (
              <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {favoriteItems.map((item) => (
                  <Link
                    key={`${item.itemType}-${item.itemSlug}`}
                    href={item.href}
                    className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-halo backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.05]"
                  >
                    <div
                      className="relative h-64 overflow-hidden"
                      style={buildMediaBackgroundStyle({
                        image: item.image,
                        overlay:
                          "linear-gradient(to bottom, rgba(12, 15, 21, 0.14), rgba(12, 15, 21, 0.62))",
                        backgroundColor: "#0c0f15",
                      })}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_32%)] transition duration-500 group-hover:opacity-85" />
                      <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-4">
                        <span className="inline-flex rounded-full border border-white/12 bg-black/30 px-4 py-1 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-white/78 backdrop-blur-sm">
                          {item.eyebrow}
                        </span>
                        {item.price ? (
                          <span className="text-xs font-medium uppercase tracking-[0.24em] text-white/65">
                            {item.price}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="p-6 sm:p-8">
                      <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                        {item.title}
                      </h3>
                      <p className="mt-4 text-sm leading-6 text-white/72 sm:text-base">
                        {item.description}
                      </p>
                      <p className="mt-6 text-sm font-medium tracking-[0.02em] text-white transition group-hover:text-white/76">
                        View details
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
