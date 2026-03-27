# Phase 5: Analytics Layer

## Objective

Build a comprehensive analytics dashboard with top-level metrics, sentiment and rating charts, category distribution, and time-series trend analysis — all respecting global filters.

## Architecture

### API

| Endpoint | Method | Description |
|---|---|---|
| `/api/analytics` | GET | Returns all analytics data in a single call: metrics, rating distribution, sentiment distribution, category distribution (with counts/percentages), and daily trend data with per-category breakdowns |

The endpoint accepts the same global filter params (`platform`, `timePeriod`, `dateFrom`, `dateTo`) and computes everything server-side.

### Components

| Component | Location | Purpose |
|---|---|---|
| `MetricsBar` | `src/components/analytics/metrics-bar.tsx` | 5 metric cards: Total Reviews, Avg Rating, Positive, Negative, Neutral (with counts and percentages) |
| `SentimentChart` | `src/components/analytics/sentiment-chart.tsx` | Side-by-side bar charts for sentiment analysis and rating distribution (Recharts) |
| `TrendChart` | `src/components/analytics/trend-chart.tsx` | Time-series line chart with toggle between Sentiment view and Category view, multi-select category pills |
| `CategoryChart` | `src/components/analytics/category-chart.tsx` | Horizontal bar chart of category distribution (clickable — navigates to Review Hub filtered by category) |
| `CategoryStatsList` | `src/components/analytics/category-stats-list.tsx` | Ranked list with progress bars, counts, percentages, and click-to-drill-down to Review Hub |
| `AnalyticsSkeleton` | `src/components/analytics/analytics-skeleton.tsx` | Loading skeleton matching the full analytics layout |

### Hook

| Hook | Purpose |
|---|---|
| `useAnalytics` | SWR-based hook respecting global filters, fetches `/api/analytics` |

## Key Features

1. **Metrics Bar**: 5 cards in a responsive grid showing total, average rating, and sentiment breakdown
2. **Sentiment Analysis Chart**: Bar chart comparing Positive/Neutral/Negative counts
3. **Rating Distribution Chart**: Bar chart showing 1-5 star distribution with color coding
4. **Trend Analysis**: Time-series line chart with two view modes:
   - **Sentiment view**: Lines for positive/negative/neutral over time
   - **Category view**: Multi-select category pills, each category as a colored line
5. **Category Distribution**: Horizontal bar chart with 14 color-coded categories, clickable to navigate to Review Hub
6. **Category Stats List**: Ranked list with progress bars, click any category to drill down into reviews
7. **Loading Skeletons**: Smooth loading states matching the component layout

## Dependencies

- `recharts` (new) — React charting library for all visualizations

## File Changes

### New Files
- `src/app/api/analytics/route.ts`
- `src/hooks/use-analytics.ts`
- `src/components/analytics/metrics-bar.tsx`
- `src/components/analytics/sentiment-chart.tsx`
- `src/components/analytics/trend-chart.tsx`
- `src/components/analytics/category-chart.tsx`
- `src/components/analytics/category-stats-list.tsx`
- `src/components/analytics/analytics-skeleton.tsx`

### Modified Files
- `src/app/analytics/page.tsx` — Replaced EmptyState with full analytics dashboard
- `package.json` — Added `recharts` dependency
