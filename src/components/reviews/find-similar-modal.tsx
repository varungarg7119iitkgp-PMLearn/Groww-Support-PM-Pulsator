"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Search, Loader2, AlertCircle } from "lucide-react";
import type { ReviewItem } from "@/hooks/use-reviews";
import { ReviewCard } from "./review-card";

interface FindSimilarModalProps {
  open: boolean;
  sourceReview: ReviewItem | null;
  onClose: () => void;
  onCategoryClick?: (slug: string) => void;
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "shall",
    "should", "may", "might", "must", "can", "could", "i", "me", "my",
    "we", "our", "you", "your", "he", "she", "it", "they", "them",
    "this", "that", "these", "those", "of", "in", "on", "at", "to",
    "for", "with", "by", "from", "up", "about", "into", "through",
    "not", "no", "but", "and", "or", "if", "so", "very", "just",
    "app", "groww", "good", "bad", "nice", "great", "best", "worst",
    "like", "dont", "dont", "use", "using", "used", "also", "get",
    "got", "much", "many", "more", "most", "some", "all", "any",
    "its", "than", "when", "what", "which", "who", "how", "been",
    "after", "before", "between", "while", "where", "there", "here",
    "other", "each", "every", "only", "same", "still", "even", "too",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);
}

export function FindSimilarModal({
  open,
  sourceReview,
  onClose,
  onCategoryClick,
}: FindSimilarModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (open && sourceReview) {
      const text = sourceReview.sanitized_text || sourceReview.review_text;
      const keywords = extractKeywords(text);
      setSearchTerm(keywords.join(" "));
      setResults([]);
      setSearched(false);
    }
  }, [open, sourceReview]);

  const doSearch = useCallback(async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm.trim(),
        pageSize: "20",
        timePeriod: "last_30",
      });
      const res = await fetch(`/api/reviews/list?${params}`);
      const data = await res.json();
      const filtered = (data.reviews ?? []).filter(
        (r: ReviewItem) => r.id !== sourceReview?.id
      );
      setResults(filtered);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sourceReview]);

  useEffect(() => {
    if (open && searchTerm && !searched) {
      const timer = setTimeout(doSearch, 300);
      return () => clearTimeout(timer);
    }
  }, [open, searchTerm, searched, doSearch]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-[var(--color-bg-card)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Find Similar Reviews
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-bg-hover)]"
          >
            <X className="h-5 w-5 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="border-b p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearched(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                placeholder="Search keywords..."
                className="w-full rounded-lg border bg-[var(--color-bg-main)] py-2 pl-10 pr-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
              />
            </div>
            <button
              onClick={doSearch}
              disabled={loading}
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </button>
          </div>
          {sourceReview && (
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              Finding reviews similar to: &ldquo;{(sourceReview.sanitized_text || sourceReview.review_text).slice(0, 80)}...&rdquo;
            </p>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent)]" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="flex flex-col items-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-[var(--color-text-secondary)] mb-2" />
              <p className="text-sm text-[var(--color-text-secondary)]">
                No similar reviews found. Try different keywords.
              </p>
            </div>
          )}

          {!loading &&
            results.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                onCategoryClick={(slug) => {
                  onClose();
                  onCategoryClick?.(slug);
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
