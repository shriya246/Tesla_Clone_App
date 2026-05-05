import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { CatalogEmptyState } from "@/components/CatalogEmptyState";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { SearchSortSelect } from "@/components/search/SearchSortSelect";
import {
  globalSearchSortOptions,
  searchTypeOptions,
} from "@/lib/search/constants";
import { searchProducts } from "@/lib/search/searchProducts";
import {
  parseSearchSort,
  parseSearchType,
  sanitizeSearchQuery,
} from "@/lib/search/utils";
import { logSearchEvent } from "@/lib/search/logSearchEvent";
import { buildPageMetadata } from "@/lib/metadata";
import type { SearchFilterType, SearchSortOption } from "@/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPageMetadata({
  title: "Search | Tesla Inspired",
  description:
    "Search across Tesla-inspired vehicles, home energy products, and shop essentials from a single discovery experience.",
  path: "/search",
  noIndex: true,
});

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    sort?: string;
  }>;
}

function buildSearchHref(
  query: string,
  type: SearchFilterType,
  sort: SearchSortOption,
) {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.set("q", query);
  }

  if (type !== "all") {
    searchParams.set("type", type);
  }

  if (sort !== "relevance") {
    searchParams.set("sort", sort);
  }

  const serialized = searchParams.toString();

  return serialized ? `/search?${serialized}` : "/search";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = sanitizeSearchQuery(params.q);
  const activeType = parseSearchType(params.type);
  const activeSort = parseSearchSort(params.sort, "relevance");
  const [searchState, session] = await Promise.all([
    searchProducts({
      query,
      type: activeType,
      sort: activeSort,
    }),
    auth().catch(() => null),
  ]);

  if (query.length >= 2) {
    await logSearchEvent({
      userId: session?.user?.id,
      query: typeof params.q === "string" ? params.q : query,
      normalizedQuery: query,
      type: activeType,
      resultCount: searchState.totalCount,
      topResultType: searchState.results[0]?.type,
    });
  }

  const totalAcrossTypes =
    searchState.counts.vehicle +
    searchState.counts.energy +
    searchState.counts.shop;
  const hasActiveFilters = query.length > 0 || activeType !== "all" || activeSort !== "relevance";
  const resultTitle = query
    ? `Results for “${query}”`
    : "Browse the Tesla-inspired catalog.";
  const resultDescription = query
    ? `${searchState.totalCount} result${
        searchState.totalCount === 1 ? "" : "s"
      } ${activeType === "all" ? "matched across the catalog." : "matched in this category."}`
    : `${totalAcrossTypes} products are searchable across Vehicles, Energy, and Shop.`;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white">
        <section className="section-shell relative overflow-hidden pt-32 pb-16 lg:pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_34%)]" />

          <div className="relative mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-black/20 p-6 shadow-halo backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                Search
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Find the right product faster.
              </h1>
              <p className="mt-5 text-sm leading-7 text-white/70 sm:text-base">
                Search across vehicles, home energy products, and shop items from
                a single premium discovery surface built on top of the live catalog.
              </p>
            </div>

            <div className="mt-8">
              <SearchInput
                action="/search"
                autoFocus
                hiddenParams={{
                  sort: activeSort !== "relevance" ? activeSort : undefined,
                  type: activeType !== "all" ? activeType : undefined,
                }}
                initialQuery={query}
                key={`search:${query}:${activeType}:${activeSort}`}
                label="Search the Tesla-inspired catalog"
                placeholder="Search vehicles, Powerwall, Wall Connector, and more"
                submitLabel="Search catalog"
                variant="hero"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {searchTypeOptions.map((option) => {
                const count =
                  option.value === "all"
                    ? totalAcrossTypes
                    : searchState.counts[option.value];
                const isActive = option.value === activeType;

                return (
                  <Link
                    key={option.value}
                    href={buildSearchHref(query, option.value, activeSort)}
                    className={[
                      "inline-flex min-h-[3rem] items-center justify-center rounded-full border px-5 text-sm font-medium transition",
                      isActive
                        ? "border-white/16 bg-white text-slate-950"
                        : "border-white/10 bg-white/10 text-white/82 hover:bg-white/18 hover:text-white",
                    ].join(" ")}
                  >
                    {option.label} ({count})
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-shell border-t border-white/8 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/42">
                  Discovery Results
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {resultTitle}
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">
                  {resultDescription}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-[240px_auto] sm:items-end">
                <SearchSortSelect
                  action="/search"
                  defaultSort="relevance"
                  initialSort={activeSort}
                  label="Sort"
                  options={globalSearchSortOptions}
                  preserveParams={{
                    q: query || undefined,
                    type: activeType !== "all" ? activeType : undefined,
                  }}
                />

                {hasActiveFilters ? (
                  <Link
                    href="/search"
                    className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 text-sm font-medium text-white/82 transition hover:bg-white/18 hover:text-white"
                  >
                    Reset search
                  </Link>
                ) : null}
              </div>
            </div>

            {searchState.results.length === 0 ? (
              <div className="mt-10">
                <CatalogEmptyState
                  eyebrow="Search"
                  title="No matching products found."
                  description="Try a broader term, switch categories, or reset the search to browse the full catalog."
                  primaryHref="/search"
                  primaryLabel="Browse all products"
                  secondaryHref="/vehicles"
                  secondaryLabel="Explore vehicles"
                />
              </div>
            ) : (
              <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {searchState.results.map((item) => (
                  <SearchResultCard key={item.id} item={item} />
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
