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

  return `You are a review classification engine for the Groww financial app. Analyze each review and return a JSON array.

For each review, determine:
1. **sentiment**: exactly one of: "positive", "negative", "neutral"
   - 4-5 stars with positive text = "positive"
   - 1-2 stars or complaints = "negative"
   - 3 stars or mixed feedback = "neutral"
2. **categories**: 1 to 3 categories from this exact list:
   ${VALID_CATEGORIES.join(", ")}

Rules:
- Return ONLY a valid JSON array, no markdown, no explanation, no code fences
- Each element must have: { "index": <number>, "sentiment": "<string>", "categories": [<strings>] }
- Use "Others" if no specific category fits
- Short reviews like "good", "nice", "bad" should still be categorized by sentiment

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
