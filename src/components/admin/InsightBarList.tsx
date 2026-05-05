import Link from "next/link";

interface InsightBarListItem {
  key: string;
  label: string;
  count: number;
  href?: string;
  secondaryLabel?: string;
}

interface InsightBarListProps {
  items: InsightBarListItem[];
  emptyTitle: string;
  emptyDescription: string;
}

export function InsightBarList({
  items,
  emptyTitle,
  emptyDescription,
}: InsightBarListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-white/12 bg-black/24 p-6 text-center">
        <p className="text-lg font-medium text-white">{emptyTitle}</p>
        <p className="mt-3 text-sm leading-6 text-white/62">{emptyDescription}</p>
      </div>
    );
  }

  const maxCount = Math.max(...items.map((item) => item.count), 1);

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const content = (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{item.label}</p>
                {item.secondaryLabel ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/42">
                    {item.secondaryLabel}
                  </p>
                ) : null}
              </div>
              <p className="shrink-0 text-sm font-medium text-white">{item.count}</p>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-white/80"
                style={{
                  width: `${Math.max((item.count / maxCount) * 100, 10)}%`,
                }}
              />
            </div>
          </>
        );

        if (item.href) {
          return (
            <Link
              key={item.key}
              href={item.href}
              className="block rounded-[1.5rem] border border-white/8 bg-black/24 p-5 transition hover:border-white/16 hover:bg-white/[0.05]"
            >
              {content}
            </Link>
          );
        }

        return (
          <div
            key={item.key}
            className="rounded-[1.5rem] border border-white/8 bg-black/24 p-5"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
