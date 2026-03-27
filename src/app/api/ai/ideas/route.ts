import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { GROWW_APP } from "@/constants/groww";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

function sanitizeJsonControlChars(input: string): string {
  let out = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inString) {
      if (escaped) {
        out += ch;
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        out += ch;
        escaped = true;
        continue;
      }
      if (ch === "\"") {
        out += ch;
        inString = false;
        continue;
      }
      if (ch === "\n") {
        out += "\\n";
        continue;
      }
      if (ch === "\r") {
        out += "\\r";
        continue;
      }
      if (ch === "\t") {
        out += "\\t";
        continue;
      }
      const code = ch.charCodeAt(0);
      if (code >= 0 && code < 32) {
        out += " ";
        continue;
      }
      out += ch;
      continue;
    }

    if (ch === "\"") {
      inString = true;
    }
    out += ch;
  }

  return out;
}

function parseIdeasJson(responseText: string) {
  let cleaned = responseText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    const sanitized = sanitizeJsonControlChars(cleaned);
    return JSON.parse(sanitized);
  }
}

function buildDateFilter(timePeriod: string, dateFrom?: string, dateTo?: string) {
  const now = new Date();
  let startDate: string | null = null;
  let endDate: string | null = null;

  switch (timePeriod) {
    case "today":
      startDate = now.toISOString().split("T")[0];
      break;
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      startDate = y.toISOString().split("T")[0];
      endDate = y.toISOString().split("T")[0];
      break;
    }
    case "last_7":
      startDate = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];
      break;
    case "last_15":
      startDate = new Date(now.getTime() - 15 * 86400000).toISOString().split("T")[0];
      break;
    case "last_30":
      startDate = new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0];
      break;
    case "custom":
      startDate = dateFrom || null;
      endDate = dateTo || null;
      break;
  }

  return { startDate, endDate };
}

function buildIdeasPrompt(reviews: { text: string; rating: number; categories: string[] }[]): string {
  const reviewList = reviews
    .map(
      (r, i) =>
        `[${i + 1}] Rating: ${r.rating}/5 | Categories: ${r.categories.join(", ") || "N/A"} | "${r.text.slice(0, 300)}"`
    )
    .join("\n");

  return `You are a senior Product Manager at Groww (an Indian investment & trading app). Analyze the following ${reviews.length} negative/neutral user reviews and generate actionable product improvement ideas.

Reviews:
${reviewList}

Instructions:
1. Group similar complaints into themes
2. For each theme, provide:
   - A clear, concise title (5-8 words)
   - A 2-3 sentence rationale explaining the user pain point
   - Estimated impact: how many of the ${reviews.length} reviews relate to this theme
   - A specific, actionable recommendation for the product/engineering team
3. Return 3-7 themes, sorted by impact (highest first)
4. Do NOT include any PII or user names
5. Be specific to Groww's domain (trading, mutual funds, payments, KYC, etc.)
6. Explicitly leverage "Feature Request" patterns and convert them into concrete, prioritized product suggestions

Return ONLY a valid JSON array with this structure (no markdown, no code fences):
[
  {
    "title": "Theme title",
    "rationale": "Why this matters...",
    "reviewCount": <number>,
    "recommendation": "Specific action to take..."
  }
]

JSON array:`;
}

async function resolveAppId() {
  const db = getSupabaseAdmin();

  const { data: growwApp } = await db
    .from("apps")
    .select("id")
    .eq("android_bundle_id", GROWW_APP.androidBundleId)
    .maybeSingle();

  if (growwApp?.id) return growwApp.id;

  const { data: anyApp } = await db
    .from("apps")
    .select("id")
    .limit(1)
    .maybeSingle();

  return anyApp?.id ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, timePeriod, dateFrom, dateTo } = body;

    const db = getSupabaseAdmin();
    const appId = await resolveAppId();
    if (!appId) {
      return NextResponse.json(
        {
          ideas: [],
          message: "No app configured yet. Please run review sync first.",
          totalAnalyzed: 0,
        },
        { status: 200 }
      );
    }

    let query = db
      .from("reviews")
      .select("id, sanitized_text, star_rating, sentiment")
      .eq("app_id", appId)
      .in("sentiment", ["negative", "neutral"])
      .order("review_date", { ascending: false })
      .limit(100);

    if (platform && platform !== "all") {
      query = query.eq("platform", platform);
    }

    const { startDate, endDate } = buildDateFilter(
      timePeriod || "last_30",
      dateFrom,
      dateTo
    );
    if (startDate) query = query.gte("review_date", startDate);
    if (endDate) query = query.lte("review_date", endDate);

    const { data: baseReviews } = await query;

    const { data: featureCategory } = await db
      .from("categories")
      .select("id")
      .eq("slug", "feature-request")
      .maybeSingle();

    let featureReviews: { id: string; sanitized_text: string; star_rating: number; sentiment: string }[] = [];

    if (featureCategory?.id) {
      let featureIdsQuery = db
        .from("review_categories")
        .select("review_id")
        .eq("category_id", featureCategory.id)
        .limit(150);

      const { data: featureReviewIds } = await featureIdsQuery;
      const ids = (featureReviewIds ?? []).map((r: { review_id: string }) => r.review_id);

      if (ids.length > 0) {
        let featureQuery = db
          .from("reviews")
          .select("id, sanitized_text, star_rating, sentiment")
          .eq("app_id", appId)
          .in("id", ids)
          .order("review_date", { ascending: false })
          .limit(60);

        if (platform && platform !== "all") {
          featureQuery = featureQuery.eq("platform", platform);
        }
        if (startDate) featureQuery = featureQuery.gte("review_date", startDate);
        if (endDate) featureQuery = featureQuery.lte("review_date", endDate);

        const { data } = await featureQuery;
        featureReviews = data ?? [];
      }
    }

    const reviewMap = new Map<string, { id: string; sanitized_text: string; star_rating: number; sentiment: string }>();
    for (const r of baseReviews ?? []) reviewMap.set(r.id, r);
    for (const r of featureReviews) reviewMap.set(r.id, r);
    const reviews = Array.from(reviewMap.values()).slice(0, 140);

    if (!reviews || reviews.length < 5) {
      return NextResponse.json({
        ideas: [],
        message:
          reviews && reviews.length > 0
            ? `Only ${reviews.length} negative/neutral reviews found. Need at least 5 for meaningful analysis.`
            : "No negative or neutral reviews found for the selected filters.",
        totalAnalyzed: reviews?.length ?? 0,
      });
    }

    const reviewIds = reviews.map((r) => r.id);
    const batchSize = 100;
    const categoryMap = new Map<string, string[]>();

    for (let i = 0; i < reviewIds.length; i += batchSize) {
      const batch = reviewIds.slice(i, i + batchSize);
      const { data: rcData } = await db
        .from("review_categories")
        .select("review_id, category_id, categories(name)")
        .in("review_id", batch);

      if (rcData) {
        for (const rc of rcData) {
          const rid = rc.review_id;
          const catName = (rc.categories as unknown as { name: string })?.name;
          if (catName) {
            if (!categoryMap.has(rid)) categoryMap.set(rid, []);
            categoryMap.get(rid)!.push(catName);
          }
        }
      }
    }

    const enriched = reviews.map((r) => ({
      text: r.sanitized_text || "",
      rating: r.star_rating,
      categories: categoryMap.get(r.id) || [],
    }));

    const prompt = buildIdeasPrompt(enriched);
    const responseText = await generateContent(prompt);

    const ideas = parseIdeasJson(responseText);

    return NextResponse.json({
      ideas,
      totalAnalyzed: reviews.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Idea generation failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
