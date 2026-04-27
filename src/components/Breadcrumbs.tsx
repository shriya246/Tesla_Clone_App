import Link from "next/link";
import { formatSlug } from "@/lib/formatSlug";
import type { BreadcrumbItem } from "@/types";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

function getLabel(item: BreadcrumbItem) {
  if (item.label) {
    return item.label;
  }

  if (!item.href) {
    return "";
  }

  const segment = item.href.split("/").filter(Boolean).pop() ?? "";

  return formatSlug(segment);
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
      {items.map((item, index) => {
        const label = getLabel(item);
        const isLast = index === items.length - 1 || !item.href;

        return (
          <div key={`${label}-${index}`} className="flex items-center gap-2">
            {isLast ? (
              <span
                aria-current="page"
                className="text-xs font-medium uppercase tracking-[0.28em] text-white/72"
              >
                {label}
              </span>
            ) : (
              <Link
                href={item.href!}
                className="text-xs font-medium uppercase tracking-[0.28em] text-white/48 transition hover:text-white"
              >
                {label}
              </Link>
            )}

            {!isLast ? (
              <span
                aria-hidden="true"
                className="text-xs uppercase tracking-[0.28em] text-white/30"
              >
                /
              </span>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
