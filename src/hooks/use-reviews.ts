import useSWR from "swr";
import { useFilters } from "@/context/filter-context";

interface ReviewCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ReviewItem {
  id: string;
  app_id: string;
  platform_review_id: string;
  platform: "android" | "ios";
  author_name: string;
  star_rating: number;
  review_text: string;
  sanitized_text: string;
  sentiment: string;
  device_info: string | null;
  app_version: string | null;
  os_version: string | null;
  upvote_count: number | null;
  review_date: string;
  ingested_at: string;
  categories: ReviewCategory[];
}

interface ReviewsResponse {
  reviews: ReviewItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useReviews(opts: {
  page?: number;
  pageSize?: number;
  starRating?: number | null;
  sentiment?: string | null;
  category?: string | null;
  search?: string | null;
} = {}) {
  const { filters } = useFilters();

  const params = new URLSearchParams();
  params.set("platform", filters.platform);
  params.set("timePeriod", filters.timePeriod);
  if (filters.customDateFrom) params.set("dateFrom", filters.customDateFrom);
  if (filters.customDateTo) params.set("dateTo", filters.customDateTo);
  if (opts.page) params.set("page", String(opts.page));
  if (opts.pageSize) params.set("pageSize", String(opts.pageSize));
  if (opts.starRating) params.set("starRating", String(opts.starRating));
  if (opts.sentiment) params.set("sentiment", opts.sentiment);
  if (opts.category) params.set("category", opts.category);
  if (opts.search) params.set("search", opts.search);

  const key = `/api/reviews/list?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<ReviewsResponse>(key, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  return {
    reviews: data?.reviews ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    pageSize: data?.pageSize ?? 25,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error,
    refresh: mutate,
  };
}
