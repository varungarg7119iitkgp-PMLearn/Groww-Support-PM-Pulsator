# Phase 6: Customer Testimonials

## Objective

Build the Word Cloud / Testimonials page with dynamic word frequency visualization, ranked keyword lists, and a feed of the most upvoted reviews — all respecting global filters.

## Architecture

### API

| Endpoint | Method | Description |
|---|---|---|
| `/api/testimonials` | GET | Returns word frequency metrics, top N word frequencies, and top upvoted reviews with categories |

#### Query Parameters

| Param | Type | Default | Description |
|---|---|---|---|
| `platform` | `all\|android\|ios` | `all` | Filter by platform |
| `timePeriod` | standard time periods | `last_30` | Time window |
| `dateFrom` / `dateTo` | `YYYY-MM-DD` | — | Custom date range |
| `topN` | `number` | `30` | Number of top words to return (max 100) |

### Components

| Component | Location | Purpose |
|---|---|---|
| `TestimonialsMetrics` | `src/components/testimonials/testimonials-metrics.tsx` | 3 metric cards: Reviews Analyzed, Total Words, Unique Words |
| `WordCloudView` | `src/components/testimonials/word-cloud-view.tsx` | CSS-based word cloud with size/color/opacity mapped to frequency; clickable words navigate to Review Hub |
| `TopWordsList` | `src/components/testimonials/top-words-list.tsx` | Ranked keyword list with progress bars, counts, and "Show All" toggle; clickable to filter Review Hub |
| `TopUpvotedReviews` | `src/components/testimonials/top-upvoted-reviews.tsx` | Feed of most upvoted reviews using ReviewCard component |
| `TestimonialsSkeleton` | `src/components/testimonials/testimonials-skeleton.tsx` | Loading skeleton |

### Hook

| Hook | Purpose |
|---|---|
| `useTestimonials` | SWR-based hook with configurable `topN`, respects global filters |

## Key Features

1. **Word Frequency Analysis**: Server-side extraction of words from sanitized review text, excluding 100+ stop words
2. **Visual Word Cloud**: CSS flexbox layout with font size (12–48px), color, and opacity mapped to word frequency; deterministic shuffle for visual variety
3. **Click-to-Filter**: Clicking any word in the cloud or keyword list navigates to Review Hub with `?search=<word>`
4. **Top Keywords List**: Ranked list with position numbers, progress bars, and counts; "Show All" toggle for lists > 20
5. **Top Upvoted Reviews**: Reviews sorted by upvote count (descending), using the existing ReviewCard component with full metadata and category tags
6. **URL Parameter Integration**: Reviews page now reads `?search=` and `?category=` from URL params on initial load, enabling deep links from Word Cloud and Analytics

## Dependencies

No new dependencies — uses existing SWR, Lucide React, and ReviewCard component.

## File Changes

### New Files
- `src/app/api/testimonials/route.ts`
- `src/hooks/use-testimonials.ts`
- `src/components/testimonials/testimonials-metrics.tsx`
- `src/components/testimonials/word-cloud-view.tsx`
- `src/components/testimonials/top-words-list.tsx`
- `src/components/testimonials/top-upvoted-reviews.tsx`
- `src/components/testimonials/testimonials-skeleton.tsx`

### Modified Files
- `src/app/word-cloud/page.tsx` — Replaced EmptyState with full testimonials dashboard
- `src/app/page.tsx` — Added URL param reading for `search` and `category` on initial load
