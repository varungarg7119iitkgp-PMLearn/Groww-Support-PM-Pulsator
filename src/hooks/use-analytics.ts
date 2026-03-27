import useSWR from "swr";
import { useFilters } from "@/context/filter-context";

export interface AnalyticsMetrics {
  total: number;
  averageRating: number;
  positive: number;
  negative: number;
  neutral: number;
  positivePercent: number;
  negativePercent: number;
  neutralPercent: number;
}

export interface CategoryDist {
  name: string;
  slug: string;
  count: number;
  percent: number;
}

export interface TrendDataPoint {
  date: string;
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  [category: string]: string | number;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  ratingDistribution: Record<number, number>;
  sentimentDistribution: { positive: number; negative: number; neutral: number };
  categoryDistribution: CategoryDist[];
  trends: TrendDataPoint[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useAnalytics() {
  const { filters } = useFilters();

  const params = new URLSearchParams();
  params.set("platform", filters.platform);
  params.set("timePeriod", filters.timePeriod);
  if (filters.customDateFrom) params.set("dateFrom", filters.customDateFrom);
  if (filters.customDateTo) params.set("dateTo", filters.customDateTo);

  const key = `/api/analytics?${params.toString()}`;

  const { data, error, isLoading } = useSWR<AnalyticsData>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return { data: data ?? null, isLoading, error };
}
