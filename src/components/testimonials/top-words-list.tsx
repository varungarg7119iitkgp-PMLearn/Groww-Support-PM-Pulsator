"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import type { WordFreq } from "@/hooks/use-testimonials";

interface TopWordsListProps {
  words: WordFreq[];
}

const BAR_COLORS = [
  "#00D09C", "#5367FF", "#F59E0B", "#F56565", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

export function TopWordsList({ words }: TopWordsListProps) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  if (words.length === 0) return null;

  const displayed = showAll ? words : words.slice(0, 20);
  const maxCount = words[0]?.count || 1;

  return (
    <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Top Keywords
        </h3>
        {words.length > 20 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-0.5 text-xs font-medium text-[var(--color-accent)] hover:underline"
          >
            {showAll ? (
              <>Show Top 20 <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>Show All ({words.length}) <ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        )}
      </div>

      <div className="space-y-1">
        {displayed.map((w, i) => (
          <button
            key={w.word}
            onClick={() => router.push(`/?search=${encodeURIComponent(w.word)}`)}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[var(--color-bg-hover)] group"
          >
            <span className="w-6 text-right text-[10px] font-bold text-[var(--color-text-secondary)]">
              {i + 1}
            </span>
            <span className="flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-text-primary)] block truncate">
                {w.word}
              </span>
              <div className="mt-0.5 relative h-1 w-full rounded-full bg-[var(--color-bg-main)] overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{
                    width: `${(w.count / maxCount) * 100}%`,
                    background: BAR_COLORS[i % BAR_COLORS.length],
                  }}
                />
              </div>
            </span>
            <span className="shrink-0 text-xs font-bold text-[var(--color-text-primary)]">
              {w.count}
            </span>
            <ChevronRight className="h-3 w-3 text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
