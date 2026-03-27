"use client";

import { Zap } from "lucide-react";
import { FilterBar } from "@/components/shared/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";

export default function IdeationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          Ideation
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          AI-powered ideas, bug reports, and Jira integration
        </p>
      </div>

      <FilterBar />

      <EmptyState
        icon={Zap}
        title="Ideation engine ready"
        description="Generate product improvement ideas from negative reviews, create structured bug reports, and push Jira tickets — all powered by AI with approval gates."
        action="Available after reviews are synced and categorized"
      />
    </div>
  );
}
