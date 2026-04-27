import Link from "next/link";
import type { FooterLink } from "@/types";

const footerLinks: FooterLink[] = [
  { label: "Home", href: "/" },
  { label: "Vehicles", href: "/vehicles" },
  { label: "Energy", href: "/energy" },
  { label: "Charging", href: "/charging" },
  { label: "Discover", href: "/discover" },
  { label: "Shop", href: "/shop" },
];

export function Footer() {
  return (
    <footer className="section-shell border-t border-white/8 bg-slate-950 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-halo backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-white">
              (c) 2026 Tesla Inspired Landing
            </p>
            <p className="mt-3 text-sm leading-6 text-white/60">
              This frontend-only concept is designed for interface exploration.
              Product imagery, pricing, availability, and feature references are
              placeholder content intended for UI development and demo use.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-white/70">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="border-t border-white/8 pt-5 text-xs leading-6 uppercase tracking-[0.16em] text-white/38">
          Tesla-inspired aesthetic. Multi-route frontend build. Tailwind CSS.
          Next.js App Router. TypeScript. Responsive and modular by design.
        </p>
      </div>
    </footer>
  );
}
