# Phase 6: Customer Testimonials — Test Checklist

## Pre-requisites
- Phases 1-5 completed (400 categorized reviews in Supabase)
- Dev server running at `http://localhost:3000`

---

## API Verification

### `/api/testimonials` (GET)
- [x] Returns `metrics`, `wordFrequencies`, `topUpvoted`
- [x] Metrics: totalReviews=400, totalWords=1810, uniqueWords=739
- [x] Top words: "good" (106), "app" (98), "easy" (52), "groww" (33), "nice" (33)
- [x] Top upvoted: 7 reviews with upvote counts from 24 down to 1
- [x] Upvoted reviews include categories
- [x] Respects `platform` and `timePeriod` filters
- [x] `topN` parameter controls word count (tested with 10)
- [x] Stop words properly excluded (the, a, is, are, etc.)

---

## UI Component Tests

### Testimonials Metrics (3 cards)
- [ ] "Reviews Analyzed" card with count
- [ ] "Total Words" card with count
- [ ] "Unique Words" card with count
- [ ] Each card has a colored icon
- [ ] Responsive grid layout

### Word Cloud
- [ ] Words displayed in varying sizes (largest = most frequent)
- [ ] Words have varying colors from the palette
- [ ] Words have varying opacity (more frequent = more opaque)
- [ ] Hover scales the word up (hover:scale-110)
- [ ] Tooltip shows "word: N occurrences" on hover
- [ ] Clicking a word navigates to `/?search=<word>`
- [ ] Reviews page shows filtered results for clicked word
- [ ] "Click any word to filter reviews" helper text below

### Top Keywords List
- [ ] Shows top 20 words by default
- [ ] Each word has rank number, name, progress bar, and count
- [ ] Progress bars proportional to count
- [ ] "Show All (30)" toggle appears when > 20 words
- [ ] Toggle reveals all words; toggle again collapses
- [ ] Clicking a word navigates to `/?search=<word>`
- [ ] Hover shows chevron arrow

### Top Upvoted Reviews
- [ ] Shows reviews sorted by upvote count (highest first)
- [ ] Uses ReviewCard component with full metadata
- [ ] Upvote count visible in card footer
- [ ] Category tags displayed and clickable
- [ ] "Find Similar" action works
- [ ] Shows empty state when no upvoted reviews exist
- [ ] Count badge shows number of upvoted reviews

### Loading State
- [ ] Skeleton displays while data loads
- [ ] Skeleton matches layout

### Empty State
- [ ] Shows "No word data yet" when no reviews

---

## Integration Tests

### Word Cloud → Review Hub
- [ ] Clicking word in cloud navigates to `/?search=<word>`
- [ ] Review Hub pre-populates search field with the word
- [ ] Review list filters correctly

### Top Words → Review Hub
- [ ] Clicking keyword navigates to `/?search=<word>`
- [ ] Same behavior as word cloud click

### Analytics → Review Hub → Word Cloud Cross-Navigation
- [ ] Category click from Analytics page → Review Hub shows filtered
- [ ] Word click from Word Cloud → Review Hub shows filtered
- [ ] All filters preserve across navigations

### Global Filters
- [ ] Changing platform updates word cloud and all components
- [ ] Changing time period updates everything
- [ ] Custom date range works

---

## API Sanity Results (Automated)

| Test | Status | Result |
|---|---|---|
| Testimonials API (all/last_30, topN=10) | PASS | 400 reviews, 1810 words, 739 unique, 10 top words |
| Top word correctness | PASS | "good"=106, "app"=98, "easy"=52 |
| Top upvoted | PASS | 7 reviews, highest upvote=24 (Ajith Paleakkara) |
| Categories in upvoted | PASS | All reviews have category tags |
| TypeScript build | PASS | No type errors |
| Linter check | PASS | No lint errors |
