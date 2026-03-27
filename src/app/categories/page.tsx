"use client";

import { Tags } from "lucide-react";
import { FilterBar } from "@/components/shared/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          Categories
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          AI-identified themes and category distribution across Groww reviews
        </p>
      </div>

      <FilterBar />

      <EmptyState
        icon={Tags}
        title="No categories yet"
        description="Categories are automatically generated when reviews are processed by AI. You'll see category distribution charts and drill-down stats here."
        action="Categories will appear after AI processing"
      />
    </div>
  );
}
