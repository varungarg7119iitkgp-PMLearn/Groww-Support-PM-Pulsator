"use client";

import useSWR from "swr";

interface SyncLog {
  id: string;
  app_id: string;
  platform: "android" | "ios";
  status: "running" | "success" | "failed";
  reviews_fetched: number;
  error_message: string | null;
  retry_count: number;
  started_at: string;
  completed_at: string | null;
}

export interface SyncStatus {
  configured: boolean;
  appId?: string;
  lastAndroidSync: string | null;
  lastIOSSync: string | null;
  totalReviews: number;
  recentLogs: SyncLog[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useSyncStatus() {
  const { data, error, isLoading, mutate } = useSWR<SyncStatus>(
    "/api/reviews/sync-status",
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      errorRetryCount: 2,
    }
  );

  const latestAndroidLog = data?.recentLogs?.find(
    (l) => l.platform === "android"
  );
  const latestIOSLog = data?.recentLogs?.find((l) => l.platform === "ios");

  const hasFailedSync =
    latestAndroidLog?.status === "failed" ||
    latestIOSLog?.status === "failed";

  const isRunning =
    latestAndroidLog?.status === "running" ||
    latestIOSLog?.status === "running";

  return {
    status: data,
    isLoading,
    isError: !!error,
    hasFailedSync,
    isRunning,
    latestAndroidLog,
    latestIOSLog,
    refresh: mutate,
  };
}
