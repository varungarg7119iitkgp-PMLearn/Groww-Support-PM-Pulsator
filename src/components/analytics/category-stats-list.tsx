"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { CategoryDist } from "@/hooks/use-analytics";

interface CategoryStatsListProps {
  data: CategoryDist[];
  total: number;
}

const COLORS = [
  "#00D09C", "#5367FF", "#F59E0B", "#F56565", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
  "#14B8A6", "#EF4444", "#A855F7", "#3B82F6",
];

export function CategoryStatsList({ data, total }: CategoryStatsListProps) {
  const router = useRouter();

  if (data.length === 0) return null;

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
        Category Stats
      </h3>
      <div className="space-y-1.5">
        {data.map((cat, i) => (
          <button
            key={cat.slug}
            onClick={() => router.push(`/?category=${cat.slug}`)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--color-bg-hover)] group"
          >
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-text-primary)] truncate block">
                {cat.name}
              </span>
              <div className="mt-1 relative h-1.5 w-full rounded-full bg-[var(--color-bg-main)] overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{
                    width: `${(cat.count / maxCount) * 100}%`,
                    background: COLORS[i % COLORS.length],
                  }}
                />
              </div>
            </span>
            <span className="shrink-0 text-xs font-bold text-[var(--color-text-primary)]">
              {cat.count}
            </span>
            <span className="shrink-0 text-[10px] text-[var(--color-text-secondary)] w-10 text-right">
              {cat.percent}%
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
