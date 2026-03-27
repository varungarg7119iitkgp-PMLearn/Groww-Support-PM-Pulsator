"use client";

import { BarChart3 } from "lucide-react";
import { FilterBar } from "@/components/shared/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricsBar } from "@/components/analytics/metrics-bar";
import { CategoryChart } from "@/components/analytics/category-chart";
import { SentimentChart } from "@/components/analytics/sentiment-chart";
import { TrendChart } from "@/components/analytics/trend-chart";
import { CategoryStatsList } from "@/components/analytics/category-stats-list";
import { AnalyticsSkeleton } from "@/components/analytics/analytics-skeleton";
import { useAnalytics } from "@/hooks/use-analytics";

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  const hasData = data && data.metrics.total > 0;

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

      {isLoading ? (
        <AnalyticsSkeleton />
      ) : !hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics data"
          description="Analytics will populate once reviews are synced and categorized by AI. You'll see total reviews, average rating, sentiment breakdown, and trend charts."
          action="Sync reviews to generate analytics"
        />
      ) : (
        <>
          <MetricsBar metrics={data.metrics} />

          <SentimentChart
            distribution={data.sentimentDistribution}
            ratingDistribution={data.ratingDistribution}
          />

          <TrendChart data={data.trends} categories={data.categoryDistribution} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CategoryChart data={data.categoryDistribution} />
            <CategoryStatsList data={data.categoryDistribution} total={data.metrics.total} />
          </div>
        </>
      )}
    </div>
  );
}
