"use client";

export function ReviewListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[var(--color-bg-main)]" />
              <div>
                <div className="h-4 w-28 rounded bg-[var(--color-bg-main)]" />
                <div className="mt-1 h-3 w-36 rounded bg-[var(--color-bg-main)]" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-4 w-20 rounded bg-[var(--color-bg-main)]" />
              <div className="h-4 w-16 rounded-full bg-[var(--color-bg-main)]" />
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-3.5 w-full rounded bg-[var(--color-bg-main)]" />
            <div className="h-3.5 w-4/5 rounded bg-[var(--color-bg-main)]" />
            <div className="h-3.5 w-3/5 rounded bg-[var(--color-bg-main)]" />
          </div>
          <div className="mt-3 flex gap-1.5">
            <div className="h-5 w-16 rounded-full bg-[var(--color-bg-main)]" />
            <div className="h-5 w-20 rounded-full bg-[var(--color-bg-main)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
