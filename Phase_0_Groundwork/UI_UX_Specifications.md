# Groww Support PM Pulsator — UI/UX Design Specifications

---

## 1. Introduction

This document defines the complete UI/UX Design Specifications for the Groww Support PM Pulsator application. It serves as the definitive reference for visual design, interaction patterns, component behavior, and responsive layout before any technical implementation begins.

The design philosophy prioritizes **legibility**, **mobile-first responsiveness**, and **workflow efficiency** for Support Product Managers. The application supports both Light and Dark modes, incorporates approval-gated workflow patterns for external actions (Jira, email, documentation), and adapts seamlessly across mobile, tablet, and desktop breakpoints.

---

## 2. Glossary

| Term | Definition |
|---|---|
| **Context Bar** | The persistent top-right header area containing app selector, platform toggle, sync controls, and theme toggle. |
| **Global Filter** | The persistent filter controls (Platform, Time Period, App/Bundle ID) that affect all dashboard modules. |
| **Approval Gate** | A UI control pattern that blocks external actions until the user explicitly clicks "Approve." |
| **Review Card** | The standard card component used to display a single review with metadata, sentiment, and action buttons. |
| **Bottom Nav** | The fixed bottom navigation bar used on mobile breakpoints as a replacement for the desktop horizontal tab bar. |
| **Morning Brew** | The executive email draft combining Weekly Pulse and app health metrics. |
| **Word Cloud** | A visual map of frequently used terms sized by occurrence frequency. |
| **NPS Dial** | A visual gauge/score box displaying the Net Promoter Score. |
| **Split View** | A two-panel layout used on the Reporting screen to show Weekly Pulse and Fee Explainer side by side. |

---

## 3. Global Specifications

### 3.1 Mobile-Optimized Responsive Design

**Philosophy**: Mobile-First design approach. Layout elements MUST reflow seamlessly based on screen size.

**Breakpoints**:

| Breakpoint | Width | Layout Behavior |
|---|---|---|
| Mobile | ≤480px | Single column, bottom nav bar, full-screen filter modal, stacked cards |
| Tablet | 481px–768px | Two-column where possible, bottom nav bar, compact filter bar |
| Desktop | ≥1024px | Multi-column, horizontal tab bar, sidebar/inline filters |

**Mobile-Specific Component Behaviors**:

1. WHEN the viewport width is ≤768px, THE main navigation bar SHALL collapse into a fixed bottom navigation bar.
2. WHEN the viewport width is ≤480px, THE Rating Distribution bars (horizontal on desktop) SHALL transform to vertical bars or compact stacked bars to fit the narrow viewport.
3. WHEN the viewport width is ≤768px, THE Global Filter component SHALL collapse to a single filter icon that opens a full-screen modal overlay.
4. WHEN any modal is displayed on mobile, THE modal SHALL occupy a minimum of 90% screen width with standard close gestures (swipe down or tap outside).
5. THE application SHALL enable smooth kinetic scrolling on all scrollable areas. Infinite scroll SHALL be the preferred pattern for long review lists on mobile.

**Touch Optimization**:

6. ALL interactive elements (buttons, inputs, toggles, links) SHALL have a minimum touch target of 48dp x 48dp.
7. THE application SHALL maintain adequate spacing (minimum 8dp) between adjacent interactive elements to prevent accidental taps.

### 3.2 Legible Typography

**Primary Font Family**: Inter — chosen for maximum legibility across all screen sizes and resolutions.

**Font Weight Hierarchy**: Regular (400), Semi-Bold (600), Bold (700).

**Typography Scale**:

| Element | Size | Weight | Usage |
|---|---|---|---|
| Main Header | 24px+ | Bold (700) | App name, primary page headers |
| Page Titles | 20px+ | Semi-Bold (600) | Module titles (e.g., "Reviews" header in content pane) |
| Component Headers | 16px+ | Semi-Bold (600) | Card titles, metric labels, section headers |
| Base Text | 14px | Regular (400) | Review body text, descriptions, metric values |
| Device Info / Tags | 12px | Regular (400) | Device info, OS version, category tags, timestamps |

**Scaling Rules**:

1. THE application SHALL use scalable CSS units (`rem`) so font sizes scale proportionally across breakpoints.
2. THE minimum base text size SHALL never drop below 12px on any device or breakpoint.
3. ALL text elements SHALL maintain a minimum color contrast ratio of 4.5:1 against their background (WCAG AA standard).

### 3.3 Light and Dark Theme Support

**System Preference Inheritance**:

1. WHEN the application loads for the first time, THE theme SHALL inherit the user's operating system preference (light or dark).
2. THE application SHALL provide a manual theme toggle available globally in the Context Bar.

**Theme Toggle UI**:

3. THE theme toggle SHALL be a sun/moon icon switch located in the Context Bar (top-right area).
4. WHEN the user toggles the theme, THE application SHALL immediately apply the selected theme to ALL UI components without requiring a page reload.
5. THE application SHALL persist the user's theme preference across sessions using localStorage.

**Groww Brand Colors**:

| Token | Value | Usage |
|---|---|---|
| Groww Green | `#00D09C` | Primary accent — buttons, toggles, active states, links |
| Groww Blue | `#5367FF` | Secondary accent — charts, secondary highlights |

**Color Palette — Light Mode**:

| Token | Value | Usage |
|---|---|---|
| Main Background | `#FFFFFF` / `#F8F9FA` | Page background, app shell |
| Content Cards | `#FFFFFF` | Card surfaces with subtle box-shadow |
| Primary Accent | `#00D09C` (Groww Green) | Buttons, toggles, active tab states, links |
| Base Text | `#1A1A2E` | Primary body text, headings |
| Secondary Text | `#666666` | Device info, tags, timestamps, helper text |
| Border / Divider | `#E2E8F0` | Card borders, section dividers |

**Color Palette — Dark Mode**:

| Token | Value | Usage |
|---|---|---|
| Main Background | `#0D1117` | Page background, app shell |
| Content Cards | `#161B22` | Card surfaces, slightly lighter than background |
| Primary Accent | `#00D09C` (Groww Green) | Buttons, toggles — ensure white text on accent backgrounds |
| Base Text | `#E6EDF3` | Primary body text, headings |
| Secondary Text | `#8B949E` | Device info, tags, timestamps, helper text |
| Border / Divider | `#21262D` | Card borders, section dividers |

**Sentiment Badge Colors** (consistent across both themes):

| Sentiment | Background | Text | Usage |
|---|---|---|---|
| Positive | `#00D09C` (Groww Green) | `#FFFFFF` | Positive sentiment badge on review cards |
| Neutral | `#A0AEC0` (gray) | `#FFFFFF` | Neutral sentiment badge |
| Negative | `#F56565` (red) | `#FFFFFF` | Negative sentiment badge, left-border accent on expanded cards |

**Star Rating Colors**:

| Rating | Color | Hex |
|---|---|---|
| 5-star | Groww Green | `#00D09C` |
| 4-star | Groww Blue | `#5367FF` |
| 3-star | Gray | `#A0AEC0` |
| 2-star | Orange | `#ED8936` |
| 1-star | Red | `#F56565` |

---

## 4. Layout and Screen Navigation

### 4.1 Global Navigation

**Fixed Elements**: Fixed Top Header bar containing the Groww logo, "Support PM Pulsator" title with "AI-Powered Review Intelligence" subtitle on the left, and the Context Bar on the right.

**Desktop Sub-Navigation** (≥1024px):

1. THE application SHALL display a fixed horizontal tab bar below the header with tabs: **Reviews** (home) | **Analytics** | **Categories** | **Word Cloud** | **Ideation** | **Reporting**.
2. THE active tab SHALL be indicated by a pill shape with the Groww Green accent background color (`#00D09C`) and white text.
3. THE inactive tabs SHALL use base text color with no background highlight.
4. Tab icons SHALL accompany each label for visual scanning.

**Mobile Sub-Navigation** (≤768px):

5. WHEN the viewport is ≤768px, THE horizontal tab bar SHALL collapse into a compact fixed bottom navigation bar.
6. THE bottom nav SHALL consolidate tabs: "Analytics", "Categories", and "Word Cloud" SHALL merge into a single **"Insights"** bottom nav icon with a submenu.
7. THE "Ideation" tab SHALL be a direct bottom nav item.
8. THE "Reporting" tab SHALL be accessible from a **"More"** icon in the bottom nav.
8. THE bottom nav SHALL display icon + label for each item, with the active item highlighted using the primary accent color.
9. THE bottom nav height SHALL be 56dp with items vertically centered.

### 4.2 Global Context Bar

**Location**: Top-right area of the Fixed Header.

**Contents and Behavior**:

1. **App Selector**: Dropdown control for selecting the active Groww app. WHEN an app is selected, all dashboard modules SHALL update to reflect data for that app.
2. **Platform Toggle**: Pill-shaped toggle buttons for "Android" and "iOS". THE active platform SHALL be highlighted with the accent color. Selecting a platform SHALL update the Global Filter.
3. **Manual Sync Button**: Labeled "Sync Android Reviews" or "Sync iOS Reviews" depending on the active platform. THE button SHALL be active/enabled only when an app is selected and a platform is chosen. SHALL display a loading spinner during sync.
4. **Theme Toggle**: Sun/moon icon switch (see Section 3.3).

**Mobile Context Bar** (≤768px):

5. THE Context Bar SHALL collapse to show only the theme toggle and a compact app/platform indicator. Full controls SHALL be accessible via a dropdown or slide-out panel.

---

## 5. UI Component Library

### 5.1 Review Card Component

**Base Layout**: Standard card format with 16dp padding and 8dp corner radius. Subtle box-shadow in light mode, slightly elevated background in dark mode.

**Card Header**:

1. THE card header SHALL display: Author Name (Semi-Bold, 14px), Platform Icon (Android robot / Apple icon), and Date (e.g., "Feb 24, 2026" — Secondary Text color, 12px) aligned to the right.
2. THE Star Rating SHALL be displayed as filled star icons (using the star rating color from Section 3.3) followed by the numeric rating.

**Card Body**:

3. THE card body SHALL display the full review text in Base Text style (14px, Regular).
4. THE review text area SHALL support expand/collapse for reviews exceeding 3 lines on mobile or 5 lines on desktop. A "Show more" / "Show less" toggle link SHALL be displayed.

**Device Info Row**:

5. THE device info row SHALL display: Device name, OS version, App Version (e.g., "Android 13, App Version 2.4.2, Samsung Galaxy S21") in 12px font, Secondary Text color.
6. THE device info row SHALL be visually separated from the card body by a subtle divider line.

**Sentiment and Category Badges**:

7. THE Sentiment Badge SHALL be a pill-shaped tag colored per the Sentiment Badge Colors table. It SHALL include a text label ("Positive", "Negative", or "Neutral") — color alone SHALL NOT convey sentiment.
8. THE AI Category Tags (e.g., "Login Issues", "KYC", "Payments") SHALL be displayed as pill-shaped tags with a subtle background tint. WHEN a user clicks a category tag, THE Review Hub SHALL filter to show only reviews matching that category. Tags SHALL have a hover/active state indicating clickability.

**Action Footer**:

9. THE action footer SHALL display three action buttons in a horizontal row:
   - **"AI Reply"** — Opens the AI Reply modal (see Section 5.2)
   - **"Report Bug"** — Opens the Bug Reporter modal (see Section 5.3)
   - **"Find Similar"** — Opens the Find Similar Reviews modal (see Section 5.4)
10. On mobile, action buttons SHALL use icon-only format with tooltips on long-press. On desktop, buttons SHALL show icon + text label.
11. Buttons SHALL use ghost/outline styling to avoid visual clutter on the card.

### 5.2 AI Reply Modal

**Trigger**: "AI Reply" button on a Review Card.

**Modal Layout**:

1. THE modal SHALL display the original review text at the top for reference (read-only, muted styling).
2. A **Tone Selector** SHALL be displayed as a segmented control with three options: Empathetic, Professional, Gratitude. Default selection: Empathetic.
3. BELOW the tone selector, an editable text area SHALL display the AI-generated reply.
4. WHEN the tone selector is changed, THE reply SHALL regenerate using the newly selected tone. A loading indicator SHALL appear during regeneration.
5. THE modal footer SHALL contain:
   - **"Copy to Clipboard"** button — copies the reply text and shows a success toast.
   - **"Regenerate"** button — triggers a new AI generation with the current tone.
   - **"Close"** button — dismisses the modal.
6. IF the AI fails to generate a reply, THE modal SHALL display an inline error message with a "Retry" button.

### 5.3 Bug Reporter Modal

**Trigger**: "Report Bug" button on a Review Card, or bulk selection from the Ideation screen.

**Modal Layout**:

1. THE modal SHALL display pre-populated fields:
   - **Summary Title** (editable text input) — AI-generated from review content
   - **Description** (editable text area) — Synthesized from selected review(s)
   - **Affected App Version(s)** (editable) — Extracted from review metadata
   - **Affected OS(es)** (editable) — Extracted from review metadata
   - **Affected Platform(s)** (editable) — Extracted from review metadata
   - **Review Date Range** (read-only) — Computed from selected reviews
   - **User Quotes** (read-only) — PII-sanitized verbatim quotes from selected reviews
2. A **Jira Board Selector** dropdown SHALL allow the user to choose the target Jira board.
3. THE modal footer SHALL contain:
   - **"Push to Jira"** button — Triggers the Approval Gate (see Section 5.6).
   - **"Cancel"** button — Dismisses the modal without action.
4. WHEN the Jira ticket is successfully created, THE modal SHALL display a success state with the Jira ticket ID and a clickable link to the ticket.
5. IF the Jira API returns an error, THE modal SHALL display the error details inline with a "Retry" button. The form data SHALL NOT be lost.

### 5.4 Find Similar Reviews Modal

**Trigger**: "Find Similar" button on a Review Card.

**Modal Layout**:

1. THE modal SHALL display a search input pre-populated with AI-extracted keywords from the source review.
2. THE user SHALL be able to edit the keywords or add new search terms.
3. BELOW the search input, matching reviews SHALL be displayed as a scrollable list of compact Review Cards.
4. WHEN a user clicks on a review in the results, THE modal SHALL expand that review to show full details.
5. A **"View in Review Hub"** link SHALL navigate to the Review Hub with the search query applied as a filter.

### 5.5 CSV Upload Modal

**Trigger**: "Import CSV Reviews" button on an App Card (Home screen).

**Multi-Step Workflow**:

**Step 1 — File Upload**:
1. THE modal SHALL display a drag-and-drop area with a file picker fallback.
2. Accepted format: `.csv` files only. Maximum size: 50 MB.
3. IF the file is invalid (wrong format or exceeds size limit), THE modal SHALL display an inline error message describing the rejection reason.

**Step 2 — Header Mapping**:
4. THE modal SHALL display detected CSV column headers in a list.
5. NEXT TO each detected header, a dropdown SHALL allow the user to map it to an internal schema field: Rating, Date, Body, OS, Version, Platform, Author.
6. Required mappings (Rating, Date, Body, Platform) SHALL be visually indicated. THE "Next" button SHALL be disabled until all required fields are mapped.

**Step 3 — Validation Summary**:
7. THE modal SHALL display: Total Rows detected, Valid Rows (ready to import), Skipped Rows (with reasons listed).
8. Each skipped row reason SHALL be displayed in a collapsible error list.

**Step 4 — Import Confirmation**:
9. THE modal SHALL display a final confirmation with the count of rows to import.
10. An **"Import"** button SHALL trigger the ingestion.
11. A progress indicator SHALL show import progress for large files.

**Step 5 — Summary**:
12. WHEN import completes, THE modal SHALL display: Successfully imported count, Skipped count, and a "Download Error Log" link for skipped rows.
13. A **"Done"** button SHALL dismiss the modal.

### 5.6 Approval Gate Component

**Usage**: Applied to all external actions — Jira ticket creation, document appending, email draft creation.

**Visual Pattern**:

1. THE "Approve" button SHALL be visually prominent: primary accent color (`#2E7BC4`), white text, larger touch target (minimum 48dp height, 120dp width).
2. THE "Reject" button SHALL be secondary styled: outline border, muted text color, same height as Approve.
3. WHEN an action is pending approval, THE UI SHALL display an "Awaiting your approval" label above the buttons.
4. WHEN "Approve" is clicked:
   - THE button SHALL transition to a loading state (spinner + "Processing..." label).
   - THE button SHALL be disabled to prevent double-clicks.
   - WHEN the action completes successfully, THE UI SHALL display a green success confirmation with relevant details (ticket link, document link, or draft confirmation).
5. WHEN "Reject" is clicked:
   - THE current generated content SHALL be discarded.
   - THE UI SHALL return to the generation trigger state, allowing the user to re-generate.
6. THE Approve button SHALL NEVER auto-trigger. It requires explicit user interaction.

---

## 6. Screen-by-Screen Breakdown

### 6.1 Home Screen: App Management and Data Ingestion

**Navigation Tab**: Apps

**Layout**: Card-based management view. Each card represents one registered Groww app.

**App Card Contents**:

1. Each app card SHALL display:
   - App name (Component Header, 16px, Semi-Bold)
   - Android Bundle ID (Secondary Text, 12px)
   - iOS Bundle ID (Secondary Text, 12px)
2. **Sync Management Section**: Each card SHALL show sync status indicators:
   - "Live Sync Active (Android)" / "Live Sync Active (iOS)" with green dot indicators for active sync, red dot for failed sync.
   - "Last synced: [timestamp]" below each indicator.
   - "Sync Android Reviews" / "Sync iOS Reviews" manual sync buttons.
3. **Manual Ingestion Section**: Each card SHALL include an "Import CSV Reviews" button that opens the CSV Upload Modal (Section 5.5).

**Empty State**: WHEN no apps are registered, THE screen SHALL display an empty state card with a message: "No apps configured yet" and an "Add App" button.

### 6.2 Review Hub (Triage Dashboard)

**Navigation Tab**: Reviews

**Global Filters**:

1. THE filter bar SHALL display:
   - Platform pills: All | Android | iOS
   - Quick Filter presets: Today | Yesterday | Last 7 Days | Last 15 Days | Last 30 Days
   - Custom Date Range picker with "From" and "To" date inputs, "Apply" and "Reset" buttons
2. ON MOBILE (≤768px): THE filter bar SHALL collapse into a single filter icon. WHEN tapped, THE filters SHALL open as a full-screen modal with all filter options arranged vertically.
3. THE active filter state SHALL be visually indicated (accent-colored pills, filled date fields).

**Rating Distribution Section**:

4. THE Review Hub SHALL display horizontal histogram bars for each star rating (1 through 5), showing:
   - Star icons (colored per star rating colors)
   - Label: e.g., "1 Star Reviews"
   - Count badge: e.g., "(41 reviews)" in an accent-colored pill
   - Percentage: e.g., "29.1%"
   - Expand/Collapse chevron button
5. WHEN a user clicks on a star rating bar, THE review list below SHALL expand to show only reviews with that star rating.
6. ON MOBILE (≤480px): THE histogram bars SHALL transform to compact stacked bars with abbreviated labels.

**NPS Component**:

7. THE Review Hub SHALL display a prominent NPS visualization — a score box or dial graph — showing the real-time NPS calculation for the filtered period.
8. THE NPS score SHALL be labeled "NPS" with a tooltip: "Net Promoter Score = %Promoters (4-5 stars) minus %Detractors (1-2 stars)."
9. THE NPS value SHALL be color-coded: Green (positive NPS), Gray (zero), Red (negative NPS).
10. WHEN the filtered review set is empty, THE NPS component SHALL display "N/A" with the message: "No reviews match the current filters."

**Triage Workflow**:

11. THE review list SHALL display ReviewCard components (Section 5.1) in a paginated or infinite-scroll list.
12. Pagination controls (if used) SHALL appear at the bottom: "Previous | Page X of Y | Next" with page size selector (25, 50, 100).
13. Infinite scroll (preferred on mobile) SHALL load the next batch when the user scrolls within 200px of the bottom.

### 6.3 Analytics Layer

**Navigation Tab**: Analytics

**Metrics Bar**:

1. THE Analytics screen SHALL display a metrics bar with card-format metric tiles:
   - **Total Reviews**: Count (20px+, Bold) with label below
   - **Average Rating**: Value to 1 decimal (e.g., "3.6") with label below
   - **Positive Reviews**: Count with percentage
   - **Negative Reviews**: Count with percentage
2. Metric cards SHALL be arranged in a horizontal row on desktop (4 cards), 2x2 grid on tablet, and single column on mobile.
3. Each metric card SHALL have the Content Card background, 16dp padding, 8dp corner radius.

**Rating Distribution (Detailed)**:

4. THE Analytics screen SHALL display a horizontal bar chart showing review counts per star rating with exact counts and percentages.
5. Below the rating distribution, a **Sentiment Analysis** horizontal stacked bar SHALL show Positive, Negative, and Neutral percentages with color coding and labels.

**Category Distribution and Drill-Down**:

6. THE Analytics screen SHALL display a vertical bar chart (Recharts) visualizing AI Category volumes (e.g., "Login Issues", "KYC", "Payments").
7. TO THE RIGHT of the bar chart on desktop (or BELOW on mobile), THE screen SHALL display a **"Category Stats"** clickable list showing:
   - Category name
   - Copy icon (to copy category name)
   - Absolute count badge (colored pill)
   - Percentage
8. WHEN a user clicks on a bar in the chart OR a category in the stats list, THE application SHALL navigate to the Review Hub pre-filtered by that category tag.

**Trend Analysis Time-Series**:

9. THE Analytics screen SHALL display a time-series line chart showing daily review counts per category over the filtered time period.
10. THE chart SHALL include a multi-select control (checkboxes) allowing the user to select which categories to display on the trend chart.
11. WHEN hovering over a data point (or tapping on mobile), THE chart SHALL display a tooltip showing: exact date, category name, and review count.
12. THE chart SHALL use distinct line colors for each category, with a legend below the chart.

### 6.4 Categories Screen

**Navigation Tab**: Categories

**Metrics Bar**:

1. THE Categories screen SHALL display three metric cards:
   - **Total Reviews**: Count analyzed for categories
   - **Categories Found**: Number of distinct AI categories
   - **Top Issue**: Name of the most frequent category
2. Metric cards SHALL follow the same card format as the Analytics metrics bar.

**Category Distribution Chart**:

3. THE screen SHALL display a vertical bar chart showing review volumes per category, sorted by count descending.
4. Bars SHALL use distinct colors per category for visual differentiation.

**Category Stats List**:

5. TO THE RIGHT of the chart (or below on mobile), THE screen SHALL display the Category Stats list identical to the one on the Analytics screen (Section 6.3, item 7).
6. Each category row SHALL be expandable — clicking SHALL navigate to the Review Hub filtered by that category.

### 6.5 Customer Testimonials and Voice of Customer

**Navigation Tab**: Word Cloud

**Dynamic Word Cloud**:

1. THE Testimonials screen SHALL generate and render a dynamic word cloud from the filtered review texts, excluding common stop words.
2. THE word cloud SHALL render text legibly — larger words for higher frequency, smaller for lower — with adequate spacing to prevent overlap.
3. Words SHALL use varied colors from a curated palette that works in both light and dark modes.
4. WHEN a user clicks on a word in the word cloud, THE application SHALL navigate to the Review Hub with that word applied as a search filter.

**Metrics Row**:

5. BELOW the word cloud, THE screen SHALL display three metric cards in a horizontal row:
   - **Total Reviews** analyzed
   - **Total Words** analyzed
   - **Unique Words** identified
6. Metric cards SHALL use the accent color for the value and secondary text for the label.

**Top Words List**:

7. THE Testimonials screen SHALL display a ranked list of the top 20 keywords with their exact occurrence counts, sorted descending by frequency.
8. Each keyword SHALL be displayed as a pill-shaped tag with the count in parentheses (e.g., "experience (35)").
9. Keywords SHALL be arranged in a horizontal wrapping flow layout (flex-wrap).
10. WHEN a user clicks on a keyword, THE application SHALL navigate to the Review Hub filtered to show reviews containing that keyword.

**Top Upvoted Reviews**:

11. THE Testimonials screen SHALL include a dedicated "Top Upvoted Reviews" section below the word cloud and top words.
12. Reviews SHALL be displayed using the standard ReviewCard format (Section 5.1), ranked by upvote/helpfulness count descending.
13. Each card SHALL display the upvote count prominently.
14. WHEN upvote data is not available for a review, THE review SHALL be excluded from this section entirely.

### 6.6 Reporting Screen (Automated Workflows)

**Navigation Tab**: Reporting

**Screen Layout**: Split view on desktop — Weekly Pulse panel on the left, Fee Explainer panel on the right. On mobile, these SHALL stack vertically (Pulse on top, Explainer below).

**Part A — Weekly Pulse Panel**:

1. THE Pulse panel SHALL include a **"Generate Weekly Pulse"** trigger button at the top.
2. WHEN generated, THE panel SHALL display:
   - Generated Pulse text in an editable text area (≤250 words, PII-free).
   - A list of the top 3 highlighted themes with review counts.
   - Exactly 3 quoted verbatim reviews (PII-sanitized), displayed as blockquotes.
   - A list of 3 actionable product improvement ideas, displayed as numbered items.
3. THE panel SHALL include "Reject" and "Approve" buttons at the bottom (Approval Gate pattern, Section 5.6).
4. WHEN fewer than 10 reviews are available in the filtered set, THE generate button SHALL be disabled with a tooltip: "Minimum 10 reviews required."

**Part B — Fee Explainer Panel**:

5. THE Explainer panel SHALL include:
   - A **Scenario Selector** dropdown (e.g., "Groww Exit Load", "Brokerage", "Account Maintenance Charge").
   - A **"Generate Explainer"** trigger button.
6. WHEN generated, THE panel SHALL display:
   - Generated explanation in ≤6 factual bullet points (neutral tone, editable).
   - Exactly 2 official source links displayed as clickable URLs.
   - "Last checked: [Current Date]" timestamp in YYYY-MM-DD format.
7. THE panel SHALL include "Reject" and "Approve" buttons (Approval Gate pattern).

**Morning Brew Preview**:

8. BELOW the Split View, THE screen SHALL display a **"Morning Brew Preview"** area.
9. THE preview SHALL show an integrated HTML email preview combining:
   - The approved Weekly Pulse content
   - Macro app health metrics (Total Reviews, Average Rating, NPS)
   - The approved Fee Explainer content
10. THE preview SHALL resemble an email format with subject line: "Weekly Pulse + Fee Explainer — [Date]".
11. A **"Dispatch Morning Brew"** button SHALL be displayed below the preview.
12. THE button SHALL be disabled until a Weekly Pulse has been approved.
13. WHEN clicked, THE system SHALL create a draft email only (never auto-send) and display a confirmation toast.

---

## 7. Interaction Patterns and Micro-Interactions

### 7.1 Loading States

1. WHEN any module is fetching data, THE application SHALL display a **skeleton loader** (shimmer effect) matching the layout of the expected content.
2. THE application SHALL NOT display blank screens or raw spinners as the sole loading indicator.
3. Skeleton loaders SHALL match the card layout, chart dimensions, and metrics bar structure of the expected content.
4. Loading duration exceeding 5 seconds SHALL trigger a subtle "Taking longer than expected..." message below the skeleton.

### 7.2 Empty States

1. WHEN a module has no data to display (e.g., no reviews match filters), THE application SHALL display:
   - A contextual illustration or icon (muted, on-brand)
   - A descriptive message explaining why no data is shown
   - A suggested action (e.g., "Try adjusting your filters", "Sync reviews to get started", "Import a CSV to bootstrap data")
2. Empty state messages SHALL be centered within the content area.

### 7.3 Error States

1. WHEN an API call fails, THE application SHALL display an **inline error message** within the affected module (NOT a full-page error).
2. THE error message SHALL include:
   - A brief description of what went wrong
   - A **"Retry"** button to reattempt the operation
3. WHEN the CRON sync fails, THE Context Bar SHALL display a warning indicator (amber dot) next to the sync button, showing the last successful sync timestamp on hover/tap.
4. WHEN the Gemini AI API fails during categorization, affected review cards SHALL show an "Uncategorized" badge instead of sentiment/category tags, with a "Retry categorization" action.

### 7.4 Approval Gate Pattern

See Section 5.6 for the full Approval Gate component specification.

### 7.5 Toast Notifications

1. THE application SHALL use toast notifications for transient success/error messages:
   - Success: Green left-border accent, checkmark icon
   - Error: Red left-border accent, alert icon
   - Info: Blue left-border accent, info icon
2. Toasts SHALL auto-dismiss after **5 seconds** with an option to manually dismiss (X button).
3. Toasts SHALL appear at the **top-right on desktop** and **top-center on mobile**.
4. Multiple toasts SHALL stack vertically with 8dp spacing.
5. Examples of toast messages:
   - "Jira ticket GROW-1234 created successfully"
   - "CSV import complete: 847 reviews imported, 12 skipped"
   - "Morning Brew draft saved to outbox"
   - "Sync failed — last successful sync: 2 hours ago"

### 7.6 Transitions and Animations

1. Page transitions SHALL use a subtle fade-in (200ms ease-in-out).
2. Modal open/close SHALL use a scale + fade animation (200ms).
3. Tab switching SHALL NOT trigger a full page reload — content SHALL transition smoothly.
4. Card expand/collapse SHALL use a slide-down animation (200ms ease-out).
5. Filter application SHALL trigger a brief skeleton flash (300ms) before rendering updated data.

---

## 8. Accessibility Requirements

1. ALL interactive elements SHALL be keyboard-navigable (Tab to focus, Enter to activate, Escape to dismiss modals).
2. ALL images and icons SHALL have appropriate `alt` text or `aria-label` attributes.
3. THE application SHALL support screen reader navigation with proper semantic HTML structure (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`) and ARIA landmarks.
4. Focus indicators SHALL be clearly visible on all interactive elements (2px outline in accent color).
5. Color SHALL NOT be the sole means of conveying information:
   - Sentiment badges SHALL include text labels ("Positive", "Negative", "Neutral") alongside color coding.
   - Star ratings SHALL include numeric labels alongside star icons.
   - NPS score SHALL include the numeric value alongside any color coding.
6. Modals SHALL trap focus within the modal when open and return focus to the trigger element when closed.
7. All form inputs SHALL have associated `<label>` elements or `aria-label` attributes.
8. THE application SHALL maintain a logical tab order that follows the visual layout.

---

## 9. Design Token Summary (CSS Variables)

```css
:root {
  /* Typography */
  --font-family: 'Inter', sans-serif;
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.25rem;    /* 20px */
  --font-size-xl: 1.5rem;     /* 24px */

  /* Spacing */
  --spacing-xs: 0.25rem;      /* 4px */
  --spacing-sm: 0.5rem;       /* 8px */
  --spacing-md: 1rem;         /* 16px */
  --spacing-lg: 1.5rem;       /* 24px */
  --spacing-xl: 2rem;         /* 32px */

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;      /* pills */

  /* Groww Brand */
  --color-groww-green: #00D09C;
  --color-groww-blue: #5367FF;
  --color-accent: #00D09C;

  /* Sentiment */
  --color-positive: #00D09C;
  --color-neutral: #A0AEC0;
  --color-negative: #F56565;

  /* Star Ratings */
  --color-star-5: #00D09C;
  --color-star-4: #5367FF;
  --color-star-3: #A0AEC0;
  --color-star-2: #ED8936;
  --color-star-1: #F56565;
}

/* Light Mode */
[data-theme="light"] {
  --bg-main: #F8F9FA;
  --bg-card: #FFFFFF;
  --text-primary: #1A1A2E;
  --text-secondary: #666666;
  --border-color: #E2E8F0;
}

/* Dark Mode */
[data-theme="dark"] {
  --bg-main: #0D1117;
  --bg-card: #161B22;
  --text-primary: #E6EDF3;
  --text-secondary: #8B949E;
  --border-color: #21262D;
}
```
