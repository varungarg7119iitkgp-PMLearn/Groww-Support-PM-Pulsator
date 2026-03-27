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
    const starRating = url.searchParams.get("starRating");
    const sentiment = url.searchParams.get("sentiment");
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = Math.min(
      parseInt(url.searchParams.get("pageSize") || "25", 10),
      100
    );

    const { data: app } = await db
      .from("apps")
      .select("id")
      .eq("android_bundle_id", GROWW_APP.androidBundleId)
      .maybeSingle();

    if (!app) {
      return NextResponse.json({ reviews: [], total: 0, page, pageSize, totalPages: 0 });
    }

    // If category filter is active, pre-fetch matching review IDs
    let categoryReviewIds: string[] | null = null;
    if (category) {
      const { data: catData } = await db
        .from("categories")
        .select("id")
        .eq("slug", category)
        .maybeSingle();

      if (!catData) {
        return NextResponse.json({ reviews: [], total: 0, page, pageSize, totalPages: 0 });
      }

      const { data: junctionRows } = await db
        .from("review_categories")
        .select("review_id")
        .eq("category_id", catData.id);

      categoryReviewIds = (junctionRows ?? []).map(
        (r: { review_id: string }) => r.review_id
      );
      if (categoryReviewIds.length === 0) {
        return NextResponse.json({ reviews: [], total: 0, page, pageSize, totalPages: 0 });
      }
    }

    let query = db
      .from("reviews")
      .select("*", { count: "exact" })
      .eq("app_id", app.id)
      .order("review_date", { ascending: false });

    if (platform !== "all") query = query.eq("platform", platform);
    if (starRating) query = query.eq("star_rating", parseInt(starRating, 10));
    if (sentiment && sentiment !== "all") query = query.eq("sentiment", sentiment);
    if (search) query = query.ilike("sanitized_text", `%${search}%`);
    if (categoryReviewIds) query = query.in("id", categoryReviewIds);

    // Time period
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

    if (startDate) query = query.gte("review_date", startDate);
    if (endDate) query = query.lte("review_date", endDate);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: reviews, count, error } = await query;
    if (error) throw new Error(error.message);

    // Fetch categories for these reviews in one query
    const reviewIds = (reviews ?? []).map(
      (r: { id: string }) => r.id
    );

    let categoriesMap: Record<string, { id: string; name: string; slug: string }[]> = {};

    if (reviewIds.length > 0) {
      const { data: rcData } = await db
        .from("review_categories")
        .select("review_id, category_id, categories(id, name, slug)")
        .in("review_id", reviewIds);

      for (const row of rcData ?? []) {
        const r = row as unknown as {
          review_id: string;
          categories: { id: string; name: string; slug: string } | null;
        };
        if (!r.categories) continue;
        if (!categoriesMap[r.review_id]) categoriesMap[r.review_id] = [];
        categoriesMap[r.review_id].push(r.categories);
      }
    }

    const formatted = (reviews ?? []).map((r: { id: string }) => ({
      ...r,
      categories: categoriesMap[r.id] || [],
    }));

    return NextResponse.json({
      reviews: formatted,
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
