"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface SentimentChartProps {
  distribution: { positive: number; negative: number; neutral: number };
  ratingDistribution: Record<number, number>;
}

export function SentimentChart({ distribution, ratingDistribution }: SentimentChartProps) {
  const sentimentData = [
    { name: "Positive", value: distribution.positive, color: "var(--color-positive)" },
    { name: "Neutral", value: distribution.neutral, color: "var(--color-warning)" },
    { name: "Negative", value: distribution.negative, color: "var(--color-negative)" },
  ];

  const ratingData = [5, 4, 3, 2, 1].map((star) => ({
    name: `${star}★`,
    value: ratingDistribution[star] || 0,
    color:
      star >= 4
        ? "var(--color-positive)"
        : star === 3
        ? "var(--color-warning)"
        : "var(--color-negative)",
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Sentiment */}
      <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
          Sentiment Analysis
        </h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sentimentData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {sentimentData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
          Rating Distribution
        </h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratingData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {ratingData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
