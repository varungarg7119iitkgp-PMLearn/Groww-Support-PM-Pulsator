"use client";

import { FileText, Hash, Fingerprint } from "lucide-react";
import type { TestimonialsMetrics as MetricsType } from "@/hooks/use-testimonials";

interface Props {
  metrics: MetricsType;
}

export function TestimonialsMetrics({ metrics }: Props) {
  const cards = [
    {
      label: "Reviews Analyzed",
      value: metrics.totalReviews.toLocaleString(),
      icon: <FileText className="h-4 w-4 text-[var(--color-accent)]" />,
      color: "var(--color-accent)",
    },
    {
      label: "Total Words",
      value: metrics.totalWords.toLocaleString(),
      icon: <Hash className="h-4 w-4 text-[var(--color-groww-blue)]" />,
      color: "var(--color-groww-blue)",
    },
    {
      label: "Unique Words",
      value: metrics.uniqueWords.toLocaleString(),
      icon: <Fingerprint className="h-4 w-4" style={{ color: "var(--color-warning)" }} />,
      color: "var(--color-warning)",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold">
              {c.label}
            </span>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: `${c.color}15` }}
            >
              {c.icon}
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}
