"use client";

import { useState, useCallback } from "react";
import { Brain, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useCategorization } from "@/hooks/use-categorization";

export function CategorizationBanner() {
  const { progress, isLoading, refresh } = useCategorization();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    processed: number;
    updated: number;
    failed: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCategorize = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/categorize", { method: "POST" });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Categorization failed");
      } else {
        setResult({
          processed: data.processed,
          updated: data.updated,
          failed: data.failed,
        });
      }
      refresh();
    } catch {
      setError("Network error");
    } finally {
      setRunning(false);
    }
  }, [refresh]);

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-xl border bg-[var(--color-bg-card)] p-4">
        <div className="h-4 w-56 rounded bg-[var(--color-bg-main)]" />
      </div>
    );
  }

  if (!progress || progress.total === 0) return null;

  const allDone = progress.uncategorized === 0;

  return (
    <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Brain className="h-4.5 w-4.5 text-[var(--color-groww-blue)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              AI Categorization
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {allDone ? (
                <span className="text-[var(--color-accent)]">
                  All {progress.total} reviews categorized
                </span>
              ) : (
                <>
                  {progress.categorized} of {progress.total} categorized
                  {" · "}
                  <span className="font-medium text-[var(--color-star-2)]">
                    {progress.uncategorized} pending
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Progress bar */}
          <div className="hidden sm:block w-32">
            <div className="h-2 rounded-full bg-[var(--color-bg-main)]">
              <div
                className="h-2 rounded-full bg-[var(--color-accent)] transition-all duration-500"
                style={{ width: `${progress.percentComplete}%` }}
              />
            </div>
            <p className="mt-0.5 text-[10px] text-[var(--color-text-secondary)] text-right">
              {progress.percentComplete}%
            </p>
          </div>

          {!allDone && (
            <button
              onClick={handleCategorize}
              disabled={running}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                running
                  ? "bg-[var(--color-groww-blue)]/20 text-[var(--color-groww-blue)] cursor-wait"
                  : "bg-[var(--color-groww-blue)] text-white hover:bg-[var(--color-groww-blue-hover)]"
              }`}
            >
              {running ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Brain className="h-3.5 w-3.5" />
                  <span>Categorize</span>
                </>
              )}
            </button>
          )}

          {allDone && (
            <CheckCircle className="h-5 w-5 text-[var(--color-accent)]" />
          )}
        </div>
      </div>

      {/* Result feedback */}
      {result && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--color-accent)]/10 px-3 py-2 text-xs text-[var(--color-accent)]">
          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
          <span>
            {result.updated} reviews categorized
            {result.failed > 0 && `, ${result.failed} failed`}
          </span>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--color-negative)]/10 px-3 py-2 text-xs text-[var(--color-negative)]">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
