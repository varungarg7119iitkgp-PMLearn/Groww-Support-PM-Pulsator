import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { GROWW_APP } from "@/constants/groww";

export const dynamic = "force-dynamic";

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

    if (!app) {
      return NextResponse.json({
        total: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        sentimentCounts: { positive: 0, negative: 0, neutral: 0 },
        averageRating: 0,
        nps: null,
      });
    }

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

    let query = db
      .from("reviews")
      .select("star_rating, sentiment")
      .eq("app_id", app.id);

    if (platform !== "all") query = query.eq("platform", platform);
    if (startDate) query = query.gte("review_date", startDate);
    if (endDate) query = query.lte("review_date", endDate);

    const { data: allReviews } = await query;

    const reviews = allReviews ?? [];
    const total = reviews.length;

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    let ratingSum = 0;

    for (const r of reviews) {
      const row = r as { star_rating: number; sentiment: string };
      ratingDistribution[row.star_rating] = (ratingDistribution[row.star_rating] || 0) + 1;
      ratingSum += row.star_rating;
      if (row.sentiment === "positive") sentimentCounts.positive++;
      else if (row.sentiment === "negative") sentimentCounts.negative++;
      else if (row.sentiment === "neutral") sentimentCounts.neutral++;
    }

    const averageRating = total > 0 ? Math.round((ratingSum / total) * 10) / 10 : 0;

    // NPS = %Promoters(4-5 stars) - %Detractors(1-2 stars)
    let nps: number | null = null;
    if (total > 0) {
      const promoters = (ratingDistribution[4] || 0) + (ratingDistribution[5] || 0);
      const detractors = (ratingDistribution[1] || 0) + (ratingDistribution[2] || 0);
      nps = Math.round(((promoters - detractors) / total) * 100);
    }

    return NextResponse.json({
      total,
      ratingDistribution,
      sentimentCounts,
      averageRating,
      nps,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
