import { NextResponse } from "next/server";

import { getSearchSuggestions } from "@/lib/search/getSearchSuggestions";
import { parseSearchType, sanitizeSearchQuery } from "@/lib/search/utils";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = sanitizeSearchQuery(url.searchParams.get("q"));
  const type = parseSearchType(url.searchParams.get("type"));
  const suggestions = await getSearchSuggestions({
    query,
    type,
    limit: 6,
  });

  return NextResponse.json(
    {
      suggestions,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
