import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

type Tone = "empathetic" | "professional" | "gratitude";

const TONE_INSTRUCTIONS: Record<Tone, string> = {
  empathetic:
    "Use a warm, understanding tone. Acknowledge the user's frustration or delight. Show genuine care.",
  professional:
    "Use a formal, business-appropriate tone. Be concise, solution-oriented, and respectful.",
  gratitude:
    "Lead with gratitude and appreciation. Thank the user for their feedback and time.",
};

function buildReplyPrompt(
  reviewText: string,
  starRating: number,
  categories: string[],
  tone: Tone
): string {
  const sentiment = starRating >= 4 ? "positive" : starRating <= 2 ? "negative" : "mixed";

  return `You are a customer support representative for Groww, a leading Indian investment and trading app. Generate a reply to the following app store review.

Review Details:
- Rating: ${starRating}/5 (${sentiment})
- Categories: ${categories.join(", ") || "General"}
- Review Text: "${reviewText}"

Tone: ${TONE_INSTRUCTIONS[tone]}

Rules:
- Keep the reply under 150 words
- Be genuine and helpful — do not sound robotic or templated
- If the review is negative, acknowledge the issue and assure the user it will be looked into
- If the review is positive, express gratitude and encourage continued usage
- Do NOT include any PII, internal jargon, or technical implementation details
- Do NOT use placeholder text like [Name] — address the user naturally
- Return ONLY the reply text, no prefixes, no quotes, no markdown formatting

Reply:`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewText, starRating, categories, tone } = body;

    if (!reviewText || !starRating) {
      return NextResponse.json(
        { error: "reviewText and starRating are required" },
        { status: 400 }
      );
    }

    const validTone: Tone = ["empathetic", "professional", "gratitude"].includes(tone)
      ? tone
      : "professional";

    const prompt = buildReplyPrompt(
      reviewText,
      starRating,
      categories || [],
      validTone
    );

    const reply = await generateContent(prompt);

    return NextResponse.json({ reply: reply.trim() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Reply generation failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
