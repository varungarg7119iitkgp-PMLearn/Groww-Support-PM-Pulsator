import { getSupabaseAdmin } from "./supabase-server";
import { sanitizePII } from "./pii-sanitizer";
import { fetchAndroidReviews, fetchIOSReviews, type ScrapedReview } from "./scraper";
import { GROWW_APP } from "@/constants/groww";

export interface SyncResult {
  platform: "android" | "ios";
  status: "success" | "failed";
  reviewsFetched: number;
  reviewsInserted: number;
  duplicatesSkipped: number;
  errorMessage: string | null;
  retryCount: number;
}

const RETRY_DELAYS = [1000, 4000, 16000];
const MAX_RETRIES = 3;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureGrowwApp(): Promise<string> {
  const db = getSupabaseAdmin();
  const { data: existing } = await db
    .from("apps")
    .select("id")
    .eq("android_bundle_id", GROWW_APP.androidBundleId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await db
    .from("apps")
    .insert({
      name: GROWW_APP.name,
      android_bundle_id: GROWW_APP.androidBundleId,
      ios_bundle_id: GROWW_APP.iosBundleId,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create app record: ${error.message}`);
  return created.id;
}

async function fetchWithRetry(
  platform: "android" | "ios",
  count: number
): Promise<{ reviews: ScrapedReview[]; retryCount: number }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const reviews =
        platform === "android"
          ? await fetchAndroidReviews(count)
          : await fetchIOSReviews(count);
      return { reviews, retryCount: attempt };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAYS[attempt]);
      }
    }
  }

  throw lastError ?? new Error("All retry attempts exhausted");
}

async function insertReviews(
  appId: string,
  reviews: ScrapedReview[]
): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;

  const BATCH_SIZE = 50;
  for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
    const batch = reviews.slice(i, i + BATCH_SIZE);

    const rows = batch.map((r) => {
      const sanitizedText = sanitizePII(r.reviewText);
      return {
        app_id: appId,
        platform_review_id: r.platformReviewId,
        platform: r.platform,
        author_name: r.authorName,
        star_rating: r.starRating,
        review_text: r.reviewText,
        sanitized_text: sanitizedText,
        sentiment: "uncategorized" as const,
        device_info: r.deviceInfo,
        app_version: r.appVersion,
        os_version: r.osVersion,
        upvote_count: r.upvoteCount,
        review_date: r.reviewDate.toISOString().split("T")[0],
      };
    });

    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("reviews")
      .upsert(rows, {
        onConflict: "platform_review_id,platform",
        ignoreDuplicates: true,
      })
      .select("id");

    if (error) {
      console.error("Batch insert error:", error.message);
      skipped += batch.length;
    } else {
      inserted += data?.length ?? 0;
      skipped += batch.length - (data?.length ?? 0);
    }
  }

  return { inserted, skipped };
}

async function createSyncLog(
  appId: string,
  platform: "android" | "ios"
): Promise<string> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("sync_logs")
    .insert({
      app_id: appId,
      platform,
      status: "running",
      reviews_fetched: 0,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create sync log: ${error.message}`);
  return data.id;
}

async function updateSyncLog(
  logId: string,
  update: {
    status: "success" | "failed";
    reviews_fetched: number;
    error_message?: string | null;
    retry_count: number;
  }
): Promise<void> {
  await getSupabaseAdmin()
    .from("sync_logs")
    .update({ ...update, completed_at: new Date().toISOString() })
    .eq("id", logId);
}

async function updateAppSyncTimestamp(
  appId: string,
  platform: "android" | "ios"
): Promise<void> {
  const column = platform === "android" ? "last_android_sync" : "last_ios_sync";
  await getSupabaseAdmin()
    .from("apps")
    .update({ [column]: new Date().toISOString() })
    .eq("id", appId);
}

export async function syncPlatform(
  platform: "android" | "ios",
  count: number = 200
): Promise<SyncResult> {
  const appId = await ensureGrowwApp();
  const logId = await createSyncLog(appId, platform);

  try {
    const { reviews, retryCount } = await fetchWithRetry(platform, count);

    const { inserted, skipped } = await insertReviews(appId, reviews);

    await updateSyncLog(logId, {
      status: "success",
      reviews_fetched: inserted,
      retry_count: retryCount,
    });

    await updateAppSyncTimestamp(appId, platform);

    return {
      platform,
      status: "success",
      reviewsFetched: reviews.length,
      reviewsInserted: inserted,
      duplicatesSkipped: skipped,
      errorMessage: null,
      retryCount,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await updateSyncLog(logId, {
      status: "failed",
      reviews_fetched: 0,
      error_message: message,
      retry_count: MAX_RETRIES,
    });

    return {
      platform,
      status: "failed",
      reviewsFetched: 0,
      reviewsInserted: 0,
      duplicatesSkipped: 0,
      errorMessage: message,
      retryCount: MAX_RETRIES,
    };
  }
}

export async function syncAll(
  count: number = 200
): Promise<{ android: SyncResult; ios: SyncResult }> {
  const [android, ios] = await Promise.all([
    syncPlatform("android", count),
    syncPlatform("ios", count),
  ]);

  return { android, ios };
}
