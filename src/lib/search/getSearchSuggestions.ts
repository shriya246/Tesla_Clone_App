import "server-only";

import type { SearchFilterType, SearchSuggestion } from "@/types";
import { searchProducts } from "@/lib/search/searchProducts";
import { sanitizeSearchQuery } from "@/lib/search/utils";

interface GetSearchSuggestionsInput {
  query?: string;
  type?: SearchFilterType;
  limit?: number;
}

export async function getSearchSuggestions({
  query,
  type = "all",
  limit = 6,
}: GetSearchSuggestionsInput = {}): Promise<SearchSuggestion[]> {
  const sanitizedQuery = sanitizeSearchQuery(query);

  if (sanitizedQuery.length < 2) {
    return [];
  }

  const results = await searchProducts({
    query: sanitizedQuery,
    type,
    sort: "relevance",
    limit,
  });

  return results.results.map((item) => ({
    id: item.id,
    type: item.type,
    typeLabel: item.typeLabel,
    href: item.href,
    title: item.title,
    price: item.price,
  }));
}
