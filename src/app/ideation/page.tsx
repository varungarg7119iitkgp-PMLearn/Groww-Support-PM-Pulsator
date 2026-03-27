"use client";

import { Zap } from "lucide-react";
import { FilterBar } from "@/components/shared/filter-bar";
import { IdeaRecommender } from "@/components/ideation/idea-recommender";
import { BugReporter } from "@/components/ideation/bug-reporter";

export default function IdeationPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-5 w-5 text-[var(--color-accent)]" />
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Ideation
          </h2>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          AI-powered product ideas, bug reports, and reply generation from user reviews
        </p>
      </div>

      <FilterBar />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <IdeaRecommender />
        <BugReporter />
      </div>
    </div>
  );
}
