# Phase 8: Automated Reporting and MCP Workflows

## Scope Delivered

Phase 8 introduces a full Reporting Orchestrator to generate leadership-ready insights and execute external actions with approval gates.

### 1) Weekly Pulse + Morning Brew Generation
- Endpoint: `POST /api/reporting/generate`
- Uses filtered reviews (platform/time period)
- Produces:
  - Metrics snapshot (`total`, `avg rating`, `NPS`, sentiment splits)
  - Top themes
  - Top 3 bug clusters
  - Top 3 feature ideas/suggestions
  - Executive pulse narrative (<=250 words target)
  - Top 3 recommended actions
  - HTML Morning Brew payload with deep link to application

### 2) Jira Bug Ticket Integration
- Endpoint: `POST /api/integrations/jira/issue`
- Creates Jira issues via REST API v3
- Configurable with env vars (`JIRA_*`)
- Reporting UI pushes top bug clusters to Jira after explicit approval

### 3) Confluence Spec Creation
- Endpoint: `POST /api/integrations/confluence/page`
- Creates Confluence page in configured space
- Includes executive summary, top bugs, top features, and action list
- Optional parent page support

### 4) SMTP Morning Brew Dispatch
- Endpoint: `POST /api/reporting/send-mail`
- Sends Morning Brew email to selected recipients
- Uses Nodemailer and SMTP credentials
- Triggered only after approval gate in Reporting UI

### 5) Approval Gate (Human-in-the-loop)
- Implemented in `ReportingWorkflow` UI
- External actions disabled until explicit approval checkbox is enabled

## New Files

- `src/app/api/reporting/generate/route.ts`
- `src/app/api/reporting/send-mail/route.ts`
- `src/app/api/integrations/jira/issue/route.ts`
- `src/app/api/integrations/confluence/page/route.ts`
- `src/components/reporting/reporting-workflow.tsx`
- `src/app/reporting/page.tsx` (wired)
- `Phase_8_Reporting_MCP/README.md`
- `Phase_8_Reporting_MCP/TEST_CHECKLIST.md`

## Environment Variables Required

- Jira: `JIRA_BASE_URL`, `JIRA_USER_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY`
- Confluence: `CONFLUENCE_BASE_URL`, `CONFLUENCE_USER_EMAIL`, `CONFLUENCE_API_TOKEN`, `CONFLUENCE_SPACE_KEY`, `CONFLUENCE_PARENT_PAGE_ID` (optional)
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- App URL: `NEXT_PUBLIC_APP_URL`

## Notes

- The reporting generator explicitly includes top bug clusters + top feature suggestions as requested.
- Feature-request signals are included for ideation synthesis.
- This is approval-gated and intentionally avoids auto-triggering any external side effects.
