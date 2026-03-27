import useSWR from "swr";
import { useFilters } from "@/context/filter-context";
import type { ReviewItem } from "@/hooks/use-reviews";

export interface WordFreq {
  word: string;
  count: number;
}

export interface TestimonialsMetrics {
  totalReviews: number;
  totalWords: number;
  uniqueWords: number;
}

export interface TestimonialsData {
  metrics: TestimonialsMetrics;
  wordFrequencies: WordFreq[];
  topUpvoted: ReviewItem[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useTestimonials(topN: number = 30) {
  const { filters } = useFilters();

  const params = new URLSearchParams();
  params.set("platform", filters.platform);
  params.set("timePeriod", filters.timePeriod);
  params.set("topN", String(topN));
  if (filters.customDateFrom) params.set("dateFrom", filters.customDateFrom);
  if (filters.customDateTo) params.set("dateTo", filters.customDateTo);

  const key = `/api/testimonials?${params.toString()}`;

  const { data, error, isLoading } = useSWR<TestimonialsData>(key, fetcher, {
    revalidateOnFocus: false,
  });

  return { data: data ?? null, isLoading, error };
}
