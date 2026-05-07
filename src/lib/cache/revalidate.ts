import "server-only";

import * as Sentry from "@sentry/nextjs";
import { revalidatePath, revalidateTag } from "next/cache";

import { getProductMutationCacheTags, getRankingCacheTags } from "@/lib/cache/tags";

export function revalidateCacheTags(tags: string[]) {
  const uniqueTags = [...new Set(tags)];

  for (const tag of uniqueTags) {
    try {
      revalidateTag(tag, "max");
    } catch (error) {
      Sentry.captureException(error);
      console.error(`Failed to revalidate cache tag ${tag}.`, error);
    }
  }

  return uniqueTags;
}

export function revalidateCachePaths(paths: string[]) {
  const uniquePaths = [...new Set(paths)];

  for (const path of uniquePaths) {
    try {
      revalidatePath(path);
    } catch (error) {
      Sentry.captureException(error);
      console.error(`Failed to revalidate cache path ${path}.`, error);
    }
  }

  return uniquePaths;
}

export function revalidateProductMutationCache(input?: {
  itemType?: string | null;
  paths?: string[];
}) {
  return {
    paths: input?.paths ? revalidateCachePaths(input.paths) : [],
    tags: revalidateCacheTags(getProductMutationCacheTags(input?.itemType)),
  };
}

export function revalidateRankingCache(paths: string[] = []) {
  return {
    paths: revalidateCachePaths(paths),
    tags: revalidateCacheTags(getRankingCacheTags()),
  };
}
