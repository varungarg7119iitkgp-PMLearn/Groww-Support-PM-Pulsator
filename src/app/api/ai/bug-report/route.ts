import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface ReviewInput {
  id: string;
  sanitized_text: string;
  star_rating: number;
  platform: string;
  app_version: string | null;
  os_version: string | null;
  review_date: string;
  categories: { name: string }[];
}

function buildBugReportPrompt(reviews: ReviewInput[]): string {
  const platforms = [...new Set(reviews.map((r) => r.platform))];
  const versions = [
    ...new Set(reviews.map((r) => r.app_version).filter(Boolean)),
  ];
  const dateRange = {
    from: reviews.reduce(
      (min, r) => (r.review_date < min ? r.review_date : min),
      reviews[0].review_date
    ),
    to: reviews.reduce(
      (max, r) => (r.review_date > max ? r.review_date : max),
      reviews[0].review_date
    ),
  };

  const allCategories = [
    ...new Set(reviews.flatMap((r) => r.categories.map((c) => c.name))),
  ];

  const quotes = reviews
    .slice(0, 5)
    .map(
      (r, i) =>
        `[${i + 1}] "${r.sanitized_text.slice(0, 200)}" (${r.star_rating}★, ${r.platform})`
    )
    .join("\n");

  return `You are a QA engineer at Groww (an Indian investment & trading app). Generate a structured bug report from the following ${reviews.length} user reviews.

Context:
- Platforms affected: ${platforms.join(", ")}
- App versions: ${versions.join(", ") || "Unknown"}
- Date range: ${dateRange.from} to ${dateRange.to}
- Categories: ${allCategories.join(", ") || "General"}
- Number of reports: ${reviews.length}

User quotes:
${quotes}

Generate a structured bug report with this exact JSON format (no markdown, no code fences):
{
  "title": "A concise bug title (max 10 words)",
  "severity": "critical" | "high" | "medium" | "low",
  "description": "A clear 2-4 sentence description of the issue synthesized from the reviews",
  "stepsToReproduce": ["Step 1", "Step 2", "Step 3"],
  "expectedBehavior": "What should happen",
  "actualBehavior": "What actually happens based on user reports",
  "affectedPlatforms": ${JSON.stringify(platforms)},
  "affectedVersions": ${JSON.stringify(versions)},
  "dateRange": "${dateRange.from} to ${dateRange.to}",
  "userReportCount": ${reviews.length},
  "userQuotes": ["Quote 1", "Quote 2", "Quote 3"],
  "suggestedLabels": ["label1", "label2"]
}

Rules:
- Synthesize the issue from ALL reviews, not just one
- User quotes must be PII-free verbatim text from the reviews (pick most descriptive, max 3)
- Severity should reflect impact: critical=crashes/data loss, high=broken feature, medium=degraded experience, low=cosmetic
- Steps to reproduce should be inferred from user descriptions
- Return ONLY valid JSON

JSON:`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviews } = body;

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json(
        { error: "At least one review is required" },
        { status: 400 }
      );
    }

    const prompt = buildBugReportPrompt(reviews);
    const responseText = await generateContent(prompt);

    let cleaned = responseText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned
        .replace(/^```(?:json)?\s*\n?/, "")
        .replace(/\n?```\s*$/, "");
    }

    const bugReport = JSON.parse(cleaned);

    return NextResponse.json({ bugReport });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Bug report generation failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
