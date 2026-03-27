import { NextRequest, NextResponse } from "next/server";
import { syncPlatform } from "@/lib/sync-engine";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const platform = body.platform as "android" | "ios" | undefined;

    if (!platform || !["android", "ios"].includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform. Must be 'android' or 'ios'." },
        { status: 400 }
      );
    }

    const count = Math.min(body.count ?? 200, 500);
    const result = await syncPlatform(platform, count);

    return NextResponse.json({
      success: result.status === "success",
      result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Manual sync error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
