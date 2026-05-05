"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import type { SearchFilterType, SearchSuggestion } from "@/types";

interface SearchInputProps {
  action: string;
  initialQuery?: string;
  placeholder: string;
  label: string;
  submitLabel?: string;
  hiddenParams?: Record<string, string | undefined>;
  suggestionType?: SearchFilterType;
  enableSuggestions?: boolean;
  variant?: "compact" | "hero";
  autoFocus?: boolean;
}

interface SearchSuggestionsResponse {
  suggestions: SearchSuggestion[];
}

function buildTargetHref(
  action: string,
  query: string,
  hiddenParams: Record<string, string | undefined> = {},
) {
  const searchParams = new URLSearchParams();
  const sanitizedQuery = query.trim();

  for (const [key, value] of Object.entries(hiddenParams)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  if (sanitizedQuery) {
    searchParams.set("q", sanitizedQuery);
  } else {
    searchParams.delete("q");
  }

  const serialized = searchParams.toString();

  return serialized ? `${action}?${serialized}` : action;
}

export function SearchInput({
  action,
  initialQuery = "",
  placeholder,
  label,
  submitLabel = "Search",
  hiddenParams,
  suggestionType = "all",
  enableSuggestions = true,
  variant = "compact",
  autoFocus = false,
}: SearchInputProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const deferredQuery = useDeferredValue(query);
  const shouldShowSuggestions = enableSuggestions && deferredQuery.trim().length >= 2;

  const suggestionHref = useMemo(
    () => buildTargetHref(action, query, hiddenParams),
    [action, hiddenParams, query],
  );

  useEffect(() => {
    if (!shouldShowSuggestions) {
      return;
    }

    const controller = new AbortController();
    const searchParams = new URLSearchParams({
      q: deferredQuery.trim(),
    });

    if (suggestionType !== "all") {
      searchParams.set("type", suggestionType);
    }

    fetch(`/api/search/suggestions?${searchParams.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return (await response.json()) as SearchSuggestionsResponse;
      })
      .then((result) => {
        if (!result) {
          setSuggestions([]);
          return;
        }

        setSuggestions(result.suggestions);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setSuggestions([]);
      });

    return () => {
      controller.abort();
    };
  }, [deferredQuery, shouldShowSuggestions, suggestionType]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isFocused]);

  const containerClasses =
    variant === "hero"
      ? "rounded-[1.9rem] border border-white/10 bg-black/28 p-3 shadow-halo backdrop-blur-xl"
      : "rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-2 shadow-halo backdrop-blur-sm";
  const inputClasses =
    variant === "hero"
      ? "h-14 rounded-[1.35rem] bg-transparent px-4 text-base text-white placeholder:text-white/38 focus:outline-none sm:px-5"
      : "h-12 rounded-[1.2rem] bg-transparent px-4 text-sm text-white placeholder:text-white/40 focus:outline-none";
  const submitClasses =
    variant === "hero"
      ? "inline-flex min-h-[3.5rem] items-center justify-center rounded-[1.35rem] bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
      : "inline-flex min-h-[3rem] items-center justify-center rounded-[1.2rem] bg-white px-4 text-sm font-medium text-slate-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70";
  const showSuggestionsPanel =
    isFocused && shouldShowSuggestions && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <form
        action={action}
        method="get"
        className={containerClasses}
        onSubmit={(event) => {
          event.preventDefault();
          const targetHref = buildTargetHref(action, query, hiddenParams);

          setIsFocused(false);
          startTransition(() => {
            router.push(targetHref);
          });
        }}
      >
        {Object.entries(hiddenParams ?? {}).map(([key, value]) =>
          value ? <input key={key} type="hidden" name={key} value={value} /> : null,
        )}

        <label className="sr-only" htmlFor={`${label}-${variant}`}>
          {label}
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.25rem] bg-black/16 ring-1 ring-inset ring-white/8">
            <span className="pl-4 text-xs font-medium uppercase tracking-[0.28em] text-white/40 sm:pl-5">
              Search
            </span>
            <input
              id={`${label}-${variant}`}
              name="q"
              type="search"
              autoComplete="off"
              autoFocus={autoFocus}
              value={query}
              placeholder={placeholder}
              aria-label={label}
              className={`min-w-0 flex-1 ${inputClasses}`}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setIsFocused(true)}
            />
          </div>

          <button type="submit" className={submitClasses} disabled={isPending}>
            {isPending ? "Searching..." : submitLabel}
          </button>
        </div>
      </form>

      {showSuggestionsPanel ? (
        <div className="absolute inset-x-0 top-full z-50 mt-3 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/96 shadow-halo backdrop-blur-xl">
          <div className="border-b border-white/8 px-4 py-3 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-white/42">
            Quick matches
          </div>

          <div className="max-h-96 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <Link
                key={suggestion.id}
                href={suggestion.href}
                className="flex items-center justify-between gap-4 border-b border-white/6 px-4 py-4 text-left transition hover:bg-white/[0.04]"
                onClick={() => setIsFocused(false)}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/72">
                      {suggestion.typeLabel}
                    </span>
                    <p className="truncate text-sm font-medium text-white">
                      {suggestion.title}
                    </p>
                  </div>
                </div>

                {suggestion.price ? (
                  <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/48">
                    {suggestion.price}
                  </span>
                ) : null}
              </Link>
            ))}

            <Link
              href={suggestionHref}
              className="flex items-center justify-between px-4 py-4 text-sm text-white/70 transition hover:bg-white/[0.04] hover:text-white"
              onClick={() => setIsFocused(false)}
            >
              <span>See all results for “{query.trim()}”</span>
              <span aria-hidden="true">/</span>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
