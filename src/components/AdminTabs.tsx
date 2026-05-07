"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    label: "Overview",
    href: "/admin",
  },
  {
    label: "Products",
    href: "/admin/products",
  },
  {
    label: "Insights",
    href: "/admin/insights",
  },
  {
    label: "Ranking",
    href: "/admin/ranking",
  },
  {
    label: "Flags",
    href: "/admin/flags",
  },
  {
    label: "Operations",
    href: "/admin/operations",
  },
  {
    label: "Inquiries",
    href: "/admin/inquiries",
  },
];

function isTabActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin sections"
      className="mt-8 flex flex-wrap gap-3 border-t border-white/8 pt-6"
    >
      {tabs.map((tab) => {
        const isActive = isTabActive(pathname, tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "inline-flex min-h-[2.75rem] items-center justify-center rounded-full border px-4 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
              isActive
                ? "border-white/16 bg-white/12 text-white"
                : "border-white/10 bg-black/24 text-white/72 hover:border-white/18 hover:bg-white/10 hover:text-white",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
