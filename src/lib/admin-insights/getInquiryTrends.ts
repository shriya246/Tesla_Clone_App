import "server-only";

import { getProductHref } from "@/lib/admin-products";
import { adminInquiryTypeLabels, adminItemTypeLabels } from "@/lib/admin-labels";
import { prisma } from "@/lib/prisma";

import {
  buildRecentDayBuckets,
  compareNumbersDesc,
  incrementTrendBucket,
} from "@/lib/admin-insights/utils";
import type { AdminInquiryTrendsData } from "@/types";

export async function getInquiryTrends(): Promise<AdminInquiryTrendsData> {
  try {
    const recentWindowStart = new Date();
    recentWindowStart.setDate(recentWindowStart.getDate() - 29);
    recentWindowStart.setHours(0, 0, 0, 0);

    const [allInquiries, recentInquiries] = await Promise.all([
      prisma.inquiry.findMany({
        select: {
          type: true,
          itemType: true,
          productSlug: true,
          createdAt: true,
        },
      }),
      prisma.inquiry.findMany({
        where: {
          createdAt: {
            gte: recentWindowStart,
          },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    const typeCounts = new Map<string, number>();
    const itemTypeCounts = new Map<string, number>();
    const productCounts = new Map<
      string,
      { count: number; itemType: string; productSlug: string }
    >();

    for (const inquiry of allInquiries) {
      typeCounts.set(inquiry.type, (typeCounts.get(inquiry.type) ?? 0) + 1);

      if (inquiry.itemType) {
        itemTypeCounts.set(
          inquiry.itemType,
          (itemTypeCounts.get(inquiry.itemType) ?? 0) + 1,
        );
      }

      if (inquiry.itemType && inquiry.productSlug) {
        const key = `${inquiry.itemType}:${inquiry.productSlug}`;
        const existing = productCounts.get(key);

        if (existing) {
          existing.count += 1;
        } else {
          productCounts.set(key, {
            count: 1,
            itemType: inquiry.itemType,
            productSlug: inquiry.productSlug,
          });
        }
      }
    }

    const recentDailyVolume = buildRecentDayBuckets(14);

    for (const inquiry of recentInquiries) {
      incrementTrendBucket(recentDailyVolume, inquiry.createdAt);
    }

    return {
      totalCount: allInquiries.length,
      recent30DayCount: recentInquiries.length,
      byType: [...typeCounts.entries()]
        .map(([key, count]) => ({
          key,
          label: adminInquiryTypeLabels[key as keyof typeof adminInquiryTypeLabels],
          count,
        }))
        .sort(
          (left, right) =>
            compareNumbersDesc(left.count, right.count) ||
            left.label.localeCompare(right.label),
        ),
      byItemType: [...itemTypeCounts.entries()]
        .map(([key, count]) => ({
          key,
          label: adminItemTypeLabels[key as keyof typeof adminItemTypeLabels],
          count,
        }))
        .sort(
          (left, right) =>
            compareNumbersDesc(left.count, right.count) ||
            left.label.localeCompare(right.label),
        ),
      topProductSlugs: [...productCounts.values()]
        .sort(
          (left, right) =>
            compareNumbersDesc(left.count, right.count) ||
            left.productSlug.localeCompare(right.productSlug),
        )
        .slice(0, 6)
        .map((entry) => ({
          key: `${entry.itemType}:${entry.productSlug}`,
          label: entry.productSlug,
          count: entry.count,
          href: getProductHref(
            entry.itemType as keyof typeof adminItemTypeLabels,
            entry.productSlug,
          ),
        })),
      recentDailyVolume,
    };
  } catch {
    return {
      totalCount: 0,
      recent30DayCount: 0,
      byType: [],
      byItemType: [],
      topProductSlugs: [],
      recentDailyVolume: buildRecentDayBuckets(14),
    };
  }
}
