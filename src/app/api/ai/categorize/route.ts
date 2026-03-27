import { NextResponse } from "next/server";
import { categorizeUncategorizedReviews } from "@/lib/categorizer";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await categorizeUncategorizedReviews(400);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Categorization error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
