"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Cloud } from "lucide-react";
import { FilterBar } from "@/components/shared/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { TestimonialsMetrics } from "@/components/testimonials/testimonials-metrics";
import { WordCloudView } from "@/components/testimonials/word-cloud-view";
import { TopWordsList } from "@/components/testimonials/top-words-list";
import { TopUpvotedReviews } from "@/components/testimonials/top-upvoted-reviews";
import { TestimonialsSkeleton } from "@/components/testimonials/testimonials-skeleton";
import { useTestimonials } from "@/hooks/use-testimonials";
import type { ReviewItem } from "@/hooks/use-reviews";

export default function WordCloudPage() {
  const { data, isLoading } = useTestimonials(30);
  const router = useRouter();

  const hasData = data && data.metrics.totalReviews > 0;

  const handleCategoryClick = useCallback(
    (slug: string) => {
      router.push(`/?category=${slug}`);
    },
    [router]
  );

  const handleFindSimilar = useCallback(
    (review: ReviewItem) => {
      const keywords = (review.sanitized_text || review.review_text)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w: string) => w.length > 3)
        .slice(0, 3)
        .join(" ");
      router.push(`/?search=${encodeURIComponent(keywords)}`);
    },
    [router]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          Word Cloud
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Most used words, top keywords, and top upvoted reviews
        </p>
      </div>

      <FilterBar />

      {isLoading ? (
        <TestimonialsSkeleton />
      ) : !hasData ? (
        <EmptyState
          icon={Cloud}
          title="No word data yet"
          description="The word cloud and top keywords will generate from your review data. You'll see frequently used terms, keyword rankings, and the most upvoted reviews."
          action="Sync reviews to build the word cloud"
        />
      ) : (
        <>
          <TestimonialsMetrics metrics={data.metrics} />
          <WordCloudView words={data.wordFrequencies} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopWordsList words={data.wordFrequencies} />
            <TopUpvotedReviews
              reviews={data.topUpvoted}
              onCategoryClick={handleCategoryClick}
              onFindSimilar={handleFindSimilar}
            />
          </div>
        </>
      )}
    </div>
  );
}
