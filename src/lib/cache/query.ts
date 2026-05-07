import "server-only";

import { cache } from "react";
import { unstable_cache as nextCache } from "next/cache";

interface CachedQueryOptions {
  revalidate?: number | false;
  tags?: string[];
}

export function createCachedQuery<TArgs extends unknown[], TResult>(
  query: (...args: TArgs) => Promise<TResult>,
  keyParts: string[],
  options: CachedQueryOptions = {},
) {
  const cachedQuery = nextCache(query, keyParts, options);

  return cache((...args: TArgs) => cachedQuery(...args));
}
