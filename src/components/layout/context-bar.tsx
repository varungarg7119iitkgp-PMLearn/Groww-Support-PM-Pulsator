"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useFilters } from "@/context/filter-context";
import { useSyncStatus } from "@/hooks/use-sync-status";
import { FILTER_PLATFORMS } from "@/constants/navigation";

export function ContextBar() {
  const { theme, setTheme } = useTheme();
  const { filters, setPlatform } = useFilters();
  const { hasFailedSync, isRunning, refresh } = useSyncStatus();
  const [mounted, setMounted] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const handleSync = useCallback(async () => {
    const platform = filters.platform === "all" ? "android" : filters.platform;
    setSyncing(true);
    setSyncError(null);

    try {
      const res = await fetch("/api/reviews/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });

      const data = await res.json();
      if (!data.success) {
        setSyncError(data.error || "Sync failed");
      }
      refresh();
    } catch {
      setSyncError("Network error");
    } finally {
      setSyncing(false);
    }
  }, [filters.platform, refresh]);

  const syncLabel =
    filters.platform === "ios"
      ? "Sync iOS"
      : filters.platform === "android"
        ? "Sync Android"
        : "Sync Android";

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Platform Toggle */}
      <div className="hidden sm:flex items-center rounded-full bg-[var(--color-bg-main)] p-0.5">
        {FILTER_PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id as "all" | "android" | "ios")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              filters.platform === p.id
                ? "bg-[var(--color-accent)] text-white shadow-sm"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Sync Button */}
      <div className="relative hidden sm:block">
        <button
          onClick={handleSync}
          disabled={syncing || isRunning}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            syncing || isRunning
              ? "opacity-70 cursor-wait"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)]"
          }`}
          title={syncError || undefined}
        >
          {syncing || isRunning ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : hasFailedSync ? (
            <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-star-2)]" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          <span>{syncing ? "Syncing..." : syncLabel}</span>
        </button>
        {hasFailedSync && !syncing && (
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[var(--color-star-2)] ring-2 ring-[var(--color-bg-nav)]" />
        )}
      </div>

      {/* Theme Toggle */}
      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg-hover)]"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="h-4.5 w-4.5 text-amber-400" />
          ) : (
            <Moon className="h-4.5 w-4.5 text-[var(--color-text-secondary)]" />
          )}
        </button>
      )}
    </div>
  );
}
