import type { ReactNode } from "react";
import type { Metadata } from "next";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { AdminTabs } from "@/components/AdminTabs";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { buildPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPageMetadata({
  title: "Admin | Tesla Inspired",
  description:
    "Admin operations for products, media, and inquiry management.",
  path: "/admin",
  noIndex: true,
});

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await requireAdminSession("/admin");

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 pt-28 text-white">
        <section className="section-shell pb-8">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                  Admin
                </p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Catalog and inquiry operations, finally practical day to day.
                </h1>
                <p className="mt-5 text-sm leading-7 text-white/68 sm:text-base">
                  Create, edit, and remove products, review saved inquiries, and
                  keep the Tesla-inspired MVP manageable without turning admin into
                  an overbuilt CMS.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-black/24 px-5 py-4">
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-white/42">
                  Admin session
                </p>
                <p className="mt-3 text-base font-medium text-white">
                  {session.user.name ?? "Admin User"}
                </p>
                <p className="mt-1 text-sm text-white/62">
                  {session.user.email ?? "No email available"}
                </p>
              </div>
            </div>

            <AdminTabs />
          </div>
        </section>

        {children}
      </main>
      <Footer />
    </>
  );
}
