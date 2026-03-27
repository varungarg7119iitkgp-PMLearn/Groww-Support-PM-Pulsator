"use client";

import { Cloud } from "lucide-react";
import { FilterBar } from "@/components/shared/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";

export default function WordCloudPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          Word Cloud
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Most used words, top keywords, and top upvoted reviews
        </p>
      </div>

      <FilterBar />

      <EmptyState
        icon={Cloud}
        title="No word data yet"
        description="The word cloud and top keywords will generate from your review data. You'll see frequently used terms, keyword rankings, and the most upvoted reviews."
        action="Sync reviews to build the word cloud"
      />
    </div>
  );
}
