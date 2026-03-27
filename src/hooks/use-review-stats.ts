import useSWR from "swr";
import { useFilters } from "@/context/filter-context";

export interface ReviewStats {
  total: number;
  ratingDistribution: Record<number, number>;
  sentimentCounts: { positive: number; negative: number; neutral: number };
  averageRating: number;
  nps: number | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useReviewStats() {
  const { filters } = useFilters();

  const params = new URLSearchParams();
  params.set("platform", filters.platform);
  params.set("timePeriod", filters.timePeriod);
  if (filters.customDateFrom) params.set("dateFrom", filters.customDateFrom);
  if (filters.customDateTo) params.set("dateTo", filters.customDateTo);

  const key = `/api/reviews/stats?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<ReviewStats>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    stats: data ?? null,
    isLoading,
    error,
    refresh: mutate,
  };
}
