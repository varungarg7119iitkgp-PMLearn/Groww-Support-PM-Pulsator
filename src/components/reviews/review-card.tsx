"use client";

import { useState } from "react";
import {
  Star,
  Smartphone,
  Monitor,
  ThumbsUp,
  Search,
  Calendar,
  User,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ReviewItem } from "@/hooks/use-reviews";

interface ReviewCardProps {
  review: ReviewItem;
  onCategoryClick?: (slug: string) => void;
  onFindSimilar?: (review: ReviewItem) => void;
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    positive: {
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-400",
      label: "Positive",
    },
    negative: {
      bg: "bg-red-50 dark:bg-red-950/40",
      text: "text-red-700 dark:text-red-400",
      label: "Negative",
    },
    neutral: {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-700 dark:text-amber-400",
      label: "Neutral",
    },
  };

  const c = config[sentiment] ?? config.neutral;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3 w-3 ${
            s <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-none text-[var(--color-text-secondary)]"
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewCard({ review, onCategoryClick, onFindSimilar }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const textLimit = 200;
  const text = review.sanitized_text || review.review_text;
  const isLong = text.length > textLimit;
  const displayText = expanded || !isLong ? text : text.slice(0, textLimit) + "...";

  const date = new Date(review.review_date);
  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const PlatformIcon = review.platform === "android" ? Smartphone : Monitor;

  return (
    <div className="rounded-xl border bg-[var(--color-bg-card)] p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-main)]">
            <User className="h-4 w-4 text-[var(--color-text-secondary)]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
              {review.author_name || "Anonymous"}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-secondary)]">
              <PlatformIcon className="h-3 w-3" />
              <span className="capitalize">{review.platform}</span>
              <span>·</span>
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StarRating rating={review.star_rating} />
          <SentimentBadge sentiment={review.sentiment} />
        </div>
      </div>

      {/* Review Text */}
      <div className="mt-3">
        <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">
          {displayText}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 flex items-center gap-0.5 text-xs font-medium text-[var(--color-accent)] hover:underline"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Read more <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Category Tags */}
      {review.categories && review.categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {review.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryClick?.(cat.slug)}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 transition-colors"
            >
              <Tag className="h-2.5 w-2.5" />
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Footer: Metadata + Actions */}
      <div className="mt-3 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
        <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-secondary)]">
          {review.app_version && (
            <span>v{review.app_version}</span>
          )}
          {review.device_info && (
            <span className="max-w-[120px] truncate">{review.device_info}</span>
          )}
          {review.upvote_count != null && review.upvote_count > 0 && (
            <span className="flex items-center gap-0.5">
              <ThumbsUp className="h-3 w-3" />
              {review.upvote_count}
            </span>
          )}
        </div>
        <button
          onClick={() => onFindSimilar?.(review)}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-hover)] transition-colors"
        >
          <Search className="h-3 w-3" />
          Find Similar
        </button>
      </div>
    </div>
  );
}
