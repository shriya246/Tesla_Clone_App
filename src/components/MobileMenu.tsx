"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import type { NavigationItem } from "@/types";

interface MobileMenuProps {
  isOpen: boolean;
  items: NavigationItem[];
  onClose: () => void;
}

function isRouteActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileMenu({ isOpen, items, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const authHref = session?.user ? "/account" : "/signin";
  const authLabel = session?.user ? "Account" : "Sign In";
  const isAdmin = session?.user?.role === "ADMIN";
  const isSearchActive = isRouteActive(pathname, "/search");
  const isAccountActive = isRouteActive(pathname, authHref);
  const isAdminActive = isRouteActive(pathname, "/admin");

  return (
    <div
      className={[
        "pointer-events-none fixed inset-0 z-40 lg:hidden",
        isOpen ? "pointer-events-auto" : "",
      ].join(" ")}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close mobile menu overlay"
        className={[
          "absolute inset-0 bg-slate-950/72 backdrop-blur-sm transition duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      <div
        className={[
          "absolute inset-x-4 top-24 rounded-[2rem] border border-white/10 bg-black/75 p-5 shadow-halo backdrop-blur-2xl transition duration-300 sm:inset-x-6",
          isOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/45">
              Navigation
            </p>
            <p className="mt-1 text-sm text-white/70">
              Explore the full landing experience.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/10 px-4 text-sm font-medium text-white/80 transition hover:bg-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Close
          </button>
        </div>

        <nav className="mt-4 flex flex-col">
          {items.map((item) => {
            const isActive = isRouteActive(pathname, item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "rounded-2xl px-4 py-4 text-base font-medium transition",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/82 hover:bg-white/8 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 border-t border-white/10 pt-5">
          <div className="flex flex-col gap-3">
            <Link
              href="/search"
              onClick={onClose}
              aria-current={isSearchActive ? "page" : undefined}
              className={[
                "inline-flex min-h-[3rem] w-full items-center justify-center rounded-full border px-4 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                isSearchActive
                  ? "border-white/16 bg-white text-slate-950"
                  : "border-white/10 bg-white/10 text-white/84 hover:bg-white/18 hover:text-white",
              ].join(" ")}
            >
              Search Catalog
            </Link>

            <Link
              href={authHref}
              onClick={onClose}
              aria-current={isAccountActive ? "page" : undefined}
              className={[
                "inline-flex min-h-[3rem] w-full items-center justify-center rounded-full border px-4 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                isAccountActive
                  ? "border-white/16 bg-white/14 text-white"
                  : "border-white/10 bg-white/10 text-white/84 hover:bg-white/18 hover:text-white",
              ].join(" ")}
            >
              {authLabel}
            </Link>

            {isAdmin ? (
              <Link
                href="/admin"
                onClick={onClose}
                aria-current={isAdminActive ? "page" : undefined}
                className={[
                  "inline-flex min-h-[3rem] w-full items-center justify-center rounded-full border px-4 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                  isAdminActive
                    ? "border-white/16 bg-white text-slate-950"
                    : "border-white/10 bg-white px-4 text-slate-950 hover:bg-white/90",
                ].join(" ")}
              >
                Admin Dashboard
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
