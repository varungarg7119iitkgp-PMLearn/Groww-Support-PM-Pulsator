# Phase 4: Review Hub — Test Checklist

## Pre-requisites
- Phases 1-3 completed (400 reviews ingested and categorized in Supabase)
- Dev server running at `http://localhost:3000`

---

## API Verification

### `/api/reviews/stats` (GET)
- [x] Returns `total`, `ratingDistribution`, `sentimentCounts`, `averageRating`, `nps`
- [x] Verified: 400 reviews, NPS +69, avg 4.3, distribution {5:307, 4:22, 3:17, 2:4, 1:50}
- [x] Respects `platform` filter (all/android/ios)
- [x] Respects `timePeriod` filter

### `/api/reviews/list` (GET)
- [x] Returns paginated reviews with `reviews`, `total`, `page`, `pageSize`, `totalPages`
- [x] Each review includes `categories` array with `{id, name, slug}` from junction table
- [x] Verified pagination: pageSize=2 returns totalPages=200 for 400 reviews
- [x] `sentiment` filter works: sentiment=negative returns 62 reviews
- [x] `category` filter works: category=app-crash returns 8 reviews
- [x] `search` filter works: search=crash returns relevant matches
- [x] `starRating` filter works

### `/api/categories` (GET)
- [x] Returns all 14 categories alphabetically sorted

---

## UI Component Tests

### Rating Distribution Histogram
- [ ] Displays 5 bars (5★ to 1★) with correct counts and percentages
- [ ] Bar widths proportional to count (longest bar = highest count)
- [ ] Colors: green for 4-5★, amber for 3★, red for 1-2★
- [ ] Clicking a bar filters review list to that star rating
- [ ] Clicking the same bar again clears the filter (toggle behavior)
- [ ] Active bar has a visual ring indicator

### NPS Gauge
- [ ] Displays NPS score with sign (+69)
- [ ] Shows NPS label (Excellent/Great/Good/Needs Work/Critical)
- [ ] NPS color-coded: green ≥50, amber 0-49, red <0
- [ ] Promoters/Passives/Detractors breakdown displayed
- [ ] Total Reviews count displayed
- [ ] Average Rating with star icon
- [ ] Sentiment split bar (green/amber/red segments)
- [ ] Percentage labels beneath sentiment bar

### Review Cards
- [ ] Shows author name, platform icon, date, star rating, sentiment badge
- [ ] Sentiment badge color: green=positive, red=negative, amber=neutral
- [ ] Long review text truncated at 200 chars with "Read more" button
- [ ] "Read more" expands text; "Show less" collapses it
- [ ] Category tags displayed as clickable pills
- [ ] Clicking a category tag filters the list to that category
- [ ] Footer shows app version, device info (if available), upvote count
- [ ] "Find Similar" button present on each card
- [ ] Card hover shows subtle shadow increase

### Inline Filters (below stats, above review list)
- [ ] Search bar with debounced text input (400ms delay)
- [ ] Search clear (X) button appears when text entered
- [ ] Sentiment pills: All / Positive / Negative / Neutral
- [ ] Active sentiment pill highlighted with accent color
- [ ] Category active filter shown as removable tag
- [ ] "Clear" button resets all inline filters

### Pagination
- [ ] Shows "Showing X to Y of Z reviews" text
- [ ] First / Previous / Next / Last navigation buttons
- [ ] Page number buttons with ellipsis for large page counts
- [ ] Active page highlighted
- [ ] Disabled state for first/previous when on page 1
- [ ] Disabled state for next/last when on last page
- [ ] Page change triggers new API request and updates list
- [ ] Hidden when only 1 page of results

### Find Similar Reviews Modal
- [ ] Opens when clicking "Find Similar" on a review card
- [ ] Pre-populates search with top 5 extracted keywords
- [ ] Shows source review text snippet
- [ ] Search button triggers API call
- [ ] Results displayed as ReviewCard components (excluding source review)
- [ ] "No similar reviews found" message for empty results
- [ ] Close button (X) and backdrop click close the modal
- [ ] Category clicks from modal results close modal and filter main list

### Loading States
- [ ] Stats section shows skeleton animation while loading
- [ ] Review list shows skeleton animation while loading
- [ ] Skeletons match the layout of actual components

### Empty States
- [ ] "No reviews yet" message when no reviews exist in database
- [ ] "No reviews match your filters" when filters produce empty results

---

## Integration Tests

### Global Filter → Review Hub Integration
- [ ] Changing platform (All/Android/iOS) updates both stats and review list
- [ ] Changing time period updates both stats and review list
- [ ] Custom date range applies to both stats and review list
- [ ] Filters persist in URL query parameters

### Combined Filtering
- [ ] Platform + Sentiment + Star Rating work together
- [ ] Platform + Category work together
- [ ] Search + Sentiment work together
- [ ] Star rating (from histogram) + Sentiment + Search work together
- [ ] Resetting inline filters preserves global platform/time filters

### Cross-Component Interaction
- [ ] Clicking star bar in histogram → review list shows only that rating
- [ ] Clicking category tag on card → filter updates, page resets to 1
- [ ] Find Similar → search → click category in results → modal closes, main list filtered

---

## API Sanity Results (Automated)

| Test | Status | Result |
|---|---|---|
| Stats API (all/last_30) | PASS | 400 reviews, NPS +69, avg 4.3 |
| List API (page 1, size 2) | PASS | 2 reviews with categories, totalPages=200 |
| Negative sentiment filter | PASS | 62 reviews returned |
| Category filter (app-crash) | PASS | 8 reviews returned |
| Search filter ("crash") | PASS | Relevant matches found |
| Categories API | PASS | 14 categories, alphabetically sorted |
| TypeScript build | PASS | No type errors |

---

## Notes

- All API endpoints are fully tested programmatically via curl/PowerShell
- Build passes cleanly with no TypeScript errors
- The dev server is running on port 3000 from the previous session
- NPS formula: `%Promoters(4-5★) − %Detractors(1-2★)` = ((307+22) − (4+50)) / 400 × 100 = +69
