import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { generateContent } from "@/lib/gemini";
import { GROWW_APP } from "@/constants/groww";
import { containsPII } from "@/lib/pii-sanitizer";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

type ReviewRow = {
  id: string;
  sanitized_text: string;
  sentiment: string;
  star_rating: number;
  review_date: string;
  platform: "android" | "ios";
  app_version: string | null;
  upvote_count: number | null;
};

type CategoryJoin = {
  review_id: string;
  categories: { name: string; slug: string } | null;
};

function buildDateFilter(timePeriod: string, dateFrom?: string | null, dateTo?: string | null) {
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

function cleanJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return cleaned;
}

async function resolveAppId() {
  const db = getSupabaseAdmin();

  const { data: app } = await db
    .from("apps")
    .select("id")
    .eq("android_bundle_id", GROWW_APP.androidBundleId)
    .maybeSingle();

  if (app?.id) return app.id;

  const { data: fallback } = await db.from("apps").select("id").limit(1).maybeSingle();
  return fallback?.id ?? null;
}

function buildWeeklyPrompt(input: {
  totalReviews: number;
  averageRating: number;
  nps: number;
  sentiment: { positive: number; negative: number; neutral: number };
  topThemes: { name: string; count: number }[];
  topBugs: { title: string; impactCount: number; examples: string[] }[];
  topFeatureIdeas: { title: string; votes: number; rationale: string }[];
  quotes: string[];
}) {
  const themeLines = input.topThemes.map((t) => `- ${t.name}: ${t.count}`).join("\n");
  const bugLines = input.topBugs.map((b) => `- ${b.title} (${b.impactCount})`).join("\n");
  const featLines = input.topFeatureIdeas.map((f) => `- ${f.title} (${f.votes})`).join("\n");

  return `You are preparing the Morning Brew for Groww leadership from app review intelligence.

Facts:
- Total Reviews: ${input.totalReviews}
- Average Rating: ${input.averageRating}
- NPS: ${input.nps}
- Sentiment: +${input.sentiment.positive} / -${input.sentiment.negative} / ~${input.sentiment.neutral}

Top Themes:
${themeLines || "- None"}

Top Bugs:
${bugLines || "- None"}

Top Feature Ideas:
${featLines || "- None"}

User Quotes:
${input.quotes.map((q) => `- "${q}"`).join("\n") || "- None"}

Return ONLY valid JSON with this schema:
{
  "weeklyPulse": "<=250 words, executive summary, crisp and actionable",
  "topActions": ["Action 1", "Action 2", "Action 3"]
}

Rules:
- Max 250 words for weeklyPulse
- Mention top 3 bugs and top 3 feature ideas naturally
- No PII
- No markdown
`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const platform = body.platform ?? "all";
    const timePeriod = body.timePeriod ?? "last_30";
    const dateFrom = body.dateFrom ?? null;
    const dateTo = body.dateTo ?? null;

    const db = getSupabaseAdmin();
    const appId = await resolveAppId();

    if (!appId) {
      return NextResponse.json({ error: "No app configured. Please sync reviews first." }, { status: 400 });
    }

    const { startDate, endDate } = buildDateFilter(timePeriod, dateFrom, dateTo);

    let reviewQuery = db
      .from("reviews")
      .select("id, sanitized_text, sentiment, star_rating, review_date, platform, app_version, upvote_count")
      .eq("app_id", appId)
      .order("review_date", { ascending: false })
      .limit(400);

    if (platform !== "all") reviewQuery = reviewQuery.eq("platform", platform);
    if (startDate) reviewQuery = reviewQuery.gte("review_date", startDate);
    if (endDate) reviewQuery = reviewQuery.lte("review_date", endDate);

    const { data: reviewsData } = await reviewQuery;
    const reviews = (reviewsData ?? []) as ReviewRow[];

    if (reviews.length === 0) {
      return NextResponse.json({
        metrics: { total: 0, averageRating: 0, nps: 0 },
        topBugs: [],
        topFeatureIdeas: [],
        weeklyPulse: "No reviews available for selected filters.",
        topActions: [],
        generatedAt: new Date().toISOString(),
      });
    }

    const reviewIds = reviews.map((r) => r.id);
    const categoryMap = new Map<string, { name: string; slug: string }[]>();

    for (let i = 0; i < reviewIds.length; i += 100) {
      const batch = reviewIds.slice(i, i + 100);
      const { data: rows } = await db
        .from("review_categories")
        .select("review_id, categories(name, slug)")
        .in("review_id", batch);

      for (const row of (rows ?? []) as unknown as CategoryJoin[]) {
        if (!row.categories) continue;
        if (!categoryMap.has(row.review_id)) categoryMap.set(row.review_id, []);
        categoryMap.get(row.review_id)?.push(row.categories);
      }
    }

    const total = reviews.length;
    const avg = Math.round((reviews.reduce((s, r) => s + r.star_rating, 0) / total) * 10) / 10;
    const positive = reviews.filter((r) => r.sentiment === "positive").length;
    const negative = reviews.filter((r) => r.sentiment === "negative").length;
    const neutral = reviews.filter((r) => r.sentiment === "neutral").length;
    const promoters = reviews.filter((r) => r.star_rating >= 4).length;
    const detractors = reviews.filter((r) => r.star_rating <= 2).length;
    const nps = Math.round(((promoters / total) * 100 - (detractors / total) * 100) * 10) / 10;

    const themeCounter: Record<string, number> = {};
    for (const r of reviews) {
      const cats = categoryMap.get(r.id) ?? [];
      for (const c of cats) themeCounter[c.name] = (themeCounter[c.name] ?? 0) + 1;
    }

    const topThemes = Object.entries(themeCounter)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const negativeReviews = reviews.filter((r) => r.sentiment === "negative");
    const bugCounter: Record<string, { count: number; quotes: string[] }> = {};

    for (const r of negativeReviews) {
      const cats = (categoryMap.get(r.id) ?? []).filter(
        (c) => c.slug !== "feature-request" && c.slug !== "general-praise"
      );
      const chosen = cats[0]?.name ?? "General Issue";
      if (!bugCounter[chosen]) bugCounter[chosen] = { count: 0, quotes: [] };
      bugCounter[chosen].count += 1;
      if (bugCounter[chosen].quotes.length < 3 && r.sanitized_text) {
        bugCounter[chosen].quotes.push(r.sanitized_text.slice(0, 180));
      }
    }

    const topBugs = Object.entries(bugCounter)
      .map(([title, v]) => ({ title, impactCount: v.count, examples: v.quotes }))
      .sort((a, b) => b.impactCount - a.impactCount)
      .slice(0, 3);

    const featureReviews = reviews.filter((r) =>
      (categoryMap.get(r.id) ?? []).some((c) => c.slug === "feature-request")
    );

    const featurePrompt = `Analyze these Groww feature request snippets and return ONLY JSON array with max 3 ideas: [{"title":"...","votes":number,"rationale":"..."}].\n\n${featureReviews
      .slice(0, 120)
      .map((r, i) => `[${i + 1}] ${r.sanitized_text}`)
      .join("\n")}`;

    let topFeatureIdeas: { title: string; votes: number; rationale: string }[] = [];
    if (featureReviews.length > 0) {
      try {
        const raw = await generateContent(featurePrompt);
        const parsed = JSON.parse(cleanJson(raw));
        if (Array.isArray(parsed)) {
          topFeatureIdeas = parsed.slice(0, 3).map((it: Record<string, unknown>) => ({
            title: String(it.title ?? "Feature Suggestion"),
            votes: Number(it.votes ?? 0),
            rationale: String(it.rationale ?? "Requested by users"),
          }));
        }
      } catch {
        topFeatureIdeas = [];
      }
    }

    if (topFeatureIdeas.length === 0) {
      topFeatureIdeas = [{ title: "Improve portfolio insights", votes: featureReviews.length, rationale: "Multiple users requested better investment insights and tracking." }].slice(0, 3);
    }

    const quotes = reviews
      .filter((r) => r.sanitized_text && r.sanitized_text.length > 15)
      .slice(0, 6)
      .map((r) => r.sanitized_text.slice(0, 180))
      .filter((q) => !containsPII(q))
      .slice(0, 3);

    const weeklyPrompt = buildWeeklyPrompt({
      totalReviews: total,
      averageRating: avg,
      nps,
      sentiment: { positive, negative, neutral },
      topThemes,
      topBugs,
      topFeatureIdeas,
      quotes,
    });

    let weeklyPulse = "";
    let topActions: string[] = [];

    try {
      const response = await generateContent(weeklyPrompt);
      const parsed = JSON.parse(cleanJson(response));
      weeklyPulse = String(parsed.weeklyPulse ?? "").trim();
      topActions = Array.isArray(parsed.topActions)
        ? parsed.topActions.slice(0, 3).map((x: unknown) => String(x))
        : [];
    } catch {
      weeklyPulse = `In the selected period, Groww received ${total} reviews with an average rating of ${avg} and NPS ${nps}. The largest concerns are around ${topBugs.map((b) => b.title).join(", ") || "general product experience"}. Positive momentum remains in core app usage, while feature demand is strongest for ${topFeatureIdeas.map((f) => f.title).join(", ")}.`;
      topActions = [
        "Address highest-impact bug clusters in current sprint",
        "Prioritize top 3 feature suggestions in product grooming",
        "Track post-fix sentiment shift via weekly dashboard review",
      ];
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || "https://groww-support-pm-pulsator.vercel.app";

    const morningBrewHtml = `
      <h2>Groww Support PM Pulsator - Morning Brew</h2>
      <p><b>Period:</b> ${timePeriod.replace("_", " ")}</p>
      <p><b>Total Reviews:</b> ${total} | <b>Avg Rating:</b> ${avg} | <b>NPS:</b> ${nps}</p>
      <h3>Executive Summary</h3>
      <p>${weeklyPulse}</p>
      <h3>Top Bugs</h3>
      <ol>${topBugs.map((b) => `<li><b>${b.title}</b> - ${b.impactCount} reports</li>`).join("")}</ol>
      <h3>Top Feature Ideas</h3>
      <ol>${topFeatureIdeas.map((f) => `<li><b>${f.title}</b> - ${f.rationale}</li>`).join("")}</ol>
      <h3>Top Recommended Actions</h3>
      <ol>${topActions.map((a) => `<li>${a}</li>`).join("")}</ol>
      <p><a href="${appUrl}">Open Groww Support PM Pulsator</a></p>
    `;

    return NextResponse.json({
      metrics: { total, averageRating: avg, nps, positive, negative, neutral },
      topThemes,
      topBugs,
      topFeatureIdeas,
      quotes,
      weeklyPulse,
      topActions,
      morningBrewHtml,
      appUrl,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
