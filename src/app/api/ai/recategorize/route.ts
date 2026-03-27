import { NextResponse } from "next/server";
import { recategorizeOthers } from "@/lib/categorizer";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await recategorizeOthers(400);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
