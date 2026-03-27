"use client";

import {
  CheckCircle,
  AlertTriangle,
  Loader2,
  Database,
  RefreshCw,
} from "lucide-react";
import { useSyncStatus } from "@/hooks/use-sync-status";

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function SyncStatusBanner() {
  const {
    status,
    isLoading,
    isError,
    hasFailedSync,
    isRunning,
    latestAndroidLog,
    latestIOSLog,
    refresh,
  } = useSyncStatus();

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-xl border bg-[var(--color-bg-card)] p-4">
        <div className="h-4 w-48 rounded bg-[var(--color-bg-main)]" />
        <div className="mt-2 h-3 w-32 rounded bg-[var(--color-bg-main)]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-[var(--color-negative)]/30 bg-[var(--color-negative)]/5 p-4">
        <div className="flex items-center gap-2 text-sm text-[var(--color-negative)]">
          <AlertTriangle className="h-4 w-4" />
          <span>Unable to fetch sync status. Check Supabase connection.</span>
        </div>
      </div>
    );
  }

  if (!status?.configured) {
    return (
      <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <Database className="h-4 w-4" />
          <span>
            Database not configured yet. Set up Supabase and run the migration
            to start syncing reviews.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        hasFailedSync
          ? "border-[var(--color-star-2)]/30 bg-[var(--color-star-2)]/5"
          : "bg-[var(--color-bg-card)]"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {/* Total reviews */}
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[var(--color-accent)]" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
              {(status.totalReviews ?? 0).toLocaleString()} reviews
            </span>
          </div>

          {/* Android sync */}
          <div className="flex items-center gap-1.5">
            {latestAndroidLog?.status === "running" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-accent)]" />
            ) : latestAndroidLog?.status === "failed" ? (
              <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-star-2)]" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            )}
            <span className="text-xs text-[var(--color-text-secondary)]">
              Android: {formatRelativeTime(status.lastAndroidSync)}
            </span>
          </div>

          {/* iOS sync */}
          <div className="flex items-center gap-1.5">
            {latestIOSLog?.status === "running" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-accent)]" />
            ) : latestIOSLog?.status === "failed" ? (
              <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-star-2)]" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            )}
            <span className="text-xs text-[var(--color-text-secondary)]">
              iOS: {formatRelativeTime(status.lastIOSSync)}
            </span>
          </div>
        </div>

        <button
          onClick={() => refresh()}
          disabled={isRunning}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isRunning ? "animate-spin" : ""}`}
          />
          <span>Refresh</span>
        </button>
      </div>

      {hasFailedSync && (
        <div className="mt-2 text-xs text-[var(--color-star-2)]">
          {latestAndroidLog?.status === "failed" && (
            <p>Android sync failed: {latestAndroidLog.error_message}</p>
          )}
          {latestIOSLog?.status === "failed" && (
            <p>iOS sync failed: {latestIOSLog.error_message}</p>
          )}
        </div>
      )}
    </div>
  );
}
