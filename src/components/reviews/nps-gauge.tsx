"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface NPSGaugeProps {
  nps: number | null;
  total: number;
  averageRating: number;
  sentimentCounts: { positive: number; negative: number; neutral: number };
}

function getNPSColor(nps: number): string {
  if (nps >= 50) return "var(--color-positive)";
  if (nps >= 0) return "var(--color-warning)";
  return "var(--color-negative)";
}

function getNPSLabel(nps: number): string {
  if (nps >= 70) return "Excellent";
  if (nps >= 50) return "Great";
  if (nps >= 30) return "Good";
  if (nps >= 0) return "Needs Work";
  return "Critical";
}

export function NPSGauge({ nps, total, averageRating, sentimentCounts }: NPSGaugeProps) {
  return (
    <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
        Health Metrics
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* NPS Score */}
        <div className="col-span-2 flex items-center gap-4 rounded-lg bg-[var(--color-bg-main)] p-3">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold">
              NPS
            </span>
            {nps !== null ? (
              <span
                className="text-3xl font-bold"
                style={{ color: getNPSColor(nps) }}
              >
                {nps > 0 ? `+${nps}` : nps}
              </span>
            ) : (
              <span className="text-2xl font-bold text-[var(--color-text-secondary)]">
                N/A
              </span>
            )}
            {nps !== null && (
              <span
                className="text-[10px] font-semibold"
                style={{ color: getNPSColor(nps) }}
              >
                {getNPSLabel(nps)}
              </span>
            )}
          </div>
          <div className="h-12 w-px bg-[var(--color-border)]" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[var(--color-positive)]" />
              <span className="text-xs text-[var(--color-text-secondary)]">
                Promoters (4-5): <strong className="text-[var(--color-text-primary)]">{sentimentCounts.positive}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: "var(--color-warning)" }} />
              <span className="text-xs text-[var(--color-text-secondary)]">
                Passives (3): <strong className="text-[var(--color-text-primary)]">{sentimentCounts.neutral}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[var(--color-negative)]" />
              <span className="text-xs text-[var(--color-text-secondary)]">
                Detractors (1-2): <strong className="text-[var(--color-text-primary)]">{sentimentCounts.negative}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Total Reviews */}
        <div className="flex flex-col items-center rounded-lg bg-[var(--color-bg-main)] p-3">
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold">
            Total Reviews
          </span>
          <span className="text-2xl font-bold text-[var(--color-text-primary)]">
            {total.toLocaleString()}
          </span>
        </div>

        {/* Average Rating */}
        <div className="flex flex-col items-center rounded-lg bg-[var(--color-bg-main)] p-3">
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold">
            Avg Rating
          </span>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">
              {averageRating > 0 ? averageRating.toFixed(1) : "—"}
            </span>
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </div>
        </div>

        {/* Sentiment Bar */}
        <div className="col-span-2 rounded-lg bg-[var(--color-bg-main)] p-3">
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] font-semibold mb-2 block">
            Sentiment Split
          </span>
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            {total > 0 ? (
              <>
                <div
                  className="transition-all duration-500"
                  style={{
                    width: `${(sentimentCounts.positive / total) * 100}%`,
                    background: "var(--color-positive)",
                  }}
                />
                <div
                  className="transition-all duration-500"
                  style={{
                    width: `${(sentimentCounts.neutral / total) * 100}%`,
                    background: "var(--color-warning)",
                  }}
                />
                <div
                  className="transition-all duration-500"
                  style={{
                    width: `${(sentimentCounts.negative / total) * 100}%`,
                    background: "var(--color-negative)",
                  }}
                />
              </>
            ) : (
              <div className="w-full bg-[var(--color-border)]" />
            )}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-[var(--color-positive)]" />
              {total > 0 ? `${((sentimentCounts.positive / total) * 100).toFixed(0)}%` : "0%"}
            </span>
            <span className="flex items-center gap-1">
              <Minus className="h-3 w-3" style={{ color: "var(--color-warning)" }} />
              {total > 0 ? `${((sentimentCounts.neutral / total) * 100).toFixed(0)}%` : "0%"}
            </span>
            <span className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-[var(--color-negative)]" />
              {total > 0 ? `${((sentimentCounts.negative / total) * 100).toFixed(0)}%` : "0%"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Star(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
