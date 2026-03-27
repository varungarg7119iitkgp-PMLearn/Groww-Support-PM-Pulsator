"use client";

import { useState, useCallback } from "react";
import {
  Lightbulb,
  Loader2,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useFilters } from "@/context/filter-context";

interface Idea {
  title: string;
  rationale: string;
  reviewCount: number;
  recommendation: string;
}

export function IdeaRecommender() {
  const { filters } = useFilters();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [totalAnalyzed, setTotalAnalyzed] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const generateIdeas = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/ai/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: filters.platform,
          timePeriod: filters.timePeriod,
          dateFrom: filters.customDateFrom,
          dateTo: filters.customDateTo,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate ideas");

      setIdeas(data.ideas || []);
      setTotalAnalyzed(data.totalAnalyzed || 0);
      setMessage(data.message || null);
      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  return (
    <div className="rounded-xl border bg-[var(--color-bg-card)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              AI Idea Recommender
            </h3>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Analyzes negative reviews to suggest product improvements
            </p>
          </div>
        </div>
        <button
          onClick={generateIdeas}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...
            </>
          ) : hasGenerated ? (
            <>
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate
            </>
          ) : (
            <>
              <Lightbulb className="h-3.5 w-3.5" /> Generate Ideas
            </>
          )}
        </button>
      </div>

      <div className="p-5">
        {/* Initial state */}
        {!hasGenerated && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30 mb-3">
              <Lightbulb className="h-6 w-6 text-amber-500" />
            </div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Ready to analyze
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)] max-w-[280px]">
              Click &quot;Generate Ideas&quot; to analyze negative reviews and get AI-powered product improvement suggestions.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)] mb-3" />
            <p className="text-sm text-[var(--color-text-secondary)]">
              Analyzing negative reviews with AI...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Analysis Failed
              </p>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Insufficient data message */}
        {message && !loading && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 text-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-amber-700 dark:text-amber-400">{message}</p>
          </div>
        )}

        {/* Ideas List */}
        {ideas.length > 0 && !loading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-[var(--color-accent)]" />
              <p className="text-xs text-[var(--color-text-secondary)]">
                <span className="font-semibold text-[var(--color-text-primary)]">{ideas.length} ideas</span>{" "}
                generated from {totalAnalyzed} reviews
              </p>
            </div>

            {ideas.map((idea, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-[var(--color-border)] overflow-hidden"
              >
                <button
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--color-bg-hover)] transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-xs font-bold text-[var(--color-accent)]">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                        {idea.title}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-secondary)]">
                        ~{idea.reviewCount} related reviews
                      </p>
                    </div>
                  </div>
                  {expandedIdx === idx ? (
                    <ChevronUp className="h-4 w-4 text-[var(--color-text-secondary)] shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[var(--color-text-secondary)] shrink-0" />
                  )}
                </button>

                {expandedIdx === idx && (
                  <div className="border-t border-[var(--color-border)] px-4 py-3 space-y-3 bg-[var(--color-bg-main)]">
                    <div>
                      <p className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                        Rationale
                      </p>
                      <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                        {idea.rationale}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                        Recommendation
                      </p>
                      <p className="text-sm text-[var(--color-accent)] leading-relaxed font-medium">
                        {idea.recommendation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
