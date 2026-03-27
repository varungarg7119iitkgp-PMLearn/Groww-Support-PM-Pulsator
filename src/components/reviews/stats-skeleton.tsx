"use client";

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-pulse">
      {/* Rating Histogram Skeleton */}
      <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
        <div className="h-4 w-36 rounded bg-[var(--color-bg-main)] mb-3" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5">
              <div className="h-4 w-8 rounded bg-[var(--color-bg-main)]" />
              <div className="flex-1 h-5 rounded-full bg-[var(--color-bg-main)]" />
              <div className="h-4 w-10 rounded bg-[var(--color-bg-main)]" />
            </div>
          ))}
        </div>
      </div>

      {/* NPS Skeleton */}
      <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
        <div className="h-4 w-28 rounded bg-[var(--color-bg-main)] mb-3" />
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 h-24 rounded-lg bg-[var(--color-bg-main)]" />
          <div className="h-20 rounded-lg bg-[var(--color-bg-main)]" />
          <div className="h-20 rounded-lg bg-[var(--color-bg-main)]" />
          <div className="col-span-2 h-16 rounded-lg bg-[var(--color-bg-main)]" />
        </div>
      </div>
    </div>
  );
}
