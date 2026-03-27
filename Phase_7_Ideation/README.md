# Phase 7: Ideation and Action Layer

## Scope

Phase 7 transforms raw review data into actionable outputs using AI. It provides three major features on the **Ideation** page:

### 1. AI Reply Generator
- Accessible from any review card via a "Generate Reply" button
- Generates contextual AI responses based on review text, star rating, and category
- Three tone presets: **Empathetic**, **Professional**, **Gratitude**
- Editable text area for manual tweaks before copying
- Copy-to-clipboard with confirmation toast
- Regenerate on tone change

### 2. LLM Idea Recommender
- Analyzes negative reviews matching the current Global Filter
- Groups similar complaints into product improvement themes
- Each suggestion includes rationale + estimated volume of affected reviews
- Handles empty/insufficient negative reviews gracefully (minimum 5 required)

### 3. Bug Reporter
- Select negative reviews from a curated list
- Generate a structured bug report with: summary, description, affected versions/platforms, date range, user quotes (PII-sanitized)
- Editable preview before action
- "Copy Report" button for easy sharing
- Jira integration placeholder (approval-gated, requires JIRA_* env vars)

## API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/ai/reply` | POST | Generate AI reply for a single review |
| `/api/ai/ideas` | POST | Analyze negative reviews, return improvement suggestions |
| `/api/ai/bug-report` | POST | Generate structured bug report from selected reviews |

## Components

| Component | File | Description |
|---|---|---|
| `ReplyGeneratorModal` | `src/components/ideation/reply-generator-modal.tsx` | Modal for generating and editing AI replies |
| `IdeaRecommender` | `src/components/ideation/idea-recommender.tsx` | Panel showing AI-generated product improvement ideas |
| `BugReporter` | `src/components/ideation/bug-reporter.tsx` | Multi-select reviews, generate structured bug report |
| `IdeationSkeleton` | `src/components/ideation/ideation-skeleton.tsx` | Loading state for the Ideation page |

## Key Decisions

- **No auto-execution**: All external actions (Jira) require explicit approval gate
- **Gemini 2.5 Flash** for reply generation (fast), ideas, and bug reports
- **PII re-check**: All AI outputs are scanned for PII before display
- **Rate limit awareness**: Single request per action, no batch calls for generation features
