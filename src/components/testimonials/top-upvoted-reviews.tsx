"use client";

import { ThumbsUp } from "lucide-react";
import { ReviewCard } from "@/components/reviews/review-card";
import type { ReviewItem } from "@/hooks/use-reviews";

interface TopUpvotedReviewsProps {
  reviews: ReviewItem[];
  onCategoryClick?: (slug: string) => void;
  onFindSimilar?: (review: ReviewItem) => void;
}

export function TopUpvotedReviews({
  reviews,
  onCategoryClick,
  onFindSimilar,
}: TopUpvotedReviewsProps) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border bg-[var(--color-bg-card)] p-6 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
          Top Upvoted Reviews
        </h3>
        <div className="flex flex-col items-center py-8 text-center">
          <ThumbsUp className="h-8 w-8 text-[var(--color-text-secondary)] mb-2" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            No upvoted reviews available for the current filter.
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Upvote data is only available from Google Play Store reviews.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <ThumbsUp className="h-4 w-4 text-[var(--color-accent)]" />
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Top Upvoted Reviews
        </h3>
        <span className="text-[10px] text-[var(--color-text-secondary)] bg-[var(--color-bg-main)] rounded-full px-2 py-0.5">
          {reviews.length} reviews
        </span>
      </div>
      <div className="space-y-3">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onCategoryClick={onCategoryClick}
            onFindSimilar={onFindSimilar}
          />
        ))}
      </div>
    </div>
  );
}
