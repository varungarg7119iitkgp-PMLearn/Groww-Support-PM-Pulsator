# Phase 2: Data Ingestion Pipeline — Test Checklist

## Prerequisites

Before testing Phase 2 functionality, you need:

1. **Supabase project** created at [supabase.com](https://supabase.com)
2. **Database migration** run: copy `supabase/migrations/001_initial_schema.sql` into the Supabase SQL Editor and execute
3. **Environment variables** set in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   CRON_SECRET=any_secret_string
   ```
4. **Dev server running**: `npm run dev`

---

## A. UI & Layout Tests (No Supabase needed)

### A1. Sync Status Banner
- [ ] Navigate to `/` (Reviews page)
- [ ] Verify "Sync Status Banner" is visible between the page title and the filter bar
- [ ] Without Supabase configured: banner shows "Database not configured" message
- [ ] Banner displays database icon and informational text

### A2. Context Bar — Sync Button
- [ ] Verify "Sync" button is visible in the header (desktop only, ≥640px)
- [ ] Button shows a refresh icon and label (e.g., "Sync Android")
- [ ] Switching platform toggle to "iOS" changes sync button label to "Sync iOS"
- [ ] Without Supabase: clicking sync shows an error state gracefully

### A3. CSV Upload Modal
- [ ] Verify "Import CSV" button is visible in the top-right of the Reviews page
- [ ] Click "Import CSV" — modal opens with drag-and-drop file upload area
- [ ] Modal shows "Step 1 of 4 — Upload File"
- [ ] Try dragging a non-CSV file — error message: "Only .csv files are accepted"
- [ ] Close modal via X button or clicking outside
- [ ] Reopen modal — state is reset (starts at Step 1)

### A4. CSV Modal — Mapping Step (requires a .csv file)
- [ ] Upload a valid CSV file — modal advances to "Step 2 of 4 — Map Columns"
- [ ] All CSV column headers appear in dropdown selectors
- [ ] Required fields (Rating, Date, Review Text, Platform) are marked with red asterisks
- [ ] "Validate & Continue" button is disabled until all required fields are mapped
- [ ] Auto-mapping works if CSV headers match schema names (e.g., "rating", "date", "review_text")
- [ ] Data preview shows first 3 rows of the CSV
- [ ] "Back" button returns to upload step

### A5. CSV Modal — Validation Step
- [ ] After mapping, click "Validate & Continue" — modal advances to Step 3
- [ ] Shows valid row count and skipped row count previews
- [ ] "Import Reviews" button is visible
- [ ] "Back" button returns to mapping step

### A6. Responsive Design
- [ ] Resize browser to mobile width (≤480px)
- [ ] "Import CSV" button shows icon-only (text hidden)
- [ ] Sync button is hidden on mobile (only visible ≥640px)
- [ ] Sync status banner wraps gracefully on narrow screens
- [ ] CSV modal is properly centered and scrollable on mobile

---

## B. Backend API Tests (Supabase required)

### B1. Sync Status API
- [ ] `GET /api/reviews/sync-status` returns JSON response
- [ ] Without Groww app in DB: returns `{ configured: false, ... }`
- [ ] After first sync: returns `{ configured: true, totalReviews: N, ... }`
- [ ] Recent logs array contains up to 10 entries

### B2. Manual Sync API
- [ ] `POST /api/reviews/sync` with `{ "platform": "android" }` triggers Android sync
- [ ] `POST /api/reviews/sync` with `{ "platform": "ios" }` triggers iOS sync
- [ ] Invalid platform returns 400 error
- [ ] Successful sync returns review count and status
- [ ] Groww app record is auto-created in `apps` table on first sync
- [ ] Reviews are inserted into `reviews` table with:
  - Correct platform, author name, star rating, review text
  - PII-sanitized text in `sanitized_text` column
  - Sentiment set to "uncategorized"
  - Review date parsed correctly
- [ ] Duplicate reviews are skipped on re-sync (same platform_review_id + platform)
- [ ] Sync log entry created in `sync_logs` table with status and timing
- [ ] App's `last_android_sync` / `last_ios_sync` timestamp updated

### B3. CRON Sync API
- [ ] `GET /api/cron/sync-reviews` triggers both Android and iOS sync
- [ ] Without `CRON_SECRET`: any request succeeds (no secret = no auth check)
- [ ] With `CRON_SECRET` set: request without `Authorization: Bearer <secret>` returns 401
- [ ] With correct bearer token: sync runs and returns results for both platforms
- [ ] Both sync results included in response JSON

### B4. CSV Upload API
- [ ] `POST /api/upload/csv` with FormData (file + mapping JSON) processes the file
- [ ] Invalid file type returns 400
- [ ] Missing required column mappings returns 400
- [ ] Valid CSV: reviews inserted with PII sanitization
- [ ] Response summary includes totalRows, inserted, duplicatesSkipped, skippedRows
- [ ] Skipped rows include row number and reason

### B5. PII Sanitization Verification
- [ ] Review containing email address: `user@email.com` → `[REDACTED_EMAIL]` in sanitized_text
- [ ] Review containing phone: `+91 98765 43210` → `[REDACTED_PHONE]` in sanitized_text
- [ ] Review containing Aadhaar-like pattern: `1234 5678 9012` → `[REDACTED_AADHAAR]` in sanitized_text
- [ ] Review containing PAN: `ABCPD1234E` → `[REDACTED_PAN]` in sanitized_text
- [ ] Original `review_text` preserved, `sanitized_text` has redactions

### B6. Retry Logic
- [ ] If scraper fails on first attempt, sync engine retries up to 3 times
- [ ] Retry delays follow exponential backoff: ~1s, ~4s, ~16s
- [ ] If all retries fail: sync log status = "failed", error_message populated
- [ ] Failed sync surfaces amber warning in sync status banner

---

## C. Integration Tests

### C1. End-to-End Sync Flow
- [ ] Click "Sync Android" in context bar
- [ ] Button shows loading state (spinner + "Syncing...")
- [ ] After completion, sync status banner updates automatically (within 30s)
- [ ] Total review count in banner increases
- [ ] "Android: Xm ago" timestamp updates
- [ ] Verify reviews in Supabase dashboard → `reviews` table

### C2. End-to-End CSV Flow
- [ ] Click "Import CSV" → upload a test CSV → map columns → validate → import
- [ ] Modal shows "Importing..." with spinner during processing
- [ ] Summary step shows correct counts (inserted, duplicates, skipped)
- [ ] Click "Done" → sync status banner refreshes and shows updated count
- [ ] Verify reviews in Supabase dashboard

### C3. Vercel CRON Configuration
- [ ] `vercel.json` exists with cron path `/api/cron/sync-reviews` and schedule `0 6 * * *`
- [ ] After deploying to Vercel: Vercel dashboard shows the configured CRON job
- [ ] CRON triggers daily at 06:00 UTC

---

## D. Build & Code Quality

- [x] `npx tsc --noEmit` — 0 TypeScript errors
- [x] `npx next build` — successful production build
- [x] All 4 API routes appear as dynamic (ƒ) in build output
- [x] No linter errors in new files
- [ ] All new files follow project conventions (Tailwind CSS variables, component patterns)

---

## Sample Test CSV

Create a file `test-reviews.csv` with this content for testing CSV upload:

```csv
author,rating,body,date,platform,version,os
"John Doe",5,"Great app for investing!","2026-03-20","android","4.5.1","Android 14"
"Jane Smith",1,"App crashes on login every time. My email is jane@email.com","2026-03-19","android","4.5.0","Android 13"
"Raj Kumar",3,"KYC process is slow but app works fine overall","2026-03-18","ios","4.5.1","iOS 17"
"Anonymous",2,"Lost money due to bug. Call me at +91 98765 43210","2026-03-17","android","4.5.0","Android 12"
"Test User",4,"Good mutual fund options","2026-03-16","ios","4.5.1","iOS 16"
```

Column mapping for this sample:
- Rating → `rating`
- Date → `date`
- Review Text → `body`
- Platform → `platform`
- Author → `author`
- App Version → `version`
- OS Version → `os`
