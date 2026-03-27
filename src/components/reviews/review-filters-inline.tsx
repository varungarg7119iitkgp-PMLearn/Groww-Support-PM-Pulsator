"use client";

import { Search, X, SlidersHorizontal } from "lucide-react";

interface ReviewFiltersInlineProps {
  sentiment: string | null;
  category: string | null;
  search: string;
  onSentimentChange: (s: string | null) => void;
  onCategoryChange: (c: string | null) => void;
  onSearchChange: (s: string) => void;
  categories: { slug: string; name: string }[];
}

const SENTIMENTS = [
  { id: null, label: "All" },
  { id: "positive", label: "Positive" },
  { id: "negative", label: "Negative" },
  { id: "neutral", label: "Neutral" },
] as const;

export function ReviewFiltersInline({
  sentiment,
  category,
  search,
  onSentimentChange,
  onCategoryChange,
  onSearchChange,
  categories,
}: ReviewFiltersInlineProps) {
  const hasActiveFilters = sentiment || category || search;

  return (
    <div className="space-y-3">
      {/* Search + Clear */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reviews..."
            className="w-full rounded-lg border bg-[var(--color-bg-card)] py-2 pl-10 pr-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-3.5 w-3.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]" />
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={() => {
              onSentimentChange(null);
              onCategoryChange(null);
              onSearchChange("");
            }}
            className="flex items-center gap-1 rounded-lg border px-3 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-negative)] transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Sentiment Pills */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
          <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
            Sentiment
          </span>
        </div>
        <div className="flex gap-1">
          {SENTIMENTS.map((s) => (
            <button
              key={s.id ?? "all"}
              onClick={() => onSentimentChange(s.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                sentiment === s.id
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-bg-main)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category active filter indicator */}
      {category && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
            Category
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-accent)]">
            {categories.find((c) => c.slug === category)?.name || category}
            <button
              onClick={() => onCategoryChange(null)}
              className="ml-0.5 hover:text-[var(--color-negative)]"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
