import Link from "next/link";

import { SearchInput } from "@/components/search/SearchInput";
import { SearchSortSelect } from "@/components/search/SearchSortSelect";
import type { SearchFilterType, SearchSortOption } from "@/types";

interface CatalogToolbarProps {
  action: string;
  title: string;
  description: string;
  query: string;
  sort: SearchSortOption;
  defaultSort?: SearchSortOption;
  itemCount: number;
  singularLabel: string;
  pluralLabel: string;
  placeholder: string;
  suggestionType: SearchFilterType;
  sortOptions: Array<{
    value: SearchSortOption;
    label: string;
  }>;
  searchAllHref?: string;
  searchAllLabel?: string;
}

function buildResetHref(action: string) {
  return action;
}

export function CatalogToolbar({
  action,
  title,
  description,
  query,
  sort,
  defaultSort = "featured",
  itemCount,
  singularLabel,
  pluralLabel,
  placeholder,
  suggestionType,
  sortOptions,
  searchAllHref = "/search",
  searchAllLabel = "Search all products",
}: CatalogToolbarProps) {
  const hasActiveFilters = query.length > 0 || sort !== defaultSort;
  const itemSummary = `${itemCount} ${
    itemCount === 1 ? singularLabel : pluralLabel
  } ${query ? "matched" : "available"}`;

  return (
    <section className="section-shell border-t border-white/8 bg-slate-950 py-8 lg:py-10">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
              Discovery
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/68 sm:text-base">
              {description}
            </p>
            <p className="mt-4 text-[0.7rem] font-medium uppercase tracking-[0.26em] text-white/40">
              {itemSummary}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={searchAllHref}
              className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/84 transition hover:bg-white/18 hover:text-white"
            >
              {searchAllLabel}
            </Link>

            {hasActiveFilters ? (
              <Link
                href={buildResetHref(action)}
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-black/24 px-5 text-sm font-medium text-white/72 transition hover:border-white/16 hover:bg-white/[0.05] hover:text-white"
              >
                Reset filters
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
          <SearchInput
            action={action}
            hiddenParams={sort !== defaultSort ? { sort } : undefined}
            initialQuery={query}
            key={`${action}:${query}:${sort}`}
            label={title}
            placeholder={placeholder}
            suggestionType={suggestionType}
            submitLabel="Apply"
          />

          <SearchSortSelect
            action={action}
            defaultSort={defaultSort}
            initialSort={sort}
            label="Sort"
            options={sortOptions}
            preserveParams={query ? { q: query } : undefined}
          />
        </div>
      </div>
    </section>
  );
}
