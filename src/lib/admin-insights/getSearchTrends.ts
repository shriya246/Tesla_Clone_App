import "server-only";

import { adminItemTypeLabels, adminSearchScopeLabels } from "@/lib/admin-labels";
import { prisma } from "@/lib/prisma";

import {
  averageFromTotal,
  buildRecentDayBuckets,
  compareNumbersDesc,
  incrementTrendBucket,
} from "@/lib/admin-insights/utils";
import type { AdminSearchTrendsData, SearchEventScopeValue } from "@/types";

export async function getSearchTrends(): Promise<AdminSearchTrendsData> {
  try {
    const recentWindowStart = new Date();
    recentWindowStart.setDate(recentWindowStart.getDate() - 29);
    recentWindowStart.setHours(0, 0, 0, 0);

    const [totalCount, recentSearches] = await Promise.all([
      prisma.searchEvent.count(),
      prisma.searchEvent.findMany({
        where: {
          createdAt: {
            gte: recentWindowStart,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          normalizedQuery: true,
          query: true,
          scope: true,
          resultCount: true,
          topResultItemType: true,
          createdAt: true,
        },
      }),
    ]);

    const queryCounts = new Map<
      string,
      {
        label: string;
        count: number;
        totalResults: number;
        zeroResultCount: number;
        lastSearchedAt: Date;
        scopeCounts: Map<SearchEventScopeValue, number>;
        topResultCounts: Map<string, number>;
      }
    >();
    const scopeCounts = new Map<
      SearchEventScopeValue,
      { count: number; totalResults: number }
    >();
    const recentDailyVolume = buildRecentDayBuckets(14);
    let zeroResultCount = 0;

    for (const event of recentSearches) {
      incrementTrendBucket(recentDailyVolume, event.createdAt);

      if (event.resultCount === 0) {
        zeroResultCount += 1;
      }

      const scope = event.scope as SearchEventScopeValue;
      const scopeEntry = scopeCounts.get(scope);

      if (scopeEntry) {
        scopeEntry.count += 1;
        scopeEntry.totalResults += event.resultCount;
      } else {
        scopeCounts.set(scope, {
          count: 1,
          totalResults: event.resultCount,
        });
      }

      const existing = queryCounts.get(event.normalizedQuery);

      if (existing) {
        existing.count += 1;
        existing.totalResults += event.resultCount;
        existing.zeroResultCount += event.resultCount === 0 ? 1 : 0;

        if (event.createdAt > existing.lastSearchedAt) {
          existing.lastSearchedAt = event.createdAt;
          existing.label = event.query;
        }

        existing.scopeCounts.set(scope, (existing.scopeCounts.get(scope) ?? 0) + 1);

        if (event.topResultItemType) {
          existing.topResultCounts.set(
            event.topResultItemType,
            (existing.topResultCounts.get(event.topResultItemType) ?? 0) + 1,
          );
        }

        continue;
      }

      const scopeMap = new Map<SearchEventScopeValue, number>();
      scopeMap.set(scope, 1);

      const topResultCounts = new Map<string, number>();

      if (event.topResultItemType) {
        topResultCounts.set(event.topResultItemType, 1);
      }

      queryCounts.set(event.normalizedQuery, {
        label: event.query,
        count: 1,
        totalResults: event.resultCount,
        zeroResultCount: event.resultCount === 0 ? 1 : 0,
        lastSearchedAt: event.createdAt,
        scopeCounts: scopeMap,
        topResultCounts,
      });
    }

    return {
      totalCount,
      recent30DayCount: recentSearches.length,
      zeroResultCount,
      topQueries: [...queryCounts.entries()]
        .sort(
          (left, right) =>
            compareNumbersDesc(left[1].count, right[1].count) ||
            left[0].localeCompare(right[0]),
        )
        .slice(0, 8)
        .map(([normalizedQuery, trend]) => {
          const primaryScope =
            [...trend.scopeCounts.entries()].sort(
              (left, right) => compareNumbersDesc(left[1], right[1]),
            )[0]?.[0] ?? "ALL";
          const topResultItemType =
            [...trend.topResultCounts.entries()].sort(
              (left, right) => compareNumbersDesc(left[1], right[1]),
            )[0]?.[0];

          return {
            normalizedQuery,
            label: trend.label,
            count: trend.count,
            averageResultCount: averageFromTotal(
              trend.totalResults,
              trend.count,
            ),
            zeroResultCount: trend.zeroResultCount,
            scopeLabel: adminSearchScopeLabels[primaryScope],
            topResultLabel: topResultItemType
              ? adminItemTypeLabels[
                  topResultItemType as keyof typeof adminItemTypeLabels
                ]
              : undefined,
            lastSearchedAt: trend.lastSearchedAt,
          };
        }),
      byScope: [...scopeCounts.entries()]
        .map(([scope, totals]) => ({
          scope,
          label: adminSearchScopeLabels[scope],
          count: totals.count,
          averageResultCount: averageFromTotal(
            totals.totalResults,
            totals.count,
          ),
        }))
        .sort(
          (left, right) =>
            compareNumbersDesc(left.count, right.count) ||
            left.label.localeCompare(right.label),
        ),
      recentDailyVolume,
    };
  } catch {
    return {
      totalCount: 0,
      recent30DayCount: 0,
      zeroResultCount: 0,
      topQueries: [],
      byScope: [],
      recentDailyVolume: buildRecentDayBuckets(14),
    };
  }
}
