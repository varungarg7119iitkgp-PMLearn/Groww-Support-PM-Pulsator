# Phase 3: AI Categorization Pipeline

## Objective

Process all ingested reviews through Google Gemini to assign:
1. **Sentiment labels** — Positive, Negative, or Neutral
2. **Category tags** — one or more from the predefined 14-category set

This transforms raw "uncategorized" reviews into structured, queryable data that powers all downstream modules (Analytics, Categories, Word Cloud, Ideation, Reporting).

---

## Architecture

### Model Selection

| Task | Model | Rationale |
|---|---|---|
| Sentiment + Category classification | `gemini-2.0-flash` / `gemini-3-flash-preview` | Fast, cheap for high-volume repetitive classification |

The model is configurable via the Gemini client. We use whichever Flash model is available on the user's API key.

### Batch Processing Strategy

- Reviews are processed in **chunks of 15** (balances throughput vs token limits)
- Each chunk is sent as a single prompt with all 15 reviews
- Gemini returns a structured JSON array mapping each review to its sentiment + categories
- Failed reviews within a batch fall back to "uncategorized" without blocking others

### Retry Logic

- Each batch gets **2 retry attempts** on API failure
- Retry delays: 2s, 5s
- If all retries fail, reviews in that batch remain "uncategorized" and are logged

---

## Deliverables

| File | Purpose |
|---|---|
| `src/lib/gemini.ts` | Gemini API client wrapper |
| `src/lib/categorizer.ts` | Prompt engineering, batch processing, DB update logic |
| `src/app/api/ai/categorize/route.ts` | API route to trigger categorization |
| `src/app/api/ai/status/route.ts` | API route returning categorization progress |
| `src/hooks/use-categorization.ts` | SWR hook for categorization status |
| Updated `src/app/page.tsx` | Categorization status + trigger button on Reviews page |

---

## Category Set (14 predefined)

| Category | Slug |
|---|---|
| Account Issues | account-issues |
| App Crash | app-crash |
| Customer Support | customer-support |
| Feature Request | feature-request |
| KYC | kyc |
| Login Issues | login-issues |
| Notifications | notifications |
| Onboarding | onboarding |
| Others | others |
| Payments | payments |
| Performance | performance |
| Security | security |
| Transaction Issues | transaction-issues |
| UI/UX | ui-ux |

---

## Prompt Design

The prompt instructs Gemini to:
1. Analyze each review's text and star rating
2. Classify sentiment as exactly one of: `positive`, `negative`, `neutral`
3. Assign 1-3 categories from the predefined set
4. Return a strict JSON array — no markdown, no explanation
5. Handle short/empty reviews by defaulting to "Others" category

---

## Data Flow

```
[Trigger: API call or post-sync hook]
        │
        ▼
┌──────────────────┐
│ Fetch uncategorized│  SELECT * FROM reviews WHERE sentiment = 'uncategorized'
│ reviews from DB   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Chunk into batches│  Groups of 15 reviews
│ of 15             │
└────────┬─────────┘
         │
         ▼  (for each batch)
┌──────────────────┐
│ Send to Gemini    │  Structured prompt with review texts + star ratings
│ Flash             │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Parse JSON        │  Extract sentiment + categories for each review
│ response          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Update DB         │  UPDATE reviews SET sentiment = ...
│                   │  INSERT INTO review_categories (review_id, category_id)
└──────────────────┘
```
