"use client";

import { Star, TrendingUp, TrendingDown, Minus, MessageSquare } from "lucide-react";
import type { AnalyticsMetrics } from "@/hooks/use-analytics";

interface MetricsBarProps {
  metrics: AnalyticsMetrics;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  color?: string;
}

function MetricCard({ label, value, subValue, icon, color }: MetricCardProps) {
  return (
    <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold">
          {label}
        </span>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: color ? `${color}15` : "var(--color-bg-main)" }}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
      {subValue && (
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{subValue}</p>
      )}
    </div>
  );
}

export function MetricsBar({ metrics }: MetricsBarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <MetricCard
        label="Total Reviews"
        value={metrics.total.toLocaleString()}
        icon={<MessageSquare className="h-4 w-4 text-[var(--color-accent)]" />}
        color="var(--color-accent)"
      />
      <MetricCard
        label="Avg Rating"
        value={metrics.averageRating > 0 ? metrics.averageRating.toFixed(1) : "—"}
        subValue="out of 5.0"
        icon={<Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
        color="#F59E0B"
      />
      <MetricCard
        label="Positive"
        value={metrics.positive.toLocaleString()}
        subValue={`${metrics.positivePercent}%`}
        icon={<TrendingUp className="h-4 w-4 text-[var(--color-positive)]" />}
        color="var(--color-positive)"
      />
      <MetricCard
        label="Negative"
        value={metrics.negative.toLocaleString()}
        subValue={`${metrics.negativePercent}%`}
        icon={<TrendingDown className="h-4 w-4 text-[var(--color-negative)]" />}
        color="var(--color-negative)"
      />
      <MetricCard
        label="Neutral"
        value={metrics.neutral.toLocaleString()}
        subValue={`${metrics.neutralPercent}%`}
        icon={<Minus className="h-4 w-4" style={{ color: "var(--color-warning)" }} />}
        color="var(--color-warning)"
      />
    </div>
  );
}
