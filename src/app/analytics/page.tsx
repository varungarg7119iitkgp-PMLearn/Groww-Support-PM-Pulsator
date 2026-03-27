"use client";

import { BarChart3 } from "lucide-react";
import { FilterBar } from "@/components/shared/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          Analytics
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Groww app metrics, sentiment analysis, and trend insights
        </p>
      </div>

      <FilterBar />

      <EmptyState
        icon={BarChart3}
        title="No analytics data"
        description="Analytics will populate once reviews are synced and categorized by AI. You'll see total reviews, average rating, sentiment breakdown, and trend charts."
        action="Sync reviews to generate analytics"
      />
    </div>
  );
}
