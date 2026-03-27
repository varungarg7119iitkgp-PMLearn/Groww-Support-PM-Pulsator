"use client";

import { useState, useCallback } from "react";
import {
  X,
  MessageSquare,
  Copy,
  Check,
  RefreshCw,
  Heart,
  Briefcase,
  Gift,
  Star,
  Loader2,
} from "lucide-react";
import type { ReviewItem } from "@/hooks/use-reviews";

interface ReplyGeneratorModalProps {
  review: ReviewItem;
  onClose: () => void;
}

type Tone = "empathetic" | "professional" | "gratitude";

const TONES: { id: Tone; label: string; icon: typeof Heart; description: string }[] = [
  { id: "empathetic", label: "Empathetic", icon: Heart, description: "Warm & understanding" },
  { id: "professional", label: "Professional", icon: Briefcase, description: "Formal & concise" },
  { id: "gratitude", label: "Gratitude", icon: Gift, description: "Thankful & appreciative" },
];

export function ReplyGeneratorModal({ review, onClose }: ReplyGeneratorModalProps) {
  const [tone, setTone] = useState<Tone>("professional");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateReply = useCallback(
    async (selectedTone: Tone) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/ai/reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviewText: review.sanitized_text || review.review_text,
            starRating: review.star_rating,
            categories: review.categories?.map((c) => c.name) ?? [],
            tone: selectedTone,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to generate reply");
        setReply(data.reply);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [review]
  );

  const handleToneChange = (newTone: Tone) => {
    setTone(newTone);
    if (reply) {
      generateReply(newTone);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const text = review.sanitized_text || review.review_text;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--color-bg-card)] shadow-2xl border border-[var(--color-border)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[var(--color-accent)]" />
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              Generate Reply
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <X className="h-5 w-5 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Original Review */}
          <div className="rounded-lg bg-[var(--color-bg-main)] p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                {review.author_name || "Anonymous"}
              </p>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-3 w-3 ${
                      s <= review.star_rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-none text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-primary)] line-clamp-3">
              {text}
            </p>
          </div>

          {/* Tone Selector */}
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
              Select Tone
            </p>
            <div className="grid grid-cols-3 gap-2">
              {TONES.map((t) => {
                const Icon = t.icon;
                const active = tone === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleToneChange(t.id)}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all ${
                      active
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                        : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        active ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold ${
                        active ? "text-[var(--color-accent)]" : "text-[var(--color-text-primary)]"
                      }`}
                    >
                      {t.label}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">
                      {t.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          {!reply && !loading && (
            <button
              onClick={() => generateReply(tone)}
              className="w-full rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Generate Reply
            </button>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--color-accent)]" />
              <span className="text-sm text-[var(--color-text-secondary)]">
                Generating reply...
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              <button
                onClick={() => generateReply(tone)}
                className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Reply Output */}
          {reply && !loading && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Generated Reply
              </p>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={5}
                className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-main)] p-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Reply
                    </>
                  )}
                </button>
                <button
                  onClick={() => generateReply(tone)}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
