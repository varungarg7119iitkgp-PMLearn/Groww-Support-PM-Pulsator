import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { GROWW_APP } from "@/constants/groww";

export const dynamic = "force-dynamic";

interface ReviewRow {
  id: string;
  star_rating: number;
  sentiment: string;
  review_date: string;
}

interface CategoryJoinRow {
  review_id: string;
  categories: { name: string; slug: string } | null;
}

function buildDateFilter(timePeriod: string, dateFrom: string | null, dateTo: string | null) {
  const now = new Date();
  let startDate: string | null = null;
  let endDate: string | null = null;

  if (timePeriod === "custom" && dateFrom && dateTo) {
    startDate = dateFrom;
    endDate = dateTo;
  } else {
    switch (timePeriod) {
      case "today":
        startDate = now.toISOString().split("T")[0];
        break;
      case "yesterday": {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        startDate = y.toISOString().split("T")[0];
        endDate = startDate;
        break;
      }
      case "last_7": {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        startDate = d.toISOString().split("T")[0];
        break;
      }
      case "last_15": {
        const d = new Date(now);
        d.setDate(d.getDate() - 15);
        startDate = d.toISOString().split("T")[0];
        break;
      }
      case "last_30":
      default: {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        startDate = d.toISOString().split("T")[0];
        break;
      }
    }
  }
  return { startDate, endDate };
}

export async function GET(request: NextRequest) {
  try {
    const db = getSupabaseAdmin();
    const url = new URL(request.url);

    const platform = url.searchParams.get("platform") || "all";
    const timePeriod = url.searchParams.get("timePeriod") || "last_30";
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");

    const { data: app } = await db
      .from("apps")
      .select("id")
      .eq("android_bundle_id", GROWW_APP.androidBundleId)
      .maybeSingle();

    const empty = {
      metrics: { total: 0, averageRating: 0, positive: 0, negative: 0, neutral: 0, positivePercent: 0, negativePercent: 0, neutralPercent: 0 },
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
      categoryDistribution: [],
      trends: [],
    };

    if (!app) return NextResponse.json(empty);

    const { startDate, endDate } = buildDateFilter(timePeriod, dateFrom, dateTo);

    // Fetch all matching reviews (star_rating, sentiment, review_date)
    let reviewQuery = db
      .from("reviews")
      .select("id, star_rating, sentiment, review_date")
      .eq("app_id", app.id);

    if (platform !== "all") reviewQuery = reviewQuery.eq("platform", platform);
    if (startDate) reviewQuery = reviewQuery.gte("review_date", startDate);
    if (endDate) reviewQuery = reviewQuery.lte("review_date", endDate);

    const { data: allReviews } = await reviewQuery;
    const reviews = (allReviews ?? []) as ReviewRow[];
    const total = reviews.length;

    // Metrics
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const sentimentDistribution = { positive: 0, negative: 0, neutral: 0 };
    let ratingSum = 0;

    for (const r of reviews) {
      ratingDistribution[r.star_rating] = (ratingDistribution[r.star_rating] || 0) + 1;
      ratingSum += r.star_rating;
      if (r.sentiment === "positive") sentimentDistribution.positive++;
      else if (r.sentiment === "negative") sentimentDistribution.negative++;
      else if (r.sentiment === "neutral") sentimentDistribution.neutral++;
    }

    const averageRating = total > 0 ? Math.round((ratingSum / total) * 10) / 10 : 0;

    const metrics = {
      total,
      averageRating,
      positive: sentimentDistribution.positive,
      negative: sentimentDistribution.negative,
      neutral: sentimentDistribution.neutral,
      positivePercent: total > 0 ? Math.round((sentimentDistribution.positive / total) * 1000) / 10 : 0,
      negativePercent: total > 0 ? Math.round((sentimentDistribution.negative / total) * 1000) / 10 : 0,
      neutralPercent: total > 0 ? Math.round((sentimentDistribution.neutral / total) * 1000) / 10 : 0,
    };

    // Category distribution
    const reviewIds = reviews.map((r) => r.id);

    let categoryDistribution: { name: string; slug: string; count: number; percent: number }[] = [];
    if (reviewIds.length > 0) {
      const batchSize = 100;
      const categoryCount: Record<string, { name: string; slug: string; count: number }> = {};

      for (let i = 0; i < reviewIds.length; i += batchSize) {
        const batch = reviewIds.slice(i, i + batchSize);
        const { data: rcData, error: rcError } = await db
          .from("review_categories")
          .select("review_id, categories(name, slug)")
          .in("review_id", batch);

        if (rcError) {
          console.error("Category batch error:", rcError.message);
          continue;
        }

        for (const row of (rcData ?? []) as unknown as CategoryJoinRow[]) {
          if (!row.categories) continue;
          const key = row.categories.slug;
          if (!categoryCount[key]) {
            categoryCount[key] = { name: row.categories.name, slug: key, count: 0 };
          }
          categoryCount[key].count++;
        }
      }

      categoryDistribution = Object.values(categoryCount)
        .map((c) => ({ ...c, percent: total > 0 ? Math.round((c.count / total) * 1000) / 10 : 0 }))
        .sort((a, b) => b.count - a.count);
    }

    // Trend data: group reviews by date and category
    const dateReviewMap: Record<string, string[]> = {};
    for (const r of reviews) {
      const date = r.review_date;
      const rid = r.id;
      if (!dateReviewMap[date]) dateReviewMap[date] = [];
      dateReviewMap[date].push(rid);
    }

    // Build trend: date → { total, positive, negative, neutral, ...categories }
    const trendMap: Record<string, Record<string, number>> = {};
    const allDates = Object.keys(dateReviewMap).sort();

    for (const date of allDates) {
      trendMap[date] = { total: 0, positive: 0, negative: 0, neutral: 0 };
    }

    for (const r of reviews) {
      const date = r.review_date;
      trendMap[date].total++;
      if (r.sentiment === "positive") trendMap[date].positive++;
      else if (r.sentiment === "negative") trendMap[date].negative++;
      else if (r.sentiment === "neutral") trendMap[date].neutral++;
    }

    // Add category counts per date
    if (reviewIds.length > 0) {
      const reviewDateMap: Record<string, string> = {};
      for (const r of reviews) {
        reviewDateMap[r.id] = r.review_date;
      }

      for (let i = 0; i < reviewIds.length; i += 100) {
        const batch = reviewIds.slice(i, i + 100);
        const { data: rcData } = await db
          .from("review_categories")
          .select("review_id, categories(slug)")
          .in("review_id", batch);

        for (const row of (rcData ?? []) as unknown as { review_id: string; categories: { slug: string } | null }[]) {
          if (!row.categories) continue;
          const date = reviewDateMap[row.review_id];
          if (!date || !trendMap[date]) continue;
          const slug = row.categories.slug;
          trendMap[date][slug] = (trendMap[date][slug] || 0) + 1;
        }
      }
    }

    const trends = allDates.map((date) => ({
      date,
      ...trendMap[date],
    }));

    return NextResponse.json({
      metrics,
      ratingDistribution,
      sentimentDistribution,
      categoryDistribution,
      trends,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
