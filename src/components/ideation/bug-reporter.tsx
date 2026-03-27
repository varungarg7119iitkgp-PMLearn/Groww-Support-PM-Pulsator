"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Bug,
  Loader2,
  AlertTriangle,
  Copy,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  Smartphone,
  Monitor,
  X,
} from "lucide-react";
import { useFilters } from "@/context/filter-context";

interface ReviewForBug {
  id: string;
  author_name: string;
  sanitized_text: string;
  review_text: string;
  star_rating: number;
  platform: string;
  app_version: string | null;
  os_version: string | null;
  review_date: string;
  categories: { id: string; name: string; slug: string }[];
}

interface BugReport {
  title: string;
  severity: string;
  description: string;
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  affectedPlatforms: string[];
  affectedVersions: string[];
  dateRange: string;
  userReportCount: number;
  userQuotes: string[];
  suggestedLabels: string[];
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
};

export function BugReporter() {
  const { filters } = useFilters();
  const [negativeReviews, setNegativeReviews] = useState<ReviewForBug[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [bugReport, setBugReport] = useState<BugReport | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showReviewList, setShowReviewList] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchNegativeReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const params = new URLSearchParams();
      params.set("platform", filters.platform);
      params.set("timePeriod", filters.timePeriod);
      params.set("sentiment", "negative");
      params.set("pageSize", "50");
      if (filters.customDateFrom) params.set("dateFrom", filters.customDateFrom);
      if (filters.customDateTo) params.set("dateTo", filters.customDateTo);

      const res = await fetch(`/api/reviews/list?${params.toString()}`);
      const data = await res.json();
      setNegativeReviews(data.reviews || []);
    } catch {
      setNegativeReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchNegativeReviews();
  }, [fetchNegativeReviews]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredReviews.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredReviews.map((r) => r.id)));
    }
  };

  const generateBugReport = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setGenerating(true);
    setError(null);

    const selected = negativeReviews.filter((r) => selectedIds.has(r.id));

    try {
      const res = await fetch("/api/ai/bug-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate bug report");
      setBugReport(data.bugReport);
      setShowReviewList(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }, [selectedIds, negativeReviews]);

  const formatReportAsText = (report: BugReport): string => {
    return `# ${report.title}

**Severity:** ${report.severity.toUpperCase()}
**Platforms:** ${report.affectedPlatforms.join(", ")}
**App Versions:** ${report.affectedVersions.join(", ") || "Unknown"}
**Date Range:** ${report.dateRange}
**User Reports:** ${report.userReportCount}

## Description
${report.description}

## Steps to Reproduce
${report.stepsToReproduce.map((s, i) => `${i + 1}. ${s}`).join("\n")}

## Expected Behavior
${report.expectedBehavior}

## Actual Behavior
${report.actualBehavior}

## User Quotes
${report.userQuotes.map((q) => `> "${q}"`).join("\n")}

## Labels
${report.suggestedLabels.join(", ")}`;
  };

  const handleCopy = async () => {
    if (!bugReport) return;
    await navigator.clipboard.writeText(formatReportAsText(bugReport));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredReviews = searchTerm
    ? negativeReviews.filter(
        (r) =>
          (r.sanitized_text || r.review_text)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (r.author_name || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : negativeReviews;

  return (
    <div className="rounded-xl border bg-[var(--color-bg-card)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Bug Reporter
            </h3>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Select reviews to generate structured bug reports
            </p>
          </div>
        </div>
        {bugReport && (
          <button
            onClick={() => {
              setBugReport(null);
              setShowReviewList(true);
            }}
            className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <X className="h-3.5 w-3.5" /> New Report
          </button>
        )}
      </div>

      <div className="p-5">
        {/* Review selection */}
        {showReviewList && (
          <div className="space-y-3">
            {/* Search + Controls */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search negative reviews..."
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-main)] py-2 pl-9 pr-3 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>
              <button
                onClick={selectAll}
                className="shrink-0 rounded-lg border border-[var(--color-border)] px-3 py-2 text-[11px] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
              >
                {selectedIds.size === filteredReviews.length && filteredReviews.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            {loadingReviews ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--color-accent)]" />
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="py-8 text-center">
                <Bug className="h-8 w-8 text-[var(--color-text-secondary)] mx-auto mb-2 opacity-40" />
                <p className="text-sm text-[var(--color-text-secondary)]">
                  No negative reviews found
                </p>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-1.5 rounded-lg border border-[var(--color-border)] p-2">
                {filteredReviews.map((review) => {
                  const selected = selectedIds.has(review.id);
                  const text = review.sanitized_text || review.review_text;
                  const PIcon = review.platform === "android" ? Smartphone : Monitor;
                  return (
                    <button
                      key={review.id}
                      onClick={() => toggleSelect(review.id)}
                      className={`w-full flex items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                        selected
                          ? "bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30"
                          : "hover:bg-[var(--color-bg-hover)] border border-transparent"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          selected
                            ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
                            : "border-[var(--color-border)]"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-medium text-[var(--color-text-primary)] truncate">
                            {review.author_name || "Anonymous"}
                          </span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-2.5 w-2.5 ${
                                  s <= review.star_rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-none text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <PIcon className="h-3 w-3 text-[var(--color-text-secondary)]" />
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
                          {text}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateBugReport}
              disabled={selectedIds.size === 0 || generating}
              className="w-full rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating Bug Report...
                </span>
              ) : (
                `Generate Report from ${selectedIds.size} Review${selectedIds.size !== 1 ? "s" : ""}`
              )}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 mt-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Generation Failed
              </p>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Bug Report Output */}
        {bugReport && !showReviewList && (
          <BugReportView report={bugReport} onCopy={handleCopy} copied={copied} />
        )}
      </div>
    </div>
  );
}

function BugReportView({
  report,
  onCopy,
  copied,
}: {
  report: BugReport;
  onCopy: () => void;
  copied: boolean;
}) {
  const [stepsOpen, setStepsOpen] = useState(true);
  const [quotesOpen, setQuotesOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Title + Severity */}
      <div>
        <div className="flex items-start gap-2 mb-2">
          <Bug className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <h4 className="text-base font-bold text-[var(--color-text-primary)]">
            {report.title}
          </h4>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
              SEVERITY_COLORS[report.severity] || SEVERITY_COLORS.medium
            }`}
          >
            {report.severity}
          </span>
          {report.affectedPlatforms.map((p) => (
            <span
              key={p}
              className="rounded-full bg-[var(--color-bg-main)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)] capitalize"
            >
              {p}
            </span>
          ))}
          <span className="text-[10px] text-[var(--color-text-secondary)]">
            {report.userReportCount} user reports
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-lg bg-[var(--color-bg-main)] p-3">
        <p className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
          Description
        </p>
        <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
          {report.description}
        </p>
      </div>

      {/* Steps to Reproduce */}
      <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
        <button
          onClick={() => setStepsOpen(!stepsOpen)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--color-bg-hover)] transition-colors"
        >
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">
            Steps to Reproduce
          </span>
          {stepsOpen ? (
            <ChevronUp className="h-4 w-4 text-[var(--color-text-secondary)]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[var(--color-text-secondary)]" />
          )}
        </button>
        {stepsOpen && (
          <div className="border-t border-[var(--color-border)] px-3 py-2.5 space-y-1.5">
            {report.stepsToReproduce.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-[10px] font-bold text-[var(--color-accent)]">
                  {i + 1}
                </span>
                <p className="text-xs text-[var(--color-text-primary)]">{step}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expected vs Actual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-3">
          <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            Expected
          </p>
          <p className="text-xs text-emerald-800 dark:text-emerald-300">
            {report.expectedBehavior}
          </p>
        </div>
        <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3">
          <p className="text-[10px] font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1">
            Actual
          </p>
          <p className="text-xs text-red-800 dark:text-red-300">
            {report.actualBehavior}
          </p>
        </div>
      </div>

      {/* User Quotes */}
      {report.userQuotes.length > 0 && (
        <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
          <button
            onClick={() => setQuotesOpen(!quotesOpen)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              User Quotes ({report.userQuotes.length})
            </span>
            {quotesOpen ? (
              <ChevronUp className="h-4 w-4 text-[var(--color-text-secondary)]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[var(--color-text-secondary)]" />
            )}
          </button>
          {quotesOpen && (
            <div className="border-t border-[var(--color-border)] px-3 py-2.5 space-y-2">
              {report.userQuotes.map((quote, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-[var(--color-bg-main)] px-3 py-2 border-l-2 border-[var(--color-accent)]"
                >
                  <p className="text-xs text-[var(--color-text-primary)] italic">
                    &ldquo;{quote}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Labels */}
      {report.suggestedLabels.length > 0 && (
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[10px] font-semibold text-[var(--color-text-secondary)] mr-1">
            Labels:
          </span>
          {report.suggestedLabels.map((label) => (
            <span
              key={label}
              className="rounded-full bg-[var(--color-accent)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-accent)]"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy Report
            </>
          )}
        </button>
        <span className="text-[10px] text-[var(--color-text-secondary)] italic">
          Jira integration coming soon
        </span>
      </div>
    </div>
  );
}
