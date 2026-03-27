"use client";

import { useRouter } from "next/navigation";
import {
  Tags,
  Paintbrush,
  Lightbulb,
  HeadphonesIcon,
  Zap,
  CreditCard,
  ShieldAlert,
  LogIn,
  Bell,
  UserCog,
  UserPlus,
  Bug,
  MoreHorizontal,
  KeyRound,
  ThumbsUp,
  TrendingUp,
  PiggyBank,
  DollarSign,
  MousePointerClick,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FilterBar } from "@/components/shared/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { CategoryChart } from "@/components/analytics/category-chart";
import { CategoryStatsList } from "@/components/analytics/category-stats-list";
import { SentimentChart } from "@/components/analytics/sentiment-chart";
import { AnalyticsSkeleton } from "@/components/analytics/analytics-skeleton";
import { useAnalytics } from "@/hooks/use-analytics";
import type { CategoryDist } from "@/hooks/use-analytics";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "ui-ux": Paintbrush,
  "feature-request": Lightbulb,
  "customer-support": HeadphonesIcon,
  "performance": Zap,
  "payments": CreditCard,
  "transaction-issues": ShieldAlert,
  "login-issues": LogIn,
  "app-crash": Bug,
  "notifications": Bell,
  "account-issues": UserCog,
  "onboarding": UserPlus,
  "security": ShieldAlert,
  "kyc": KeyRound,
  "general-praise": ThumbsUp,
  "investment-trading": TrendingUp,
  "mutual-funds-sip": PiggyBank,
  "charges-fees": DollarSign,
  "ease-of-use": MousePointerClick,
  "reliability": ShieldCheck,
  "others": MoreHorizontal,
};

const CATEGORY_COLORS: Record<string, string> = {
  "ui-ux": "#8B5CF6",
  "feature-request": "#F59E0B",
  "customer-support": "#06B6D4",
  "performance": "#F97316",
  "payments": "#00D09C",
  "transaction-issues": "#F56565",
  "login-issues": "#EC4899",
  "app-crash": "#EF4444",
  "notifications": "#A855F7",
  "account-issues": "#6366F1",
  "onboarding": "#3B82F6",
  "security": "#14B8A6",
  "kyc": "#84CC16",
  "general-praise": "#10B981",
  "investment-trading": "#0EA5E9",
  "mutual-funds-sip": "#D946EF",
  "charges-fees": "#F43F5E",
  "ease-of-use": "#22D3EE",
  "reliability": "#059669",
  "others": "#9CA3AF",
};

function TopCategoryCard({
  category,
  rank,
  onClick,
}: {
  category: CategoryDist;
  rank: number;
  onClick: () => void;
}) {
  const Icon = CATEGORY_ICONS[category.slug] || Tags;
  const color = CATEGORY_COLORS[category.slug] || "#6366F1";
  const medals = ["", "🥇", "🥈", "🥉"];

  return (
    <button
      onClick={onClick}
      className="rounded-xl border bg-[var(--color-bg-card)] p-5 shadow-sm transition-all hover:shadow-md hover:border-[var(--color-accent)] group text-left"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: `${color}18` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <span className="text-lg">{medals[rank]}</span>
      </div>
      <p className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
        {category.name}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[var(--color-text-primary)]">
          {category.count}
        </span>
        <span className="text-xs text-[var(--color-text-secondary)]">
          reviews
        </span>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
          style={{ background: color }}
        >
          {category.percent}%
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-[var(--color-bg-main)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${category.percent}%`, background: color, minWidth: category.percent > 0 ? "4px" : "0" }}
        />
      </div>
    </button>
  );
}

export default function CategoriesPage() {
  const { data, isLoading } = useAnalytics();
  const router = useRouter();

  const hasData = data && data.metrics.total > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          Categories
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          AI-identified themes and category distribution across Groww reviews
        </p>
      </div>

      <FilterBar />

      {isLoading ? (
        <AnalyticsSkeleton />
      ) : !hasData ? (
        <EmptyState
          icon={Tags}
          title="No categories yet"
          description="Categories are automatically generated when reviews are processed by AI. You'll see category distribution charts and drill-down stats here."
          action="Categories will appear after AI processing"
        />
      ) : (
        <>
          {/* Top 3 Category Icon Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.categoryDistribution.slice(0, 3).map((cat, i) => (
              <TopCategoryCard
                key={cat.slug}
                category={cat}
                rank={i + 1}
                onClick={() => router.push(`/?category=${cat.slug}`)}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CategoryChart data={data.categoryDistribution} />
            <CategoryStatsList
              data={data.categoryDistribution}
              total={data.metrics.total}
            />
          </div>

          <SentimentChart
            distribution={data.sentimentDistribution}
            ratingDistribution={data.ratingDistribution}
          />
        </>
      )}
    </div>
  );
}
