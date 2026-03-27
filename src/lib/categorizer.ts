import { generateContent } from "./gemini";
import { getSupabaseAdmin } from "./supabase-server";

const BATCH_SIZE = 25;
const MAX_RETRIES = 3;
const RETRY_DELAYS = [5000, 15000, 30000];
const INTER_BATCH_DELAY = 5000;

const VALID_SENTIMENTS = ["positive", "negative", "neutral"] as const;

const VALID_CATEGORIES = [
  "Login Issues",
  "KYC",
  "Payments",
  "App Crash",
  "UI/UX",
  "Performance",
  "Customer Support",
  "Transaction Issues",
  "Account Issues",
  "Feature Request",
  "Security",
  "Onboarding",
  "Notifications",
  "General Praise",
  "Investment & Trading",
  "Mutual Funds & SIP",
  "Charges & Fees",
  "Ease of Use",
  "Reliability",
  "Others",
] as const;

interface ReviewForCategorization {
  id: string;
  sanitized_text: string;
  star_rating: number;
}

interface CategorizedResult {
  index: number;
  sentiment: "positive" | "negative" | "neutral";
  categories: string[];
}

export interface CategorizationProgress {
  total: number;
  categorized: number;
  uncategorized: number;
  percentComplete: number;
}

function buildPrompt(reviews: ReviewForCategorization[]): string {
  const reviewEntries = reviews
    .map(
      (r, i) =>
        `[${i}] Rating: ${r.star_rating}/5 | Text: "${r.sanitized_text.slice(0, 500)}"`
    )
    .join("\n");

  return `You are a review classification engine for the Groww financial/investment app. Analyze each review and return a JSON array.

For each review, determine:
1. **sentiment**: exactly one of: "positive", "negative", "neutral"
   - 4-5 stars with positive text = "positive"
   - 1-2 stars or complaints = "negative"
   - 3 stars or mixed feedback = "neutral"
2. **categories**: 1 to 3 categories from this EXACT list:
   ${VALID_CATEGORIES.join(", ")}

Category guidance (Groww is a stock trading & mutual fund investment app):
- "General Praise" — short positive reviews like "good", "nice", "best", "excellent", "awesome", "love it", "great app", emoji-only reviews, or any vague praise without specific topic
- "Ease of Use" — reviews mentioning "easy", "simple", "user friendly", "convenient", "smooth", "intuitive"
- "Investment & Trading" — mentions stocks, shares, trading, intraday, equity, IPO, F&O, options, derivatives
- "Mutual Funds & SIP" — mentions mutual funds, SIP, NAV, fund redemption, portfolio
- "Charges & Fees" — mentions brokerage, charges, fees, commission, hidden costs, pricing
- "Reliability" — mentions trust, reliable, dependable, stable, consistent, safe platform
- "UI/UX" — mentions design, interface, layout, navigation, look & feel, charts, dark mode
- "Performance" — mentions speed, slow, lag, loading, fast, responsive, hang
- "Others" — ONLY use when the review truly cannot fit ANY of the above categories. AVOID using "Others" as much as possible.

CRITICAL: Do NOT default to "Others". Every review can be categorized. Short praise = "General Praise". Ease mentions = "Ease of Use". Investment talk = "Investment & Trading".

Rules:
- Return ONLY a valid JSON array, no markdown, no explanation, no code fences
- Each element must have: { "index": <number>, "sentiment": "<string>", "categories": [<strings>] }

Reviews to classify:
${reviewEntries}

Return the JSON array:`;
}

function parseGeminiResponse(text: string): CategorizedResult[] {
  let cleaned = text.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    throw new Error("Response is not a JSON array");
  }

  return parsed.map((item: Record<string, unknown>) => {
    const sentiment = VALID_SENTIMENTS.includes(
      item.sentiment as (typeof VALID_SENTIMENTS)[number]
    )
      ? (item.sentiment as "positive" | "negative" | "neutral")
      : "neutral";

    const rawCategories = Array.isArray(item.categories)
      ? (item.categories as string[])
      : ["Others"];

    const categories = rawCategories
      .filter((c) =>
        VALID_CATEGORIES.includes(c as (typeof VALID_CATEGORIES)[number])
      )
      .slice(0, 3);

    return {
      index: typeof item.index === "number" ? item.index : 0,
      sentiment,
      categories: categories.length > 0 ? categories : ["Others"],
    };
  });
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function categorizeBatch(
  reviews: ReviewForCategorization[]
): Promise<CategorizedResult[]> {
  const prompt = buildPrompt(reviews);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const responseText = await generateContent(prompt);
      return parseGeminiResponse(responseText);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const is429 = message.includes("429") || message.includes("RESOURCE_EXHAUSTED") || message.includes("Too Many");
      console.error(
        `Categorization attempt ${attempt + 1} failed${is429 ? " (rate limited)" : ""}:`,
        message
      );
      if (attempt < MAX_RETRIES) {
        const delay = is429
          ? Math.max(RETRY_DELAYS[attempt], 30000)
          : RETRY_DELAYS[attempt];
        console.log(`Waiting ${delay / 1000}s before retry...`);
        await sleep(delay);
      }
    }
  }

  return [];
}

async function updateReviewsInDB(
  reviews: ReviewForCategorization[],
  results: CategorizedResult[]
): Promise<number> {
  const db = getSupabaseAdmin();
  let updated = 0;

  const { data: categories } = await db
    .from("categories")
    .select("id, name");

  const categoryMap = new Map(
    (categories ?? []).map((c: { id: string; name: string }) => [c.name, c.id])
  );

  for (const result of results) {
    const review = reviews[result.index];
    if (!review) continue;

    const { error: sentimentError } = await db
      .from("reviews")
      .update({ sentiment: result.sentiment })
      .eq("id", review.id);

    if (sentimentError) {
      console.error(`Failed to update sentiment for ${review.id}:`, sentimentError.message);
      continue;
    }

    const categoryRows = result.categories
      .map((catName) => {
        const catId = categoryMap.get(catName);
        return catId ? { review_id: review.id, category_id: catId } : null;
      })
      .filter(Boolean);

    if (categoryRows.length > 0) {
      await db
        .from("review_categories")
        .upsert(categoryRows as { review_id: string; category_id: string }[], {
          onConflict: "review_id,category_id",
          ignoreDuplicates: true,
        });
    }

    updated++;
  }

  return updated;
}

export async function categorizeUncategorizedReviews(
  limit: number = 400
): Promise<{ processed: number; updated: number; failed: number }> {
  const db = getSupabaseAdmin();

  const { data: reviews, error } = await db
    .from("reviews")
    .select("id, sanitized_text, star_rating")
    .eq("sentiment", "uncategorized")
    .limit(limit);

  if (error) throw new Error(`Failed to fetch reviews: ${error.message}`);
  if (!reviews || reviews.length === 0) {
    return { processed: 0, updated: 0, failed: 0 };
  }

  let totalUpdated = 0;
  let totalFailed = 0;

  for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
    const batch = reviews.slice(i, i + BATCH_SIZE);
    const results = await categorizeBatch(batch);

    if (results.length > 0) {
      const updated = await updateReviewsInDB(batch, results);
      totalUpdated += updated;
      totalFailed += batch.length - updated;
    } else {
      totalFailed += batch.length;
    }

    if (i + BATCH_SIZE < reviews.length) {
      await sleep(INTER_BATCH_DELAY);
    }
  }

  return {
    processed: reviews.length,
    updated: totalUpdated,
    failed: totalFailed,
  };
}

export async function recategorizeOthers(
  limit: number = 400
): Promise<{ processed: number; updated: number; failed: number }> {
  const db = getSupabaseAdmin();

  const othersCategory = await db
    .from("categories")
    .select("id")
    .eq("slug", "others")
    .single();

  if (!othersCategory.data) {
    return { processed: 0, updated: 0, failed: 0 };
  }

  const { data: othersJunctions } = await db
    .from("review_categories")
    .select("review_id")
    .eq("category_id", othersCategory.data.id)
    .limit(limit);

  const reviewIds = (othersJunctions ?? []).map((r: { review_id: string }) => r.review_id);
  if (reviewIds.length === 0) {
    return { processed: 0, updated: 0, failed: 0 };
  }

  const { data: reviews, error } = await db
    .from("reviews")
    .select("id, sanitized_text, star_rating")
    .in("id", reviewIds);

  if (error || !reviews || reviews.length === 0) {
    return { processed: 0, updated: 0, failed: 0 };
  }

  // Remove old "Others" category assignments for these reviews
  await db
    .from("review_categories")
    .delete()
    .eq("category_id", othersCategory.data.id)
    .in("review_id", reviewIds);

  let totalUpdated = 0;
  let totalFailed = 0;

  for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
    const batch = reviews.slice(i, i + BATCH_SIZE);
    const results = await categorizeBatch(batch);

    if (results.length > 0) {
      const updated = await updateReviewsInDB(batch, results);
      totalUpdated += updated;
      totalFailed += batch.length - updated;
    } else {
      totalFailed += batch.length;
    }

    if (i + BATCH_SIZE < reviews.length) {
      await sleep(INTER_BATCH_DELAY);
    }
  }

  return {
    processed: reviews.length,
    updated: totalUpdated,
    failed: totalFailed,
  };
}

export async function getCategorizationProgress(): Promise<CategorizationProgress> {
  const db = getSupabaseAdmin();

  const { count: total } = await db
    .from("reviews")
    .select("*", { count: "exact", head: true });

  const { count: uncategorized } = await db
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("sentiment", "uncategorized");

  const totalCount = total ?? 0;
  const uncatCount = uncategorized ?? 0;
  const catCount = totalCount - uncatCount;

  return {
    total: totalCount,
    categorized: catCount,
    uncategorized: uncatCount,
    percentComplete: totalCount > 0 ? Math.round((catCount / totalCount) * 100) : 0,
  };
}
