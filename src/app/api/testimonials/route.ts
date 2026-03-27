import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { GROWW_APP } from "@/constants/groww";

export const dynamic = "force-dynamic";

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "shall",
  "should", "may", "might", "must", "can", "could", "i", "me", "my",
  "we", "our", "you", "your", "he", "she", "it", "they", "them", "their",
  "this", "that", "these", "those", "of", "in", "on", "at", "to", "for",
  "with", "by", "from", "up", "about", "into", "through", "during",
  "before", "after", "above", "below", "between", "under", "again",
  "further", "then", "once", "here", "there", "when", "where", "why",
  "how", "all", "both", "each", "few", "more", "most", "other", "some",
  "such", "no", "nor", "not", "only", "own", "same", "so", "than",
  "too", "very", "just", "don", "dont", "should", "now", "also", "get",
  "got", "its", "im", "ive", "thats", "youre", "wont", "cant", "isnt",
  "but", "and", "or", "if", "out", "any", "as", "what", "which", "who",
  "whom", "while", "much", "many", "even", "still", "every", "been",
  "like", "really", "use", "used", "using", "one", "two", "well", "way",
  "make", "made", "going", "back", "take", "come", "know", "see", "time",
  "want", "think", "look", "give", "day", "because", "thing", "things",
  "could", "go", "need", "new", "will", "say", "said", "work", "first",
  "try", "keep", "let", "lot", "put", "since", "long", "right", "done",
  "able", "over", "year", "years", "something", "nothing", "everything",
]);

function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
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
    const topN = Math.min(parseInt(url.searchParams.get("topN") || "30", 10), 100);

    const { data: app } = await db
      .from("apps")
      .select("id")
      .eq("android_bundle_id", GROWW_APP.androidBundleId)
      .maybeSingle();

    const empty = {
      metrics: { totalReviews: 0, totalWords: 0, uniqueWords: 0 },
      wordFrequencies: [],
      topUpvoted: [],
    };

    if (!app) return NextResponse.json(empty);

    const { startDate, endDate } = buildDateFilter(timePeriod, dateFrom, dateTo);

    // Fetch sanitized text for word analysis
    let textQuery = db
      .from("reviews")
      .select("sanitized_text")
      .eq("app_id", app.id);

    if (platform !== "all") textQuery = textQuery.eq("platform", platform);
    if (startDate) textQuery = textQuery.gte("review_date", startDate);
    if (endDate) textQuery = textQuery.lte("review_date", endDate);

    const { data: textRows } = await textQuery;
    const texts = (textRows ?? []) as { sanitized_text: string }[];

    // Word frequency analysis
    const freq: Record<string, number> = {};
    let totalWords = 0;

    for (const row of texts) {
      const words = extractWords(row.sanitized_text);
      totalWords += words.length;
      for (const w of words) {
        freq[w] = (freq[w] || 0) + 1;
      }
    }

    const uniqueWords = Object.keys(freq).length;

    const wordFrequencies = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word, count]) => ({ word, count }));

    // Top upvoted reviews
    let upvotedQuery = db
      .from("reviews")
      .select("id, platform, author_name, star_rating, sanitized_text, review_text, sentiment, app_version, device_info, upvote_count, review_date, ingested_at, platform_review_id, app_id, os_version")
      .eq("app_id", app.id)
      .not("upvote_count", "is", null)
      .gt("upvote_count", 0)
      .order("upvote_count", { ascending: false })
      .limit(10);

    if (platform !== "all") upvotedQuery = upvotedQuery.eq("platform", platform);
    if (startDate) upvotedQuery = upvotedQuery.gte("review_date", startDate);
    if (endDate) upvotedQuery = upvotedQuery.lte("review_date", endDate);

    const { data: upvotedRows } = await upvotedQuery;

    // Fetch categories for upvoted reviews
    const upvotedReviews = upvotedRows ?? [];
    const upvotedIds = upvotedReviews.map((r: { id: string }) => r.id);
    let categoriesMap: Record<string, { id: string; name: string; slug: string }[]> = {};

    if (upvotedIds.length > 0) {
      const { data: rcData } = await db
        .from("review_categories")
        .select("review_id, categories(id, name, slug)")
        .in("review_id", upvotedIds);

      for (const row of (rcData ?? []) as unknown as {
        review_id: string;
        categories: { id: string; name: string; slug: string } | null;
      }[]) {
        if (!row.categories) continue;
        if (!categoriesMap[row.review_id]) categoriesMap[row.review_id] = [];
        categoriesMap[row.review_id].push(row.categories);
      }
    }

    const topUpvoted = upvotedReviews.map((r: { id: string }) => ({
      ...r,
      categories: categoriesMap[r.id] || [],
    }));

    return NextResponse.json({
      metrics: {
        totalReviews: texts.length,
        totalWords,
        uniqueWords,
      },
      wordFrequencies,
      topUpvoted,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
