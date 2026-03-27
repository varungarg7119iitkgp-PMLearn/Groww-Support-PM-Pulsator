# Phase 1: Test Checklist

## Automated Checks (All Passed)

- [x] **TypeScript compilation**: Zero type errors (`npm run build`)
- [x] **Build success**: All 7 routes compiled (/, /reviews, /analytics, /categories, /word-cloud, /reporting, /_not-found)
- [x] **Linter**: Zero lint errors in src/
- [x] **Dev server**: All pages return HTTP 200
- [x] **No React warnings**: setState-during-render issue fixed in FilterProvider

## Manual Testing Checklist

Open `http://localhost:3000` in your browser and verify the following:

### Navigation (Desktop — window width >= 1024px)

- [ ] Header shows "Groww Support PM Pulsator" with blue "G" logo
- [ ] Horizontal tab bar visible below header with 6 tabs: Apps, Reviews, Analytics, Categories, Word Cloud, Reporting
- [ ] Each tab has an icon + text label
- [ ] Clicking each tab navigates to the correct page
- [ ] Active tab has blue pill background with white text
- [ ] Inactive tabs have no background highlight

### Navigation (Mobile — resize window to <= 768px)

- [ ] Top horizontal tab bar disappears
- [ ] Fixed bottom navigation bar appears with 4 items: Apps, Reviews, Insights, More
- [ ] Active bottom nav item is highlighted in blue
- [ ] Tapping "Insights" opens a submenu with: Analytics, Categories, Word Cloud
- [ ] Tapping "More" opens a submenu with: Reporting
- [ ] Tapping a submenu item navigates to the correct page and closes the submenu
- [ ] Tapping outside the submenu closes it

### Theme Toggle

- [ ] Sun/moon icon visible in the top-right Context Bar
- [ ] Clicking toggles between light and dark mode instantly
- [ ] Dark mode: dark background (#1A202C), light text, dark cards
- [ ] Light mode: light background (#F8F9FA), dark text, white cards
- [ ] Theme persists after page refresh (check localStorage)
- [ ] On first visit (clear localStorage), theme follows OS preference

### Context Bar (Desktop)

- [ ] Platform toggle pills visible: All | Android | iOS
- [ ] Clicking a platform pill highlights it in blue
- [ ] "Sync" button visible but disabled (grayed out, cursor: not-allowed)
- [ ] Theme toggle icon visible and functional

### Filter Bar (visible on Reviews, Analytics, Categories, Word Cloud pages)

**Desktop:**
- [ ] Filter bar visible as a card with Platform, Time Period, and Custom Date Range sections
- [ ] Platform pills (All, Android, iOS) work — clicking highlights the active one
- [ ] Quick filter buttons (Today, Yesterday, Last 7 Days, Last 15 Days, Last 30 Days) work
- [ ] "Last 30 Days" is the default selected
- [ ] Custom Date Range: both date inputs accept dates
- [ ] "Apply" button applies the custom range
- [ ] "Reset" button resets to "Last 30 Days"
- [ ] Validation: if start date > end date, error message appears: "Start date must be before end date"

**Mobile (window <= 768px):**
- [ ] Filter bar collapses to a single "Filters" button
- [ ] Tapping "Filters" opens a bottom sheet modal (90%+ screen width)
- [ ] All filter options are available in the modal
- [ ] Tapping outside or X button closes the modal
- [ ] When filters are non-default, a blue indicator dot appears on the button

### Filter Persistence

- [ ] Set platform to "Android" on the Reviews page
- [ ] URL updates to include `?platform=android`
- [ ] Navigate to Analytics tab — filter state persists (URL still has platform param)
- [ ] Navigate back to Reviews — filter is still "Android"
- [ ] Refresh the page — filter state is restored from URL

### Page Content

- [ ] **Apps (/)**: Shows "No apps configured yet" empty state with LayoutGrid icon
- [ ] **Reviews (/reviews)**: Shows "No reviews yet" empty state with Star icon + filter bar
- [ ] **Analytics (/analytics)**: Shows "No analytics data" empty state with BarChart icon + filter bar
- [ ] **Categories (/categories)**: Shows "No categories yet" empty state with Tags icon + filter bar
- [ ] **Word Cloud (/word-cloud)**: Shows "No word data yet" empty state with Cloud icon + filter bar
- [ ] **Reporting (/reporting)**: Shows "Reporting workflows coming soon" empty state with FileText icon (no filter bar)

### Responsive Layout

- [ ] At >= 1024px (desktop): Multi-column layout, horizontal tab nav
- [ ] At 481-768px (tablet): Layout adjusts, bottom nav appears
- [ ] At <= 480px (mobile): Single column, bottom nav, compact layout
- [ ] No horizontal scroll at any breakpoint
- [ ] Touch targets are adequately sized (no tiny buttons on mobile)

### General

- [ ] No console errors in browser DevTools (check Console tab)
- [ ] No 404 errors in Network tab
- [ ] Page transitions are smooth (no blank screens)
- [ ] Typography is legible at all sizes
- [ ] Color contrast is adequate in both light and dark modes

## How to Run

```bash
npm run dev
# Open http://localhost:3000
```

## Build Verification

```bash
npm run build
# Should exit with code 0, all routes compiled
```
