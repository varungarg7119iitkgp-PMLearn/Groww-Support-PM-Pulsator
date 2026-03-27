# Phase 2: Data Ingestion Pipeline

## Objective

Build the complete data ingestion backbone that feeds all downstream modules (Review Hub, Analytics, Categories, Word Cloud, Ideation, Reporting). This phase delivers three ingestion paths:

1. **Automated CRON Sync** (primary) — daily Vercel CRON job fetches new reviews from Google Play Store and Apple App Store
2. **Manual Sync** (on-demand) — context bar button triggers an immediate sync for the selected platform
3. **CSV Upload** (optional bootstrap) — drag-and-drop CSV import with header mapping for historical data

All ingestion paths share the same downstream pipeline: **PII sanitization → duplicate detection → database insert → sync logging**.

---

## Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Single-app design | Groww app hardcoded via constants | User removed "Apps" tab; Groww is the sole target app |
| Sync triggers | Context Bar + CRON | No standalone app management screen; sync controls live in the global header |
| CSV upload | Optional utility on Reviews page | User clarified CSV should not be an expectation to run the app |
| Scrapers | `google-play-scraper` + `app-store-scraper` (npm) | Proven packages for fetching public review data |
| PII sanitizer | Regex-based, synchronous | Runs inline during ingestion before DB insert |
| Duplicate detection | DB UNIQUE constraint + application-level check | `UNIQUE(platform_review_id, platform)` in reviews table |
| Retry logic | 3 attempts, exponential backoff (1s, 4s, 16s) | Architecture spec for resilient scraping |
| CRON security | `CRON_SECRET` header validation | Prevents unauthorized triggers of the sync endpoint |

---

## Deliverables

### Backend Libraries

| File | Purpose |
|---|---|
| `src/lib/supabase-server.ts` | Server-side Supabase client using `SUPABASE_SERVICE_ROLE_KEY` |
| `src/lib/pii-sanitizer.ts` | Regex-based PII detection and redaction (email, phone, Aadhaar, PAN, addresses) |
| `src/lib/scraper.ts` | Wrapper around `google-play-scraper` and `app-store-scraper` with normalized output |
| `src/lib/sync-engine.ts` | Core orchestration: fetch → sanitize → dedupe → insert → log |

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/cron/sync-reviews` | GET | Vercel CRON endpoint — daily automated sync (secured by `CRON_SECRET`) |
| `/api/reviews/sync` | POST | Manual sync trigger from UI (platform-specific) |
| `/api/reviews/sync-status` | GET | Returns latest sync log entries for status display |
| `/api/upload/csv` | POST | CSV file upload and processing |

### Frontend Components

| Component | Purpose |
|---|---|
| `src/components/shared/sync-status-banner.tsx` | Displays last sync time, review count, and failure warnings |
| `src/components/shared/csv-upload-modal.tsx` | Multi-step CSV import: Upload → Map Headers → Validate → Confirm → Summary |
| Updated `context-bar.tsx` | Wired sync button with loading state and status indicators |
| Updated `page.tsx` (Reviews) | Sync status banner + CSV upload access |

### Configuration

| File | Purpose |
|---|---|
| `vercel.json` | CRON job schedule (daily at 06:00 UTC) |

---

## Data Flow

```
[CRON / Manual Sync / CSV Upload]
            │
            ▼
    ┌───────────────┐
    │  Fetch Reviews │  (google-play-scraper / app-store-scraper / CSV parse)
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │ PII Sanitizer  │  Redact emails, phones, Aadhaar, PAN, addresses
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │ Deduplication  │  Skip reviews already in DB (platform_review_id + platform)
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │ Database Insert│  Insert into `reviews` table (sentiment = 'uncategorized')
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │  Sync Log      │  Record result in `sync_logs` table
    └───────────────┘
```

---

## Prerequisites for Testing

1. **Supabase project** — create at [supabase.com](https://supabase.com), run `supabase/migrations/001_initial_schema.sql`
2. **Environment variables** — copy `.env.local.example` to `.env.local` and fill in Supabase credentials + `CRON_SECRET`
3. **Internet access** — required for scraper packages to fetch reviews from app stores

---

## PII Patterns Detected

| Pattern | Example | Replacement |
|---|---|---|
| Email addresses | user@example.com | `[REDACTED_EMAIL]` |
| Indian phone numbers | +91 98765 43210 | `[REDACTED_PHONE]` |
| International phone numbers | +1-555-123-4567 | `[REDACTED_PHONE]` |
| Aadhaar numbers | 1234 5678 9012 | `[REDACTED_AADHAAR]` |
| PAN numbers | ABCPD1234E | `[REDACTED_PAN]` |

---

## Retry Logic

```
Attempt 1 → Fail → Wait 1s
Attempt 2 → Fail → Wait 4s
Attempt 3 → Fail → Mark sync as "failed", log error
```

Failed syncs surface as amber warning indicators in the Context Bar with the last successful sync timestamp.
