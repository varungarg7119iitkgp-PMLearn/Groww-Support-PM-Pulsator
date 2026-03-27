# Phase 7: Ideation & Action Layer — Test Checklist

## API Tests

### POST /api/ai/reply
- [ ] Returns a reply for a positive review with "professional" tone
- [ ] Returns a reply for a negative review with "empathetic" tone
- [ ] Returns a reply with "gratitude" tone
- [ ] Fails gracefully with 400 when reviewText is missing
- [ ] Reply is under 150 words
- [ ] Reply does not contain PII or placeholder text

### POST /api/ai/ideas
- [ ] Returns 3-7 ideas when sufficient negative reviews exist
- [ ] Returns message when fewer than 5 negative reviews
- [ ] Respects platform filter
- [ ] Respects time period filter
- [ ] Each idea has title, rationale, reviewCount, recommendation
- [ ] JSON is well-formed

### POST /api/ai/bug-report
- [ ] Generates a structured bug report from 1 selected review
- [ ] Generates a report from 3+ selected reviews (synthesizes)
- [ ] Fails gracefully with 400 when no reviews provided
- [ ] Report has all required fields (title, severity, description, steps, etc.)
- [ ] Severity is one of: critical, high, medium, low
- [ ] User quotes are PII-free

## UI Tests

### Review Card — Reply Button
- [ ] "Reply" button appears on every review card on the Reviews page
- [ ] Clicking "Reply" opens the ReplyGeneratorModal
- [ ] Modal shows original review text and star rating
- [ ] 3 tone options are displayed (Empathetic, Professional, Gratitude)
- [ ] Clicking "Generate Reply" produces a reply
- [ ] Changing tone after generation regenerates
- [ ] Reply is editable in textarea
- [ ] "Copy Reply" copies to clipboard
- [ ] "Regenerate" produces a new reply
- [ ] Modal closes on X button
- [ ] Error state displays with retry option

### Ideation Page — Idea Recommender
- [ ] Page loads with "Ready to analyze" initial state
- [ ] "Generate Ideas" button triggers analysis
- [ ] Loading state shows while analyzing
- [ ] Ideas are displayed as expandable cards
- [ ] Each card shows title, review count, and expandable rationale/recommendation
- [ ] "Regenerate" button works after first generation
- [ ] Insufficient data message shown when < 5 negative reviews
- [ ] Respects global filters (platform, time period)

### Ideation Page — Bug Reporter
- [ ] Negative reviews are fetched and displayed
- [ ] Search filters the review list
- [ ] Select/Deselect All works correctly
- [ ] Individual review selection toggles correctly
- [ ] "Generate Report" is disabled when no reviews selected
- [ ] Bug report shows: title, severity badge, description, steps, expected/actual, quotes, labels
- [ ] "Copy Report" copies formatted markdown to clipboard
- [ ] "New Report" resets to review selection
- [ ] Steps to Reproduce and User Quotes sections are collapsible
- [ ] Error state displays properly

### Cross-Page Integration
- [ ] Reply modal works from Reviews page review cards
- [ ] Ideation page respects FilterBar selections
- [ ] Navigation to Ideation tab works from desktop and mobile nav

## Manual Testing Steps

1. Navigate to Reviews page → click "Reply" on any review → generate and copy a reply
2. Navigate to Ideation → click "Generate Ideas" → expand at least one idea
3. On Ideation → Bug Reporter → search, select 3 reviews → generate bug report → copy report
4. Change global filter (e.g., platform to iOS) → regenerate ideas → verify filtered results
5. Try with filters that yield < 5 negative reviews → verify graceful message
