"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TrendDataPoint, CategoryDist } from "@/hooks/use-analytics";

interface TrendChartProps {
  data: TrendDataPoint[];
  categories: CategoryDist[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "login-issues": "#F56565",
  "kyc": "#F59E0B",
  "payments": "#00D09C",
  "app-crash": "#EF4444",
  "ui-ux": "#8B5CF6",
  "performance": "#EC4899",
  "customer-support": "#06B6D4",
  "transaction-issues": "#F97316",
  "account-issues": "#6366F1",
  "feature-request": "#84CC16",
  "security": "#14B8A6",
  "onboarding": "#3B82F6",
  "notifications": "#A855F7",
  "others": "#9CA3AF",
};

const SENTIMENT_LINES = [
  { key: "positive", label: "Positive", color: "#00D09C" },
  { key: "negative", label: "Negative", color: "#F56565" },
  { key: "neutral", label: "Neutral", color: "#F59E0B" },
];

type ViewMode = "sentiment" | "categories";

export function TrendChart({ data, categories }: TrendChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("sentiment");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => {
    const top5 = categories.slice(0, 5).map((c) => c.slug);
    return new Set(top5);
  });

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Trend Analysis
        </h3>
        <div className="flex rounded-lg border overflow-hidden">
          <button
            onClick={() => setViewMode("sentiment")}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              viewMode === "sentiment"
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Sentiment
          </button>
          <button
            onClick={() => setViewMode("categories")}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              viewMode === "categories"
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Categories
          </button>
        </div>
      </div>

      {/* Category selector (when in category mode) */}
      {viewMode === "categories" && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => toggleCategory(cat.slug)}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${
                selectedCategories.has(cat.slug)
                  ? "text-white"
                  : "bg-[var(--color-bg-main)] text-[var(--color-text-secondary)]"
              }`}
              style={
                selectedCategories.has(cat.slug)
                  ? { backgroundColor: CATEGORY_COLORS[cat.slug] || "#6366F1" }
                  : undefined
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }}
            />
            <YAxis tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelFormatter={(label: unknown) => formatDate(String(label))}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px" }}
            />

            {viewMode === "sentiment"
              ? SENTIMENT_LINES.map((line) => (
                  <Line
                    key={line.key}
                    type="monotone"
                    dataKey={line.key}
                    name={line.label}
                    stroke={line.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))
              : categories
                  .filter((c) => selectedCategories.has(c.slug))
                  .map((cat) => (
                    <Line
                      key={cat.slug}
                      type="monotone"
                      dataKey={cat.slug}
                      name={cat.name}
                      stroke={CATEGORY_COLORS[cat.slug] || "#6366F1"}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                      connectNulls
                    />
                  ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
