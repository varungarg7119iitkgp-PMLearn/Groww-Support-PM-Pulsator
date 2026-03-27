"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import type { WordFreq } from "@/hooks/use-testimonials";

interface WordCloudViewProps {
  words: WordFreq[];
}

const CLOUD_COLORS = [
  "#00D09C", "#5367FF", "#F59E0B", "#F56565", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
  "#14B8A6", "#EF4444", "#A855F7", "#3B82F6",
];

export function WordCloudView({ words }: WordCloudViewProps) {
  const router = useRouter();

  const processedWords = useMemo(() => {
    if (words.length === 0) return [];

    const maxCount = words[0].count;
    const minCount = words[words.length - 1].count;
    const range = maxCount - minCount || 1;

    return words.map((w, i) => {
      const normalized = (w.count - minCount) / range;
      const fontSize = 12 + normalized * 36;
      const opacity = 0.5 + normalized * 0.5;
      const color = CLOUD_COLORS[i % CLOUD_COLORS.length];
      return { ...w, fontSize, opacity, color };
    });
  }, [words]);

  const handleWordClick = (word: string) => {
    router.push(`/?search=${encodeURIComponent(word)}`);
  };

  if (words.length === 0) return null;

  // Shuffle for visual variety while keeping consistent between renders
  const shuffled = useMemo(() => {
    const arr = [...processedWords];
    let seed = 42;
    for (let i = arr.length - 1; i > 0; i--) {
      seed = (seed * 16807 + 0) % 2147483647;
      const j = seed % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [processedWords]);

  return (
    <div className="rounded-xl border bg-[var(--color-bg-card)] p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
        Word Cloud
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 min-h-[200px] py-4">
        {shuffled.map((w) => (
          <button
            key={w.word}
            onClick={() => handleWordClick(w.word)}
            className="inline-block transition-all duration-200 hover:scale-110 cursor-pointer px-1"
            style={{
              fontSize: `${w.fontSize}px`,
              color: w.color,
              opacity: w.opacity,
              fontWeight: w.fontSize > 30 ? 700 : w.fontSize > 20 ? 600 : 400,
              lineHeight: 1.3,
            }}
            title={`${w.word}: ${w.count} occurrences`}
          >
            {w.word}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-[10px] text-[var(--color-text-secondary)]">
        Click any word to filter reviews containing it
      </p>
    </div>
  );
}
