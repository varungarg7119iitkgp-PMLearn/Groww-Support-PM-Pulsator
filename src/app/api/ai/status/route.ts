import { NextResponse } from "next/server";
import { getCategorizationProgress } from "@/lib/categorizer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const progress = await getCategorizationProgress();
    return NextResponse.json(progress);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("not configured")) {
      return NextResponse.json({
        total: 0,
        categorized: 0,
        uncategorized: 0,
        percentComplete: 0,
      });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
