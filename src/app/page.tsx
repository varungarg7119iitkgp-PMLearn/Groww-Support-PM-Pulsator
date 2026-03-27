"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Star, Upload, AlertCircle } from "lucide-react";
import useSWR from "swr";
import { FilterBar } from "@/components/shared/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { SyncStatusBanner } from "@/components/shared/sync-status-banner";
import { CategorizationBanner } from "@/components/shared/categorization-banner";
import { CSVUploadModal } from "@/components/shared/csv-upload-modal";
import { RatingHistogram } from "@/components/reviews/rating-histogram";
import { NPSGauge } from "@/components/reviews/nps-gauge";
import { ReviewCard } from "@/components/reviews/review-card";
import { Pagination } from "@/components/reviews/pagination";
import { FindSimilarModal } from "@/components/reviews/find-similar-modal";
import { ReviewFiltersInline } from "@/components/reviews/review-filters-inline";
import { ReviewListSkeleton } from "@/components/reviews/review-list-skeleton";
import { StatsSkeleton } from "@/components/reviews/stats-skeleton";
import { ReplyGeneratorModal } from "@/components/ideation/reply-generator-modal";
import { useSyncStatus } from "@/hooks/use-sync-status";
import { useReviews } from "@/hooks/use-reviews";
import { useReviewStats } from "@/hooks/use-review-stats";
import type { ReviewItem } from "@/hooks/use-reviews";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ReviewsPage() {
  const searchParams = useSearchParams();

  const [csvOpen, setCsvOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [starRating, setStarRating] = useState<number | null>(null);
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(() => searchParams.get("category"));
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get("search") || "");
  const [similarReview, setSimilarReview] = useState<ReviewItem | null>(null);
  const [replyReview, setReplyReview] = useState<ReviewItem | null>(null);

  const { refresh: refreshSync } = useSyncStatus();
  const { stats, isLoading: statsLoading } = useReviewStats();

  const {
    reviews,
    total,
    page: currentPage,
    totalPages,
    pageSize,
    isLoading: reviewsLoading,
  } = useReviews({
    page,
    starRating,
    sentiment,
    category,
    search: debouncedSearch || null,
  });

  const { data: categories } = useSWR<{ id: string; name: string; slug: string }[]>(
    "/api/categories",
    fetcher,
    { revalidateOnFocus: false }
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [starRating, sentiment, category]);

  const handleCategoryClick = useCallback((slug: string) => {
    setCategory(slug);
    setPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const hasReviews = (stats?.total ?? 0) > 0;
  const showEmpty = !statsLoading && !hasReviews;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Reviews
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Triage and analyze Groww app store reviews
          </p>
        </div>
        <button
          onClick={() => setCsvOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)] transition-colors"
        >
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Import CSV</span>
        </button>
      </div>

      <SyncStatusBanner />
      <CategorizationBanner />
      <FilterBar />

      {/* Stats Section: Histogram + NPS */}
      {showEmpty ? (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="Once reviews are synced from the Play Store and App Store, they will appear here with rating distribution, NPS, and AI-powered insights."
          action="Use the Sync button in the header or import a CSV to get started"
        />
      ) : statsLoading ? (
        <StatsSkeleton />
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RatingHistogram
              distribution={stats.ratingDistribution}
              total={stats.total}
              activeRating={starRating}
              onRatingClick={(r) => {
                setStarRating(r);
                setPage(1);
              }}
            />
            <NPSGauge
              nps={stats.nps}
              total={stats.total}
              averageRating={stats.averageRating}
              sentimentCounts={stats.sentimentCounts}
            />
          </div>

          {/* Inline Review Filters */}
          <ReviewFiltersInline
            sentiment={sentiment}
            category={category}
            search={search}
            onSentimentChange={(s) => setSentiment(s)}
            onCategoryChange={(c) => setCategory(c)}
            onSearchChange={setSearch}
            categories={categories ?? []}
          />

          {/* Review List */}
          {reviewsLoading ? (
            <ReviewListSkeleton />
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <AlertCircle className="h-10 w-10 text-[var(--color-text-secondary)] mb-3" />
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                No reviews match your filters
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                Try adjusting the platform, time period, sentiment, or category filters.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onCategoryClick={handleCategoryClick}
                    onFindSimilar={(r) => setSimilarReview(r)}
                    onGenerateReply={(r) => setReplyReview(r)}
                  />
                ))}
              </div>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </>
          )}
        </>
      ) : null}

      {/* Modals */}
      <CSVUploadModal
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        onComplete={() => refreshSync()}
      />
      <FindSimilarModal
        open={!!similarReview}
        sourceReview={similarReview}
        onClose={() => setSimilarReview(null)}
        onCategoryClick={handleCategoryClick}
      />
      {replyReview && (
        <ReplyGeneratorModal
          review={replyReview}
          onClose={() => setReplyReview(null)}
        />
      )}
    </div>
  );
}
