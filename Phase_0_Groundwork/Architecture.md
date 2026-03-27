# Groww Support PM Pulsator — Architecture Document

---

## 1. Introduction

The **Groww Support PM Pulsator** is an AI-powered internal platform built for Groww's Product and Support teams. It ingests public app reviews from the Google Play Store and Apple App Store, categorizes them using AI (Google Gemini), performs sentiment analysis, and transforms raw qualitative feedback into structured themes, actionable insights, and Jira tickets.

The platform features an Automated Workflow Engine that produces executive "Morning Brew" email drafts, standardized fee explainers, and approval-gated actions, ensuring a human-in-the-loop for all external outputs.

**Target Users**: Product Managers, Support Agents, Leadership/Executives, and Evaluators who need to monitor app health, triage user feedback, and act on insights without manual data wrangling.

**Access Model**: No authentication — the application is accessible via its Vercel URL to anyone with the link.

**Live URL**: [https://groww-support-pm-pulsator.vercel.app](https://groww-support-pm-pulsator.vercel.app)

**Groww App References**:
- Google Play Store: [com.nextbillion.groww](https://play.google.com/store/apps/details?id=com.nextbillion.groww&hl=en_IN)
- Apple App Store: [Groww Stocks, Mutual Fund, IPO](https://apps.apple.com/in/app/groww-stocks-mutual-fund-ipo/id1404871703)

**Brand Colors**: Groww Green (`#00D09C`) as primary accent, Groww Blue (`#5367FF`) as secondary accent.

---

## 2. Glossary

| Term | Definition |
|---|---|
| **Review_Scanner** | The core platform system responsible for ingesting, processing, and displaying app reviews. |
| **AI_Categorizer** | The AI subsystem (Google Gemini) that assigns sentiment labels and category tags to each review. |
| **Review_Hub** | The dashboard module displaying raw review data, rating distributions, and triage tools. |
| **Analytics_Engine** | The module responsible for computing metrics, category distributions, and trend analysis. |
| **Testimonials_Module** | The module that generates word clouds, top word lists, and surfaces top upvoted reviews. |
| **Ideation_Engine** | The module that analyzes negative reviews to suggest product improvements and generate bug reports. |
| **Workflow_Engine** | The subsystem that orchestrates Weekly Pulse generation, Fee Explainer generation, Morning Brew email drafting, and approval-gated actions. |
| **MCP_Gateway** | The integration layer that executes approval-gated external actions (Jira ticket creation, document appending, email drafting). |
| **Approval_Gate** | A UI control that blocks any external action until a user explicitly clicks "Approve." |
| **PII_Sanitizer** | The preprocessing subsystem that strips all Personally Identifiable Information from review data before rendering or report generation. |
| **NPS** | Net Promoter Score — calculated as %Promoters (4–5 stars) minus %Detractors (1–2 stars). |
| **Weekly_Pulse** | An AI-generated ≤250-word summary grouping reviews into max 5 themes with quotes and action ideas. |
| **Fee_Explainer** | A structured, neutral explanation of a fee scenario in ≤6 bullet points with official source links. |
| **Morning_Brew** | An executive email draft combining the Weekly Pulse and macro app health metrics. |
| **CSV_Uploader** | The utility for manually uploading historical review data (covering 8–12 weeks). |
| **Global_Filter** | The persistent filtering controls for Platform, Time Period, and App/Bundle ID. |

---

## 3. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 16+ (App Router) | Best Vercel integration, SSR support, API routes built-in |
| **Deployment** | Vercel | Auto-deploys on push to `main`, serverless functions, CRON support |
| **Styling** | Tailwind CSS + CSS variables | Utility-first, native dark mode support, design token system |
| **UI Components** | shadcn/ui | Accessible, themeable, production-ready, Tailwind-native |
| **Database** | Supabase (PostgreSQL) | Managed, 500MB free tier, dashboard UI, Row Level Security if needed later |
| **AI/LLM** | Google Gemini | gemini-2.0-flash for categorization (fast, cheap), gemini-2.0-pro for generation tasks |
| **Charts** | Recharts | React-native charting library, responsive, dark mode friendly |
| **Word Cloud** | react-wordcloud / d3-cloud | Customizable, interactive word cloud rendering |
| **CRON** | Vercel CRON (`vercel.json`) | Native integration, configurable schedule, no extra infrastructure |
| **App Store Data** | google-play-scraper + app-store-scraper (npm) | Proven packages for fetching public review data |
| **Email** | Nodemailer via SMTP or Resend API | Draft-only email creation for Morning Brew |
| **Jira** | Jira REST API v3 | Direct HTTP calls for ticket creation |
| **State Management** | React Context + SWR | Context for global filters/theme, SWR for server state caching |
| **Language** | TypeScript | Type safety across the full stack |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
│                   Next.js App (Vercel)                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │   Apps    │ │ Reviews  │ │Analytics │ │Categories│ │Word Cloud│ │
│  │  (Home)  │ │  (Hub)   │ │          │ │          │ │          │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│  ┌──────────┐                                                       │
│  │Reporting │                                                       │
│  └──────────┘                                                       │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER                                   │
│                  Next.js API Routes (Serverless)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ /api/    │ │ /api/ai/ │ │/api/jira/│ │/api/email│              │
│  │ reviews/ │ │          │ │          │ │          │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│  ┌──────────┐ ┌──────────┐                                         │
│  │/api/     │ │/api/cron/│                                         │
│  │upload/   │ │          │                                         │
│  └──────────┘ └──────────┘                                         │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│    AI LAYER      │ │  DATA LAYER  │ │ EXTERNAL APIs    │
│                  │ │              │ │                  │
│ Google Gemini    │ │  Supabase    │ │ Play Store API   │
│ PII Sanitizer    │ │  PostgreSQL  │ │ App Store API    │
│ AI Categorizer   │ │              │ │ Jira REST API    │
│                  │ │              │ │ SMTP / Resend    │
└──────────────────┘ └──────────────┘ └──────────────────┘
```

### Data Flow Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Ingest  │───▶│   PII    │───▶│  Store   │───▶│    AI    │───▶│Dashboard │
│ (CRON/   │    │Sanitizer │    │(Supabase)│    │Categorize│    │ Render   │
│  CSV)    │    │          │    │          │    │(Gemini)  │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

1. **Ingestion**: Reviews arrive via daily CRON (Play Store + App Store APIs) or manual CSV upload.
2. **PII Sanitization**: Every review passes through the PII Sanitizer before storage. Emails, phone numbers, addresses, and government IDs are redacted.
3. **Storage**: Sanitized reviews are stored in Supabase PostgreSQL with full metadata.
4. **AI Categorization**: Reviews are batched and sent to Google Gemini for sentiment labeling (Positive/Negative/Neutral) and category tagging. Processing is asynchronous — ingestion is never blocked.
5. **Dashboard Rendering**: All modules (Review Hub, Analytics, Categories, Word Cloud, Reporting) query the database with active Global Filter criteria and render processed data.

---

## 5. Data Model

### 5.1 Tables

**apps**
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| name | VARCHAR | App display name |
| android_bundle_id | VARCHAR | Google Play bundle ID |
| ios_bundle_id | VARCHAR | Apple App Store bundle ID |
| last_android_sync | TIMESTAMP | Last successful Android sync |
| last_ios_sync | TIMESTAMP | Last successful iOS sync |
| created_at | TIMESTAMP | Record creation time |

**reviews**
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| app_id | UUID (FK → apps) | Parent app reference |
| platform_review_id | VARCHAR | Unique ID from the store (for duplicate detection) |
| platform | VARCHAR | "android" or "ios" |
| author_name | VARCHAR | Reviewer display name |
| star_rating | INTEGER | 1–5 |
| review_text | TEXT | Original review text (PII-sanitized) |
| sanitized_text | TEXT | Processed text used for AI and display |
| sentiment | VARCHAR | "positive", "negative", "neutral", or "uncategorized" |
| device_info | VARCHAR | Device name/model |
| app_version | VARCHAR | App version at time of review |
| os_version | VARCHAR | Device OS version |
| upvote_count | INTEGER | Helpfulness/upvote count from store (nullable) |
| review_date | DATE | Date the review was written |
| ingested_at | TIMESTAMP | When the platform ingested this review |

**categories**
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| name | VARCHAR | Display name (e.g., "Login Issues") |
| slug | VARCHAR | URL-safe identifier (e.g., "login-issues") |

**review_categories** (junction table)
| Column | Type | Notes |
|---|---|---|
| review_id | UUID (FK → reviews) | |
| category_id | UUID (FK → categories) | |
| (PK) | Composite | review_id + category_id |

**ai_replies**
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| review_id | UUID (FK → reviews) | Source review |
| tone | VARCHAR | "empathetic", "professional", or "gratitude" |
| reply_text | TEXT | Generated reply content |
| created_at | TIMESTAMP | Generation time |

**weekly_pulses**
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| app_id | UUID (FK → apps) | Target app |
| pulse_content | TEXT | Full pulse text (≤250 words) |
| themes | JSONB | Array of theme objects with names and counts |
| quotes | JSONB | Array of 3 verbatim quotes |
| action_ideas | JSONB | Array of 3 improvement ideas |
| status | VARCHAR | "draft", "approved", "rejected" |
| generated_at | TIMESTAMP | Generation time |
| approved_at | TIMESTAMP | Approval time (nullable) |

**fee_explainers**
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| scenario | VARCHAR | Fee scenario name |
| bullets | JSONB | Array of ≤6 explanation bullet points |
| source_links | JSONB | Array of 2 official source URLs |
| status | VARCHAR | "draft", "approved", "rejected" |
| last_checked | DATE | Generation date (YYYY-MM-DD) |
| generated_at | TIMESTAMP | Generation time |

**sync_logs**
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| app_id | UUID (FK → apps) | Target app |
| platform | VARCHAR | "android" or "ios" |
| status | VARCHAR | "running", "success", "failed" |
| reviews_fetched | INTEGER | Count of new reviews fetched |
| error_message | TEXT | Error details if failed (nullable) |
| retry_count | INTEGER | Number of retries attempted |
| started_at | TIMESTAMP | Sync start time |
| completed_at | TIMESTAMP | Sync completion time (nullable) |

### 5.2 Indexes

- `reviews(app_id, platform, review_date)` — Primary query pattern for filtered dashboards
- `reviews(platform_review_id, platform)` — Duplicate detection during ingestion
- `reviews(sentiment)` — Sentiment-based filtering
- `reviews(star_rating)` — Rating distribution queries
- `review_categories(review_id)` — Category lookups per review
- `review_categories(category_id)` — Reviews per category
- `sync_logs(app_id, started_at)` — Recent sync status lookups

---

## 6. Complete Requirements Specification

### Requirement 1: Data Ingestion — Automated Daily CRON Pipeline

**User Story:** As a Product Manager, I want the platform to automatically download, chunk, and store app reviews from the Google Play Store and Apple App Store every day via a CRON job, so that the dashboard always has fresh data without any manual intervention.

**Acceptance Criteria:**

1. THE Review_Scanner SHALL execute a daily CRON job that fetches new reviews from the Google Play Store API and the Apple App Store API.
2. WHEN the CRON job runs, THE Review_Scanner SHALL download all new reviews since the last successful sync, chunk them into processable batches, and store each review with the following fields: author name, star rating, review text, date, platform (Android/iOS), device info, app version, and OS version.
3. WHEN reviews are stored, THE Review_Scanner SHALL pass each batch to the LLM for ingestion, categorization, and preparation for dashboard rendering.
4. WHEN a review has already been ingested (duplicate detection by platform + review ID), THE Review_Scanner SHALL skip the duplicate and not create a second record.
5. IF the App Store API or Google Play API returns an error or is unreachable during the CRON run, THEN THE Review_Scanner SHALL log the error with timestamp and API name, and retry the fetch up to 3 times with exponential backoff before marking the sync cycle as failed.
6. WHEN a sync cycle fails after all retries, THE Review_Scanner SHALL display a warning indicator on the dashboard showing the last successful sync timestamp.
7. THE Review_Scanner SHALL allow configuration of the CRON schedule (default: once daily) without requiring code changes.

**Implementation Notes:**
- Vercel CRON via `vercel.json` with configurable cron expression
- `google-play-scraper` and `app-store-scraper` npm packages
- Retry logic: 3 attempts with delays of 1s, 4s, 16s (exponential backoff)
- Sync status stored in `sync_logs` table

---

### Requirement 2: Data Ingestion — CSV Upload (Historical Bootstrap)

**User Story:** As a Product Manager, I want to upload a CSV file of historical reviews (covering the last 8–12 weeks) as a one-time bootstrap, so that the platform has past data for trend analysis from day one.

**Acceptance Criteria:**

1. WHEN a user uploads a CSV file, THE CSV_Uploader SHALL validate that the file contains the required columns: author name, star rating, review text, date, platform, and app version.
2. WHEN the CSV file is valid, THE CSV_Uploader SHALL present a header mapping interface allowing the user to map CSV columns to the internal schema fields (Rating, Date, Body, OS, Version, Platform, Author), then parse and ingest all rows, applying the same duplicate detection logic as the automated CRON pipeline.
3. IF the CSV file contains rows with missing required fields, THEN THE CSV_Uploader SHALL skip those rows, log them as errors, and display a summary showing the count of successfully imported rows and the count of skipped rows with reasons.
4. IF the uploaded file is not a valid CSV or exceeds the maximum allowed size (50 MB), THEN THE CSV_Uploader SHALL reject the upload and display a descriptive error message indicating the reason for rejection.
5. WHEN CSV ingestion completes, THE CSV_Uploader SHALL pass the ingested reviews to the LLM for categorization and dashboard preparation, following the same pipeline as the daily CRON.

**Implementation Notes:**
- Client-side file validation (type, size) before upload
- Server-side parsing with `papaparse`
- Multi-step modal UI: Upload → Map Headers → Validate → Confirm → Summary

---

### Requirement 3: PII Sanitization

**User Story:** As a Product Manager, I want all Personally Identifiable Information stripped from reviews before they appear on dashboards or in reports, so that the platform complies with data privacy standards.

**Acceptance Criteria:**

1. WHEN reviews are ingested (from API or CSV), THE PII_Sanitizer SHALL scan each review text for PII patterns including email addresses, phone numbers, physical addresses, and government ID numbers.
2. WHEN PII is detected in a review text, THE PII_Sanitizer SHALL replace each PII instance with a redaction placeholder (e.g., `[REDACTED_EMAIL]`, `[REDACTED_PHONE]`) before storing the review.
3. THE PII_Sanitizer SHALL process every review before the review is made available to any dashboard, report, or AI generation module.
4. WHEN generating any output (Weekly Pulse, Fee Explainer, Morning Brew, AI Reply, Bug Report), THE Workflow_Engine SHALL verify that the output contains no PII before presenting it to the user.

**Implementation Notes:**
- Regex-based detection patterns for emails, phone numbers (Indian + international formats), Aadhaar numbers, PAN numbers, physical addresses
- Runs synchronously during ingestion pipeline before database insert
- Secondary PII check on all AI-generated outputs before rendering

---

### Requirement 4: Global Filtering

**User Story:** As a Product Manager, I want to filter the entire dashboard by date range, platform, and app/bundle ID, so that I can isolate feedback to specific releases or operating systems.

**Acceptance Criteria:**

1. THE Global_Filter SHALL provide filter controls for: Platform (All, Android, iOS), Time Period (Today, Yesterday, Last 7 Days, Last 15 Days, Last 30 Days, Custom date range), and App/Bundle ID.
2. WHEN a user changes any filter value, THE Review_Scanner SHALL update all dashboard modules (Review Hub, Analytics, Testimonials, Ideation) to reflect only the reviews matching the active filter criteria.
3. WHEN the "Custom" time period is selected, THE Global_Filter SHALL display a date range picker allowing the user to select a start date and end date.
4. IF the user selects a custom date range where the start date is after the end date, THEN THE Global_Filter SHALL display a validation error and not apply the filter.
5. THE Global_Filter SHALL persist the active filter state across page navigations within the same session so that the user does not lose context when switching between modules.

**Implementation Notes:**
- React Context (`FilterContext`) shared across all pages
- Filter state stored in URL search params for shareability and session persistence
- All data-fetching hooks accept filter params and pass them to Supabase queries

---

### Requirement 5: UI Theming

**User Story:** As a user, I want to toggle between Light and Dark UI modes, so that I can use the platform comfortably in different lighting conditions.

**Acceptance Criteria:**

1. WHEN the application loads for the first time, THE Review_Scanner SHALL inherit the user's operating system theme preference (light or dark) as the default.
2. THE Review_Scanner SHALL provide a global toggle control to switch between Light mode and Dark mode, overriding the system default.
3. WHEN the user toggles the theme, THE Review_Scanner SHALL immediately apply the selected theme to all UI components without requiring a page reload.
4. THE Review_Scanner SHALL persist the user's theme preference across sessions using local storage or equivalent client-side persistence.

**Implementation Notes:**
- Tailwind CSS `darkMode: 'class'` strategy
- `next-themes` package for system preference detection + localStorage persistence
- CSS variables for theme tokens defined in `globals.css`

---

### Requirement 6: Review Hub — Rating Distribution & NPS

**User Story:** As a Product Manager, I want to see a visual histogram of review counts by star rating and an automated NPS calculation, so that I can quickly gauge overall app health for the filtered period.

**Acceptance Criteria:**

1. WHEN the Review Hub is displayed, THE Review_Hub SHALL render a histogram showing the count of reviews for each star rating (1 through 5) based on the active Global_Filter criteria.
2. THE Review_Hub SHALL calculate and display the Net Promoter Score (NPS) for the filtered reviews using the formula: NPS = %Promoters (4–5 stars) minus %Detractors (1–2 stars).
3. THE Review_Hub SHALL support expanding individual star rating buckets so that clicking on a star rating bar reveals the review cards within that bucket.
4. WHEN the filtered review set is empty, THE Review_Hub SHALL display the histogram with zero counts and show NPS as "N/A" with a message indicating no reviews match the current filters.

---

### Requirement 7: Review Hub — Review Cards

**User Story:** As a Product Manager, I want to see individual review cards with all relevant metadata and AI-generated tags, so that I can quickly triage and understand each piece of feedback.

**Acceptance Criteria:**

1. THE Review_Hub SHALL display each review as a card containing: Author Name, Star Rating, Date, Platform badge (Android/iOS), Device/App OS Info, AI Sentiment badge (Positive/Negative/Neutral), and AI Category tags.
2. WHEN reviews are loaded, THE AI_Categorizer SHALL assign a sentiment label (Positive, Negative, or Neutral) and one or more category tags (e.g., "Login Issues", "KYC", "Payments", "App Crash", "UI/UX") to each review.
3. THE Review_Hub SHALL support pagination or infinite scroll to handle large volumes of reviews without degrading page performance.
4. WHEN a user clicks on a category tag on a review card, THE Review_Hub SHALL filter the displayed reviews to show only reviews matching that category.
5. THE Review_Hub SHALL provide a "Find Similar Reviews" action on each review card that, when triggered, opens a search pre-populated with AI-extracted keywords from that review, allowing the user to discover reviews with similar themes.

---

### Requirement 8: AI Reply Generator

**User Story:** As a Support Agent, I want to click a button on a review card to generate an AI-drafted response with adjustable tone, so that I can quickly reply to users with a standardized, empathetic message.

**Acceptance Criteria:**

1. WHEN a user clicks the "Generate Reply" button on a review card, THE Review_Hub SHALL invoke the AI to generate a contextual response based on the review text, star rating, and category.
2. THE Review_Hub SHALL provide tone adjustment toggles (Empathetic, Professional, Gratitude) that the user can select before or after generating the reply.
3. WHEN a tone toggle is changed after a reply has been generated, THE Review_Hub SHALL regenerate the reply using the newly selected tone.
4. THE Review_Hub SHALL display the generated reply in an editable text area so the user can modify it before copying or using it.
5. IF the AI fails to generate a reply (e.g., API timeout or model error), THEN THE Review_Hub SHALL display an error message and offer a "Retry" button.

**Implementation Notes:**
- Google Gemini (gemini-2.0-pro) for nuanced, tone-aware reply generation
- Prompt includes review text, star rating, detected categories, and selected tone
- Generated reply stored in `ai_replies` table for reuse

---

### Requirement 9: Analytics — Top-Level Metrics

**User Story:** As a Product Manager, I want to see total reviews, average rating, and positive vs. negative breakdown at a glance, so that I can quickly assess the state of user feedback.

**Acceptance Criteria:**

1. WHEN the Analytics module is displayed, THE Analytics_Engine SHALL compute and display: Total Reviews count, Average Rating (to one decimal place), Positive review count and percentage, Negative review count and percentage, and Neutral review count and percentage, all based on the active Global_Filter criteria.
2. WHEN the filtered review set is empty, THE Analytics_Engine SHALL display all metrics as zero or "N/A" with an appropriate empty state message.

---

### Requirement 10: Analytics — Category Distribution

**User Story:** As a Product Manager, I want to see a bar chart of review volumes across AI-identified themes, so that I can identify which areas of the product receive the most feedback.

**Acceptance Criteria:**

1. WHEN the Analytics module is displayed, THE Analytics_Engine SHALL render a bar chart showing the count of reviews for each AI-identified category based on the active Global_Filter criteria.
2. WHEN a user clicks on a bar in the chart, THE Analytics_Engine SHALL navigate to or filter the Review Hub to show only reviews in that category.

---

### Requirement 11: Analytics — Category Stats List

**User Story:** As a Product Manager, I want a clickable list of categories with absolute counts and percentages, so that I can drill down into specific themes.

**Acceptance Criteria:**

1. THE Analytics_Engine SHALL display a list of all AI-identified categories with the absolute review count and percentage of total reviews for each category.
2. WHEN a user clicks on a category in the list, THE Analytics_Engine SHALL navigate to or filter the Review Hub to display only reviews matching that category.

---

### Requirement 12: Analytics — Trend Analysis

**User Story:** As a Product Manager, I want to view a time-series line chart of category trends, so that I can spot sudden friction spikes correlated with releases or deployments.

**Acceptance Criteria:**

1. WHEN the Analytics module is displayed, THE Analytics_Engine SHALL render a time-series line chart showing review volume per category over the selected time period.
2. THE Analytics_Engine SHALL allow the user to select which categories to display on the trend chart via checkboxes or a multi-select control.
3. WHEN hovering over a data point on the trend chart, THE Analytics_Engine SHALL display a tooltip showing the exact date, category name, and review count.

---

### Requirement 13: Customer Testimonials — Dynamic Word Cloud

**User Story:** As a Product Manager, I want to see a visual word cloud of frequently used terms in reviews (excluding stop words), so that I can quickly identify dominant themes and language patterns.

**Acceptance Criteria:**

1. WHEN the Testimonials module is displayed, THE Testimonials_Module SHALL generate and render a dynamic word cloud from the filtered review texts, excluding common stop words.
2. THE Testimonials_Module SHALL display metrics for Total Reviews analyzed, Total Words analyzed, and Unique Words identified alongside the word cloud.
3. WHEN a user clicks on a word in the word cloud, THE Testimonials_Module SHALL filter the Review Hub to show reviews containing that word.

---

### Requirement 14: Customer Testimonials — Top Words List

**User Story:** As a Product Manager, I want a ranked list of keywords with exact occurrence counts, so that I can quantify the most common terms in user feedback.

**Acceptance Criteria:**

1. THE Testimonials_Module SHALL display a ranked list of the top keywords (configurable, default top 20) with their exact occurrence counts, sorted in descending order by frequency.
2. WHEN a user clicks on a keyword in the list, THE Testimonials_Module SHALL filter the Review Hub to show reviews containing that keyword.

---

### Requirement 15: Customer Testimonials — Top Upvoted Reviews

**User Story:** As a Product Manager, I want to see the most upvoted or "helpful" reviews, so that I can surface the voice of the customer that resonates most with other users.

**Acceptance Criteria:**

1. THE Testimonials_Module SHALL display a feed of the top upvoted (most "helpful") reviews based on the upvote/helpful count from the app stores, filtered by the active Global_Filter criteria.
2. WHEN the upvote data is not available for a review, THE Testimonials_Module SHALL exclude that review from the top upvoted feed rather than displaying it with a zero count.

---

### Requirement 16: Ideation — LLM Idea Recommender

**User Story:** As a Product Manager, I want the AI to analyze filtered negative reviews and suggest product improvements, so that I can turn user pain points into actionable feature ideas.

**Acceptance Criteria:**

1. WHEN a user triggers the Idea Recommender, THE Ideation_Engine SHALL analyze all negative-sentiment reviews matching the active Global_Filter criteria and generate a list of product improvement suggestions.
2. THE Ideation_Engine SHALL group similar complaints and present each suggestion with a brief rationale citing the volume and nature of related reviews.
3. IF the filtered set contains no negative reviews, THEN THE Ideation_Engine SHALL display a message indicating there are no negative reviews to analyze.

**Implementation Notes:**
- Google Gemini (gemini-2.0-pro) processes aggregated negative review data
- Prompt instructs grouping by theme, citing review counts, and generating actionable suggestions

---

### Requirement 17: Ideation — Bug Reporter & Jira Integration

**User Story:** As a Product Manager, I want to select a cluster of similar negative reviews and generate a structured Jira bug ticket, so that engineering gets a fully contextualized bug report without manual copy-pasting.

**Acceptance Criteria:**

1. WHEN a user selects one or more negative reviews and clicks "Generate Bug Report", THE Ideation_Engine SHALL generate a structured bug report containing: a summary title, description synthesized from the selected reviews, affected App Version(s), affected OS(es), affected Platform(s), review date range, and verbatim user quotes (PII-sanitized).
2. WHEN the user clicks "Push to Jira", THE MCP_Gateway SHALL present an Approval_Gate requiring explicit user approval before executing the action.
3. WHEN the user approves the Jira push, THE MCP_Gateway SHALL create a ticket on the user-selected Jira board via the Jira API, mapping all fields from the generated bug report.
4. WHEN the Jira ticket is successfully created, THE MCP_Gateway SHALL display a confirmation with the Jira ticket ID and a direct link to the created ticket.
5. IF the Jira API returns an error, THEN THE MCP_Gateway SHALL display the error details and offer a "Retry" button without losing the generated bug report data.

**Implementation Notes:**
- Jira REST API v3 — requires Jira API token configured via environment variable
- Approval Gate implemented as a confirmation dialog with explicit "Approve" action
- Bug report fields mapped to Jira issue fields (summary, description, labels, components)

---

### Requirement 18: Weekly Pulse Generation

**User Story:** As a Product Manager, I want to trigger the Weekly Pulse generator on the accumulated review data, so that I have a summarized overview of user sentiment themes for the filtered period.

**Acceptance Criteria:**

1. WHEN a user triggers the Weekly Pulse generation, THE Workflow_Engine SHALL analyze the filtered reviews and group them into a maximum of 5 themes.
2. THE Workflow_Engine SHALL highlight the top 3 themes by review volume within the Weekly Pulse output.
3. THE Workflow_Engine SHALL extract and include exactly 3 real user quotes (verbatim, PII-sanitized) in the Weekly Pulse output.
4. THE Workflow_Engine SHALL constrain the total word count of the Weekly Pulse output to 250 words or fewer.
5. THE Workflow_Engine SHALL include exactly 3 actionable product improvement ideas in the Weekly Pulse output.
6. THE Workflow_Engine SHALL verify that the Weekly Pulse output contains absolutely no PII before presenting it to the user.
7. IF the filtered review set is too small to generate meaningful themes (fewer than 10 reviews), THEN THE Workflow_Engine SHALL display a message indicating insufficient data and not generate a Weekly Pulse.

---

### Requirement 19: Fee Explainer Generation

**User Story:** As a Support Agent, I want to select a fee scenario (e.g., Exit Load, Brokerage, Account Maintenance Charge) and generate a standardized explainer, so that I have an approved, factual reference to share with customers.

**Acceptance Criteria:**

1. WHEN a user selects a fee scenario and triggers the Fee Explainer generation, THE Workflow_Engine SHALL generate a structured explanation in 6 or fewer bullet points.
2. THE Workflow_Engine SHALL ensure the Fee Explainer uses a neutral, facts-only tone with strictly no recommendations or opinions.
3. THE Workflow_Engine SHALL include exactly 2 official source URLs in the Fee Explainer output.
4. THE Workflow_Engine SHALL append the text "Last checked: [Current Date]" at the end of the Fee Explainer output, where [Current Date] is the date of generation in YYYY-MM-DD format.
5. IF the selected fee scenario is not recognized or no data is available for it, THEN THE Workflow_Engine SHALL display an error message indicating the scenario is unsupported.

---

### Requirement 20: Approval-Gated Documentation

**User Story:** As a Product Manager, I want to review the generated Weekly Pulse and Fee Explainer and explicitly click "Approve" before the system appends the data to internal documentation, so that no unreviewed content is published.

**Acceptance Criteria:**

1. WHEN the Weekly Pulse and Fee Explainer are generated, THE Workflow_Engine SHALL display both outputs in a preview pane with "Approve" and "Reject" buttons.
2. THE Approval_Gate SHALL block all external actions (document appending, email drafting) until the user explicitly clicks "Approve."
3. WHEN the user clicks "Reject", THE Workflow_Engine SHALL discard the current generated output and allow the user to re-trigger generation.
4. WHEN the user clicks "Approve", THE MCP_Gateway SHALL append a JSON payload to the specified internal Notes/Doc containing: `{date, weekly_pulse, fee_scenario, explanation_bullets, source_links}`.
5. WHEN the document append succeeds, THE MCP_Gateway SHALL display a success confirmation with a link to the updated document.
6. IF the document append fails, THEN THE MCP_Gateway SHALL display the error details and offer a "Retry" button without losing the approved content.
7. WHEN the user has not yet clicked "Approve", THE Workflow_Engine SHALL keep the "Approve" button enabled and not auto-execute any external action.

---

### Requirement 21: Morning Brew Email Draft

**User Story:** As a Product Leader, I want a comprehensive "Morning Brew" email automatically drafted in my outbox upon PM approval, so that I can review and forward high-level insights to executives without logging into the dashboard.

**Acceptance Criteria:**

1. WHEN the user approves the Weekly Pulse and Fee Explainer via the Approval_Gate, THE MCP_Gateway SHALL create an email draft via SMTP integration.
2. THE MCP_Gateway SHALL set the email subject to exactly: "Weekly Pulse + Fee Explainer — [Date]" where [Date] is the current date in YYYY-MM-DD format.
3. THE MCP_Gateway SHALL compose the email body combining the Weekly Pulse summary, macro app health metrics (Total Reviews, Average Rating, NPS), and the Fee Explainer content.
4. THE MCP_Gateway SHALL create the email as a draft only and SHALL NOT auto-send the email under any circumstances.
5. WHEN the email draft is successfully created, THE MCP_Gateway SHALL display a confirmation message indicating the draft is ready for review in the user's outbox.
6. IF the SMTP integration fails to create the draft, THEN THE MCP_Gateway SHALL display the error details and offer a "Retry" button.

---

### Requirement 22: AI Categorization Pipeline

**User Story:** As a Product Manager, I want every ingested review to be automatically categorized by sentiment and theme, so that all downstream modules have structured data to work with.

**Acceptance Criteria:**

1. WHEN a new review is ingested (via API sync or CSV upload), THE AI_Categorizer SHALL assign a sentiment label (Positive, Negative, or Neutral) to the review.
2. WHEN a new review is ingested, THE AI_Categorizer SHALL assign one or more category tags from a predefined set (e.g., "Login Issues", "KYC", "Payments", "App Crash", "UI/UX", "Performance", "Customer Support") to the review.
3. IF the AI_Categorizer fails to process a review (e.g., model timeout), THEN THE AI_Categorizer SHALL mark the review as "Uncategorized" and log the failure for retry.
4. THE AI_Categorizer SHALL process reviews asynchronously so that ingestion is not blocked by categorization delays.

**Implementation Notes:**
- Google Gemini (gemini-2.0-flash) for high-throughput categorization
- Reviews processed in batches of 10–20 for efficiency
- Failed reviews marked as "uncategorized" with retry mechanism via background job

---

## 7. Application Screen Map

| Tab | Screen | Key Components |
|---|---|---|
| **Reviews** (Home) | Review Hub (Triage) | Global filters, rating histogram, NPS dial, review cards, AI reply, find similar |
| **Analytics** | Analytics Dashboard | Metrics bar, rating distribution, sentiment analysis, trend time-series |
| **Categories** | Category Explorer | Category bar chart, category stats list (clickable drill-down) |
| **Word Cloud** | Testimonials | Word cloud, top words list, top upvoted reviews |
| **Ideation** | Productivity Hub | AI idea recommender, bug reporter, Jira integration (approval-gated) |
| **Reporting** | Automated Workflows | Weekly Pulse panel, Fee Explainer panel, Morning Brew preview, approval gates |

---

## 8. Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| No authentication | Open-access via URL | Internal tool for a known team; simplifies architecture; auth can be added later via Supabase Auth if needed |
| Supabase over Vercel Postgres | Supabase PostgreSQL | Better free tier (500MB), built-in dashboard, real-time subscriptions for future use, RLS-ready |
| shadcn/ui over custom components | shadcn/ui + Tailwind | Production-ready, accessible, natively themed, saves weeks of UI development |
| Vercel CRON over external schedulers | Vercel CRON | Native integration, no extra infrastructure, configurable via `vercel.json` |
| Gemini Flash for categorization | gemini-2.0-flash | Cheaper and faster for high-volume, repetitive classification tasks |
| Gemini Pro for generation | gemini-2.0-pro | Better quality for nuanced tasks: reply generation, pulse writing, idea recommendation |
| Approval Gate as UI pattern | Confirmation workflow | Human-in-the-loop before any external action; no auto-execution of Jira/email/doc actions |
| SWR for server state | SWR + React Context | SWR handles caching, revalidation, and loading states; Context for cross-page filter persistence |

---

## 9. Phased Development Roadmap

### Phase 1: Foundation and Data Layer
- Next.js project scaffolding with App Router
- Tailwind CSS + CSS variables for light/dark theme system
- shadcn/ui component installation and configuration
- Global layout: fixed header, horizontal tab navigation, context bar
- Mobile-responsive bottom nav bar (breakpoint at ≤768px)
- Supabase project setup + database schema migration (all tables)
- Theme toggle (sun/moon) with OS preference detection + localStorage persistence
- Global filter context provider

### Phase 2: Data Ingestion Pipeline
- App management screen (Home) with app cards
- CSV upload modal (drag-drop, header mapping, validation summary, import confirmation)
- Google Play Store scraper integration (`google-play-scraper`)
- Apple App Store scraper integration (`app-store-scraper`)
- PII Sanitizer module (regex-based detection and redaction)
- Duplicate detection logic (platform + review_id)
- Vercel CRON job configuration for daily sync
- Sync status indicators + error logging + retry logic (3x exponential backoff)
- Sync log recording in database

### Phase 3: AI Categorization Pipeline
- Google Gemini API integration (API key via environment variables)
- Sentiment analysis prompt engineering (Positive/Negative/Neutral classification)
- Category tagging prompt engineering (predefined category set)
- Async batch processing (reviews processed in chunks of 10–20 post-ingestion)
- "Uncategorized" fallback handling on AI failure
- Retry mechanism for failed categorizations

### Phase 4: Review Hub (Triage Dashboard)
- Global filter bar (Platform pills, Quick Filter presets, Custom Date Range picker)
- Mobile filter modal (full-screen overlay at ≤768px)
- Rating distribution horizontal histogram (expandable per star bucket)
- NPS calculation engine and visualization (dial/score box)
- Review card component (full metadata + sentiment badge + category tags)
- Pagination / infinite scroll for review lists
- Click-to-filter on category tags
- "Find Similar Reviews" modal with AI-extracted keywords

### Phase 5: Analytics Layer
- Metrics bar cards (Total Reviews, Average Rating, Positive count, Negative count, Neutral count)
- Category distribution bar chart (Recharts)
- Category stats list (clickable, drill-down to Review Hub)
- Sentiment analysis bar chart
- Trend analysis time-series line chart with category multi-select
- Tooltip on hover/tap with date, category, count

### Phase 6: Customer Testimonials
- Dynamic word cloud generation from filtered reviews (stop word exclusion)
- Metrics row (Total Reviews analyzed, Total Words, Unique Words)
- Click-on-word to navigate to Review Hub filtered by that word
- Top words ranked list (configurable count, default top 20, sorted by frequency)
- Top upvoted reviews feed (ReviewCard format, ranked by upvote count)

### Phase 7: Ideation and Action Layer
- AI Reply Generator modal (tone selection, editable text area, copy button, retry on failure)
- LLM Idea Recommender (analyze negative reviews, grouped suggestions with rationale)
- Bug Reporter (multi-select negative reviews, generate structured report, editable preview)
- Jira integration (board selector, API connection, approval gate, ticket creation, confirmation with link)

### Phase 8: Automated Reporting and MCP Workflows
- Weekly Pulse generator (≤5 themes, top 3 highlighted, 3 quotes, 3 action ideas, ≤250 words, PII-verified)
- Fee Explainer generator (scenario selector, ≤6 bullets, 2 source URLs, last-checked timestamp)
- Split-view Reporting screen (Pulse left, Explainer right; stacked on mobile)
- Approval Gate UI pattern (Approve/Reject buttons, pending state, loading state, success confirmation)
- Document append API (JSON payload to internal notes/documentation)
- Morning Brew email draft (SMTP/Resend, draft-only, enforced subject format)
- Toast notifications for all async operation confirmations

---

## 10. Project File Structure

```
groww-support-pm-pulsator/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout, theme provider, global nav
│   │   ├── page.tsx                      # Home / Apps management screen
│   │   ├── reviews/
│   │   │   └── page.tsx                  # Review Hub (Triage Dashboard)
│   │   ├── analytics/
│   │   │   └── page.tsx                  # Analytics Dashboard
│   │   ├── categories/
│   │   │   └── page.tsx                  # Category Distribution Explorer
│   │   ├── word-cloud/
│   │   │   └── page.tsx                  # Word Cloud + Testimonials
│   │   ├── reporting/
│   │   │   └── page.tsx                  # Weekly Pulse + Fee Explainer + Morning Brew
│   │   └── api/
│   │       ├── reviews/                  # Review CRUD + sync endpoints
│   │       ├── ai/                       # Gemini integration endpoints
│   │       ├── jira/                     # Jira ticket creation endpoint
│   │       ├── email/                    # Morning Brew draft endpoint
│   │       ├── upload/                   # CSV upload processing endpoint
│   │       └── cron/                     # CRON job handler endpoint
│   ├── components/
│   │   ├── ui/                           # shadcn/ui base components
│   │   ├── layout/                       # Header, NavBar, BottomNav, ContextBar
│   │   ├── reviews/                      # ReviewCard, RatingHistogram, NPSDial
│   │   ├── analytics/                    # MetricsBar, CategoryChart, TrendChart
│   │   ├── testimonials/                 # WordCloud, TopWords, TopUpvoted
│   │   ├── ideation/                     # IdeaList, BugReporter, AIReplyModal
│   │   ├── reporting/                    # PulsePanel, ExplainerPanel, BrewPreview
│   │   └── shared/                       # Filters, ApprovalGate, LoadingSkeleton, EmptyState
│   ├── lib/
│   │   ├── supabase.ts                   # Supabase client initialization
│   │   ├── gemini.ts                     # Google Gemini API wrapper
│   │   ├── pii-sanitizer.ts              # PII detection + redaction logic
│   │   └── scraper.ts                    # Play Store + App Store scraper wrapper
│   ├── hooks/                            # Custom React hooks (useFilters, useTheme, useReviews, etc.)
│   ├── types/                            # TypeScript type definitions and interfaces
│   └── constants/                        # Category definitions, filter presets, fee scenarios
├── public/                               # Static assets (icons, images)
├── Phase_0_Groundwork/                   # Architecture and design documentation
│   ├── Architecture.md                   # This file
│   └── UI_UX_Specifications.md           # Visual design and interaction specs
├── vercel.json                           # CRON job configuration
├── tailwind.config.ts                    # Theme tokens, dark mode configuration
├── .env.local                            # Environment variables (API keys — never committed)
├── .gitignore                            # Git exclusion rules
└── package.json                          # Dependencies and scripts
```

---

## 11. Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `JIRA_BASE_URL` | Jira instance base URL |
| `JIRA_API_TOKEN` | Jira API authentication token |
| `JIRA_USER_EMAIL` | Jira user email for API auth |
| `SMTP_HOST` | SMTP server host for email drafts |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP authentication user |
| `SMTP_PASSWORD` | SMTP authentication password |
| `CRON_SECRET` | Secret token to authenticate CRON job requests |
