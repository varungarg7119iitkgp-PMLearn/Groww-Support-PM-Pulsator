"use client";

export function IdeationSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Idea Recommender skeleton */}
      <div className="rounded-xl border bg-[var(--color-bg-card)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-[var(--color-bg-main)]" />
            <div className="h-4 w-32 rounded bg-[var(--color-bg-main)]" />
          </div>
          <div className="h-8 w-28 rounded-lg bg-[var(--color-bg-main)]" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-[var(--color-bg-main)]" />
          ))}
        </div>
      </div>

      {/* Bug Reporter skeleton */}
      <div className="rounded-xl border bg-[var(--color-bg-card)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-[var(--color-bg-main)]" />
            <div className="h-4 w-24 rounded bg-[var(--color-bg-main)]" />
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-[var(--color-bg-main)]" />
          ))}
        </div>
      </div>
    </div>
  );
}
