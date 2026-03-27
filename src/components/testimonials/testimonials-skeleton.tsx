"use client";

export function TestimonialsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
            <div className="flex justify-between mb-2">
              <div className="h-3 w-20 rounded bg-[var(--color-bg-main)]" />
              <div className="h-8 w-8 rounded-lg bg-[var(--color-bg-main)]" />
            </div>
            <div className="h-7 w-16 rounded bg-[var(--color-bg-main)]" />
          </div>
        ))}
      </div>

      {/* Word Cloud */}
      <div className="rounded-xl border bg-[var(--color-bg-card)] p-6 shadow-sm h-[280px]" />

      {/* Top Words + Upvoted */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm h-[400px]" />
        <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm h-[400px]" />
      </div>
    </div>
  );
}
