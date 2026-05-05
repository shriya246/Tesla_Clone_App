"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import type { SearchSortOption } from "@/types";

interface SearchSortSelectProps {
  action: string;
  label: string;
  initialSort: SearchSortOption;
  defaultSort: SearchSortOption;
  preserveParams?: Record<string, string | undefined>;
  options: Array<{
    value: SearchSortOption;
    label: string;
  }>;
}

function buildTargetHref(
  action: string,
  sort: SearchSortOption,
  defaultSort: SearchSortOption,
  preserveParams: Record<string, string | undefined> = {},
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(preserveParams)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  if (sort !== defaultSort) {
    searchParams.set("sort", sort);
  } else {
    searchParams.delete("sort");
  }

  const serialized = searchParams.toString();

  return serialized ? `${action}?${serialized}` : action;
}

export function SearchSortSelect({
  action,
  label,
  initialSort,
  defaultSort,
  preserveParams,
  options,
}: SearchSortSelectProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-[0.65rem] font-medium uppercase tracking-[0.26em] text-white/40">
        {label}
      </span>
      <select
        aria-label={label}
        className="min-h-[3rem] rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-white shadow-halo backdrop-blur-sm focus:border-white/18 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
        defaultValue={initialSort}
        disabled={isPending}
        onChange={(event) => {
          const nextSort = event.target.value as SearchSortOption;
          const targetHref = buildTargetHref(
            action,
            nextSort,
            defaultSort,
            preserveParams,
          );

          startTransition(() => {
            router.push(targetHref);
          });
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
