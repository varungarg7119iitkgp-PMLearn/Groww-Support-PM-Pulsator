# Phase 5: Analytics Layer — Test Checklist

## Pre-requisites
- Phases 1-4 completed (400 categorized reviews in Supabase)
- Dev server running at `http://localhost:3000`

---

## API Verification

### `/api/analytics` (GET)
- [x] Returns `metrics`, `ratingDistribution`, `sentimentDistribution`, `categoryDistribution`, `trends`
- [x] Metrics: total=400, averageRating=4.3, positive=316, negative=62, neutral=22
- [x] Rating distribution: {5:307, 4:22, 3:17, 2:4, 1:50}
- [x] Category distribution: 14 categories, sorted by count descending (Others=212, UI/UX=102, Performance=68, ...)
- [x] Trends: daily breakdown with total/positive/negative/neutral + per-category counts
- [x] Respects `platform` and `timePeriod` filters

---

## UI Component Tests

### Metrics Bar (5 cards)
- [ ] Total Reviews card with count (400)
- [ ] Avg Rating card with score (4.3) and "out of 5.0" subtitle
- [ ] Positive card with count (316) and percentage (79%)
- [ ] Negative card with count (62) and percentage (15.5%)
- [ ] Neutral card with count (22) and percentage (5.5%)
- [ ] Each card has a colored icon
- [ ] Responsive: 2 cols mobile, 3 cols tablet, 5 cols desktop

### Sentiment Analysis Chart
- [ ] Bar chart with 3 bars: Positive, Neutral, Negative
- [ ] Bars colored green, amber, red respectively
- [ ] Tooltip shows value on hover
- [ ] Axes labeled correctly

### Rating Distribution Chart
- [ ] Bar chart with 5 bars: 5★, 4★, 3★, 2★, 1★
- [ ] Bars colored: green (4-5★), amber (3★), red (1-2★)
- [ ] Tooltip on hover

### Trend Analysis Chart
- [ ] Sentiment toggle button active by default
- [ ] Shows 3 lines: Positive (green), Negative (red), Neutral (amber)
- [ ] X-axis shows formatted dates (e.g., "24 Mar")
- [ ] Tooltip shows exact date, category/sentiment, and count
- [ ] Legend displays below chart
- [ ] Switch to "Categories" view mode
- [ ] Category pills appear as multi-select toggles
- [ ] Top 5 categories pre-selected
- [ ] Clicking pill toggles that category line on/off
- [ ] Each category line has a distinct color

### Category Distribution Chart (Horizontal Bar)
- [ ] All 14 categories displayed as horizontal bars
- [ ] Bars sorted by count (highest at top)
- [ ] Each bar has a distinct color
- [ ] Tooltip shows count on hover
- [ ] Clicking a bar navigates to Review Hub (`/?category=slug`)

### Category Stats List
- [ ] All 14 categories listed with name, count, percentage
- [ ] Progress bar proportional to count
- [ ] Each row has a colored dot matching chart colors
- [ ] Hover reveals chevron arrow
- [ ] Clicking a category navigates to Review Hub

### Loading State
- [ ] Analytics skeleton displays while data loads
- [ ] Skeleton matches layout of actual components

### Empty State
- [ ] When no reviews exist, shows "No analytics data" message

---

## Integration Tests

### Global Filter → Analytics
- [ ] Changing platform (All/Android/iOS) updates all charts
- [ ] Changing time period updates all charts
- [ ] Custom date range applies correctly

### Analytics → Review Hub Navigation
- [ ] Clicking category bar in chart navigates to `/?category=<slug>`
- [ ] Clicking category in stats list navigates to `/?category=<slug>`
- [ ] Review Hub correctly shows filtered reviews

---

## API Sanity Results (Automated)

| Test | Status | Result |
|---|---|---|
| Analytics API (all/last_30) | PASS | 400 reviews, 14 categories, 3 days trend data |
| Metrics values | PASS | total=400, avg=4.3, pos=316, neg=62, neu=22 |
| Category distribution | PASS | 14 categories, Others=212, UI/UX=102, Performance=68 |
| Trend data structure | PASS | 3 dates with per-category breakdown |
| TypeScript build | PASS | No type errors |
