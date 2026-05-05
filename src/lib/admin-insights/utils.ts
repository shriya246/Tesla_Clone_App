import type { AdminTimeTrendPoint } from "@/types";

export function compareNumbersDesc(left: number, right: number) {
  return right - left;
}

export function buildRecentDayBuckets(days: number): AdminTimeTrendPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));

    return {
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count: 0,
    };
  });
}

export function incrementTrendBucket(
  buckets: AdminTimeTrendPoint[],
  createdAt: Date,
) {
  const label = createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const bucket = buckets.find((entry) => entry.label === label);

  if (bucket) {
    bucket.count += 1;
  }
}

export function averageFromTotal(total: number, count: number) {
  if (count === 0) {
    return 0;
  }

  return Math.round((total / count) * 10) / 10;
}
