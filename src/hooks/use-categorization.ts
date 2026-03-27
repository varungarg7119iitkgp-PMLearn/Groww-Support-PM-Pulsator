"use client";

import useSWR from "swr";

export interface CategorizationProgress {
  total: number;
  categorized: number;
  uncategorized: number;
  percentComplete: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useCategorization() {
  const { data, error, isLoading, mutate } = useSWR<CategorizationProgress>(
    "/api/ai/status",
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );

  return {
    progress: data,
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}
