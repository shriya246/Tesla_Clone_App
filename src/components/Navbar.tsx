"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileMenu } from "@/components/MobileMenu";
import type { NavigationItem, UtilityItem } from "@/types";

const navItems: NavigationItem[] = [
  { label: "Vehicles", href: "/vehicles" },
  { label: "Energy", href: "/energy" },
  { label: "Charging", href: "/charging" },
  { label: "Discover", href: "/discover" },
  { label: "Shop", href: "/shop" },
];

const utilityItems: UtilityItem[] = [
  { label: "Help", symbol: "?" },
  { label: "Language", symbol: "EN" },
];

function isRouteActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const authHref = session?.user ? "/account" : "/signin";
  const authLabel = session?.user ? "Account" : "Sign In";
  const isAdmin = session?.user?.role === "ADMIN";
  const isSearchActive = isRouteActive(pathname, "/search");
  const isAccountActive = isRouteActive(pathname, authHref);
  const isAdminActive = isRouteActive(pathname, "/admin");

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-black/20 px-4 py-3 shadow-halo backdrop-blur-xl sm:px-6">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-tesla text-white"
            aria-label="Tesla Inspired Landing"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            TESLA
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-white/80 lg:flex">
            {navItems.map((item) => {
              const isActive = isRouteActive(pathname, item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "rounded-full px-3 py-2 transition",
                    isActive
                      ? "bg-white/14 text-white"
                      : "hover:bg-white/8 hover:text-white",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/search"
                aria-current={isSearchActive ? "page" : undefined}
                className={[
                  "inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition",
                  isSearchActive
                    ? "border-white/16 bg-white text-slate-950"
                    : "border-white/10 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white",
                ].join(" ")}
              >
                Search
              </Link>

              {utilityItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  aria-label={item.label}
                  className="inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-3 text-sm text-white/80 transition hover:bg-white/20 hover:text-white"
                >
                  <span aria-hidden="true">{item.symbol}</span>
                </button>
              ))}

              <Link
                href={authHref}
                aria-current={isAccountActive ? "page" : undefined}
                className={[
                  "inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition",
                  isAccountActive
                    ? "border-white/16 bg-white/14 text-white"
                    : "border-white/10 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white",
                ].join(" ")}
              >
                {authLabel}
              </Link>

              {isAdmin ? (
                <Link
                  href="/admin"
                  aria-current={isAdminActive ? "page" : undefined}
                  className={[
                    "inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition",
                    isAdminActive
                      ? "border-white/16 bg-white text-slate-950"
                      : "border-white/10 bg-black/24 text-white/76 hover:border-white/18 hover:bg-white/12 hover:text-white",
                  ].join(" ")}
                >
                  Admin
                </Link>
              ) : null}
            </div>

            <button
              type="button"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/10 px-4 text-sm font-medium text-white/80 transition hover:bg-white/20 hover:text-white lg:hidden"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            >
              {isMobileMenuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-navigation">
        <MobileMenu
          isOpen={isMobileMenuOpen}
          items={navItems}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>
    </>
  );
}
