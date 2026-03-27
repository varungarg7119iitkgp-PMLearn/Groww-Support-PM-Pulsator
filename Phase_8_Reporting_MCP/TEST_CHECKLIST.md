# Phase 8 Test Checklist

## A. Reporting Generator
- [ ] Open `/reporting`
- [ ] Select platform + time period filter
- [ ] Click **Generate Weekly Pulse**
- [ ] Verify metrics render (total/avg/NPS)
- [ ] Verify top bugs section has max 3 items
- [ ] Verify top feature ideas section has max 3 items
- [ ] Verify executive pulse and top actions populate
- [ ] Verify app link appears in Morning Brew panel

## B. Approval Gate
- [ ] Confirm external actions are disabled before approval
- [ ] Check approval checkbox
- [ ] Confirm external action buttons are enabled after approval

## C. Jira Integration
Prereq: valid `JIRA_*` env vars
- [ ] Click **Push Top Bugs to Jira**
- [ ] Verify success message with issue keys
- [ ] Open Jira and confirm created issues include summary/description/labels

## D. Confluence Integration
Prereq: valid `CONFLUENCE_*` env vars
- [ ] Click **Create Confluence Spec**
- [ ] Verify success message with page URL
- [ ] Open Confluence and confirm page content sections:
  - Weekly Pulse
  - Top Bugs
  - Top Feature Ideas
  - Action List

## E. SMTP Morning Brew
Prereq: valid SMTP vars
- [ ] Enter 1-2 test emails
- [ ] Click **Trigger Morning Brew**
- [ ] Verify success toast/status
- [ ] Verify recipients receive email with:
  - Summary
  - Top Bugs
  - Top Feature Ideas
  - Application link

## F. Error Handling
- [ ] Remove Jira env vars and verify graceful config error
- [ ] Remove Confluence env vars and verify graceful config error
- [ ] Remove SMTP env vars and verify graceful config error
- [ ] Ensure page remains usable after each error

## G. Regression
- [ ] Filters still work on Reviews/Analytics/Categories/Word Cloud
- [ ] Mobile navigation still works
- [ ] Build passes (`next build`)
- [ ] Lint diagnostics clean for touched files
