"use client";

import { Star } from "lucide-react";

interface RatingHistogramProps {
  distribution: Record<number, number>;
  total: number;
  activeRating: number | null;
  onRatingClick: (rating: number | null) => void;
}

export function RatingHistogram({
  distribution,
  total,
  activeRating,
  onRatingClick,
}: RatingHistogramProps) {
  const maxCount = Math.max(...Object.values(distribution), 1);
  const ratings = [5, 4, 3, 2, 1];

  return (
    <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
        Rating Distribution
      </h3>
      <div className="space-y-2">
        {ratings.map((star) => {
          const count = distribution[star] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          const barWidth = total > 0 ? (count / maxCount) * 100 : 0;
          const isActive = activeRating === star;

          return (
            <button
              key={star}
              onClick={() => onRatingClick(isActive ? null : star)}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-all hover:bg-[var(--color-bg-hover)] ${
                isActive ? "bg-[var(--color-bg-hover)] ring-1 ring-[var(--color-accent)]" : ""
              }`}
            >
              <span className="flex w-8 items-center gap-0.5 text-xs font-semibold text-[var(--color-text-primary)]">
                {star}
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              </span>
              <div className="relative flex-1 h-5 rounded-full bg-[var(--color-bg-main)] overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{
                    width: `${barWidth}%`,
                    background:
                      star >= 4
                        ? "var(--color-positive)"
                        : star === 3
                        ? "var(--color-warning)"
                        : "var(--color-negative)",
                  }}
                />
              </div>
              <span className="w-10 text-right text-xs font-medium text-[var(--color-text-secondary)]">
                {count}
              </span>
              <span className="w-12 text-right text-[10px] text-[var(--color-text-secondary)]">
                {pct.toFixed(1)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
