import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { GROWW_APP } from "@/constants/groww";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let db;
    try {
      db = getSupabaseAdmin();
    } catch {
      return NextResponse.json({
        configured: false,
        android: null,
        ios: null,
        recentLogs: [],
        totalReviews: 0,
      });
    }
    const { data: app } = await db
      .from("apps")
      .select("id, last_android_sync, last_ios_sync")
      .eq("android_bundle_id", GROWW_APP.androidBundleId)
      .maybeSingle();

    if (!app) {
      return NextResponse.json({
        configured: false,
        android: null,
        ios: null,
        recentLogs: [],
      });
    }

    const { data: recentLogs } = await db
      .from("sync_logs")
      .select("*")
      .eq("app_id", app.id)
      .order("started_at", { ascending: false })
      .limit(10);

    const { count: totalReviews } = await db
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("app_id", app.id);

    return NextResponse.json({
      configured: true,
      appId: app.id,
      lastAndroidSync: app.last_android_sync,
      lastIOSSync: app.last_ios_sync,
      totalReviews: totalReviews ?? 0,
      recentLogs: recentLogs ?? [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
