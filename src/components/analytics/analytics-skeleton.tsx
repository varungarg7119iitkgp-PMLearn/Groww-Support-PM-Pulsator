"use client";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
            <div className="flex justify-between mb-2">
              <div className="h-3 w-16 rounded bg-[var(--color-bg-main)]" />
              <div className="h-8 w-8 rounded-lg bg-[var(--color-bg-main)]" />
            </div>
            <div className="h-7 w-20 rounded bg-[var(--color-bg-main)]" />
            <div className="mt-1 h-3 w-12 rounded bg-[var(--color-bg-main)]" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm h-[240px]" />
        <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm h-[240px]" />
      </div>

      {/* Trend */}
      <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm h-[360px]" />

      {/* Category distribution + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm h-[360px]" />
        <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm h-[360px]" />
      </div>
    </div>
  );
}
