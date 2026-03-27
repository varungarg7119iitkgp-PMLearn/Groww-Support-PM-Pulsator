# Phase 4: Review Hub (Triage Dashboard)

## Objective

Transform the Reviews page from a placeholder into a fully functional triage dashboard where Support PMs can visualize review health metrics, browse reviews with rich metadata, filter by multiple dimensions, and discover patterns through AI-powered similarity search.

## Architecture

### API Layer

| Endpoint | Method | Description |
|---|---|---|
| `/api/reviews/list` | GET | Paginated reviews with category joins and multi-dimensional filtering |
| `/api/reviews/stats` | GET | Rating distribution, NPS calculation, sentiment counts, average rating |
| `/api/categories` | GET | Full list of AI-assigned categories for filter dropdowns |

### Query Parameters (Reviews List)

| Param | Type | Default | Description |
|---|---|---|---|
| `platform` | `all\|android\|ios` | `all` | Filter by app store |
| `timePeriod` | `today\|yesterday\|last_7\|last_15\|last_30\|custom` | `last_30` | Time window |
| `dateFrom` / `dateTo` | `YYYY-MM-DD` | — | Custom date range (when `timePeriod=custom`) |
| `starRating` | `1-5` | — | Filter to specific star rating |
| `sentiment` | `positive\|negative\|neutral` | — | Sentiment filter |
| `category` | `slug` | — | Filter by category slug |
| `search` | `string` | — | Full-text search on sanitized review text |
| `page` | `number` | `1` | Page number |
| `pageSize` | `number` | `25` | Reviews per page (max 100) |

### Components Built

| Component | Location | Purpose |
|---|---|---|
| `RatingHistogram` | `src/components/reviews/rating-histogram.tsx` | Interactive horizontal bar chart for 1-5 star distribution with click-to-filter |
| `NPSGauge` | `src/components/reviews/nps-gauge.tsx` | NPS score display with label, promoter/passive/detractor breakdown, sentiment split bar |
| `ReviewCard` | `src/components/reviews/review-card.tsx` | Full review metadata display with sentiment badge, star rating, category tags, expand/collapse, "Find Similar" action |
| `ReviewFiltersInline` | `src/components/reviews/review-filters-inline.tsx` | Inline sentiment pills, search bar, and active category indicator |
| `Pagination` | `src/components/reviews/pagination.tsx` | Full pagination with first/prev/next/last, ellipsis, and "showing X to Y" text |
| `FindSimilarModal` | `src/components/reviews/find-similar-modal.tsx` | AI keyword extraction + search modal to discover related reviews |
| `ReviewListSkeleton` | `src/components/reviews/review-list-skeleton.tsx` | Loading placeholder for review cards |
| `StatsSkeleton` | `src/components/reviews/stats-skeleton.tsx` | Loading placeholder for histogram + NPS section |

### Hooks

| Hook | Purpose |
|---|---|
| `useReviews` | SWR-based hook respecting global filters + local filters (star, sentiment, category, search, page) |
| `useReviewStats` | SWR-based hook for stats endpoint, respecting global filters |

## Key Features

1. **Rating Distribution Histogram**: Clickable bars that filter reviews by star rating
2. **NPS Calculation**: `%Promoters(4-5★) − %Detractors(1-2★)`, color-coded with label (Excellent/Great/Good/Needs Work/Critical)
3. **Sentiment Split Bar**: Visual stacked bar showing positive/neutral/negative percentages
4. **Review Cards**: Full metadata (author, platform, date, version, device), expandable text, sentiment badge, AI category tags
5. **Click-to-Filter on Category Tags**: Clicking a category tag on any review card filters the list to that category
6. **Multi-dimensional Filtering**: Combine platform + time + star rating + sentiment + category + text search
7. **Find Similar Reviews**: Extracts top 5 keywords (excluding stop words) from a review and searches for related reviews
8. **Debounced Search**: 400ms debounce on text search to avoid excessive API calls
9. **Pagination**: Full pagination controls with page numbers, ellipsis, and result count display
10. **Loading Skeletons**: Smooth skeleton animations for stats and review list during loading
11. **Empty States**: Contextual messages when no reviews exist or no reviews match filters

## Dependencies

No new dependencies added — uses existing SWR, Lucide React, and Supabase client.

## File Changes

### New Files
- `src/app/api/reviews/list/route.ts`
- `src/app/api/reviews/stats/route.ts`
- `src/app/api/categories/route.ts`
- `src/hooks/use-reviews.ts`
- `src/hooks/use-review-stats.ts`
- `src/components/reviews/rating-histogram.tsx`
- `src/components/reviews/nps-gauge.tsx`
- `src/components/reviews/review-card.tsx`
- `src/components/reviews/review-filters-inline.tsx`
- `src/components/reviews/pagination.tsx`
- `src/components/reviews/find-similar-modal.tsx`
- `src/components/reviews/review-list-skeleton.tsx`
- `src/components/reviews/stats-skeleton.tsx`

### Modified Files
- `src/app/page.tsx` — Replaced EmptyState with full Review Hub dashboard
