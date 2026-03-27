import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { sanitizePII } from "@/lib/pii-sanitizer";
import { GROWW_APP } from "@/constants/groww";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface MappedRow {
  author_name: string;
  star_rating: number;
  review_text: string;
  review_date: string;
  platform: "android" | "ios";
  app_version: string | null;
  os_version: string | null;
  device_info: string | null;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const mappingRaw = formData.get("mapping") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File exceeds maximum size of 50 MB (${(file.size / 1024 / 1024).toFixed(1)} MB)` },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only .csv files are accepted" },
        { status: 400 }
      );
    }

    if (!mappingRaw) {
      return NextResponse.json(
        { error: "Column mapping is required" },
        { status: 400 }
      );
    }

    const mapping: Record<string, string> = JSON.parse(mappingRaw);

    const requiredFields = ["star_rating", "review_date", "review_text", "platform"];
    const missing = requiredFields.filter((f) => !mapping[f]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required column mappings: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      return NextResponse.json(
        { error: "Failed to parse CSV", details: parsed.errors.slice(0, 5) },
        { status: 400 }
      );
    }

    // Ensure Groww app exists
    const db = getSupabaseAdmin();
    let appId: string;
    const { data: existingApp } = await db
      .from("apps")
      .select("id")
      .eq("android_bundle_id", GROWW_APP.androidBundleId)
      .maybeSingle();

    if (existingApp) {
      appId = existingApp.id;
    } else {
      const { data: newApp, error } = await db
        .from("apps")
        .insert({
          name: GROWW_APP.name,
          android_bundle_id: GROWW_APP.androidBundleId,
          ios_bundle_id: GROWW_APP.iosBundleId,
        })
        .select("id")
        .single();
      if (error) throw new Error(`Failed to create app: ${error.message}`);
      appId = newApp.id;
    }

    const rows = parsed.data as Record<string, string>[];
    const validRows: MappedRow[] = [];
    const skippedRows: { row: number; reason: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const reviewText = row[mapping["review_text"]]?.trim();
      const ratingStr = row[mapping["star_rating"]]?.trim();
      const dateStr = row[mapping["review_date"]]?.trim();
      const platformStr = row[mapping["platform"]]?.trim()?.toLowerCase();

      if (!reviewText) {
        skippedRows.push({ row: i + 2, reason: "Missing review text" });
        continue;
      }

      const rating = parseInt(ratingStr, 10);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        skippedRows.push({ row: i + 2, reason: `Invalid rating: "${ratingStr}"` });
        continue;
      }

      if (!dateStr || isNaN(Date.parse(dateStr))) {
        skippedRows.push({ row: i + 2, reason: `Invalid date: "${dateStr}"` });
        continue;
      }

      const platform = platformStr === "ios" ? "ios" : "android";

      validRows.push({
        author_name: row[mapping["author_name"]]?.trim() || "Anonymous",
        star_rating: rating,
        review_text: reviewText,
        review_date: new Date(dateStr).toISOString().split("T")[0],
        platform,
        app_version: mapping["app_version"] ? row[mapping["app_version"]]?.trim() || null : null,
        os_version: mapping["os_version"] ? row[mapping["os_version"]]?.trim() || null : null,
        device_info: mapping["device_info"] ? row[mapping["device_info"]]?.trim() || null : null,
      });
    }

    let inserted = 0;
    let duplicates = 0;
    const BATCH_SIZE = 50;

    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      const batch = validRows.slice(i, i + BATCH_SIZE);
      const dbRows = batch.map((r, idx) => {
        const sanitizedText = sanitizePII(r.review_text);
        return {
          app_id: appId,
          platform_review_id: `csv-${r.platform}-${r.review_date}-${i + idx}`,
          platform: r.platform,
          author_name: r.author_name,
          star_rating: r.star_rating,
          review_text: r.review_text,
          sanitized_text: sanitizedText,
          sentiment: "uncategorized" as const,
          device_info: r.device_info,
          app_version: r.app_version,
          os_version: r.os_version,
          review_date: r.review_date,
        };
      });

      const { data, error } = await db
        .from("reviews")
        .upsert(dbRows, {
          onConflict: "platform_review_id,platform",
          ignoreDuplicates: true,
        })
        .select("id");

      if (error) {
        console.error("CSV batch insert error:", error.message);
        duplicates += batch.length;
      } else {
        inserted += data?.length ?? 0;
        duplicates += batch.length - (data?.length ?? 0);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: rows.length,
        validRows: validRows.length,
        inserted,
        duplicatesSkipped: duplicates,
        skippedRows: skippedRows.length,
        skippedDetails: skippedRows.slice(0, 50),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("CSV upload error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
