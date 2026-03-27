# Phase 1: Foundation and Data Layer

## Objective

Establish the complete structural foundation of the Groww Support PM Pulsator — project scaffolding, design system, responsive layout, navigation, theme system, database schema, and global filter architecture. By the end of Phase 1, the application shell is fully functional with all navigation working, theme toggling operational, and the database schema ready for data ingestion in Phase 2.

## Deliverables

### 1. Next.js Project Scaffolding
- Next.js 14+ with App Router and TypeScript
- Tailwind CSS with CSS variable-based design tokens
- shadcn/ui component library installed and configured
- Project file structure matching the Architecture document

### 2. Design System and Theming
- Light and Dark mode with full color palettes
- OS preference detection on first load
- Manual sun/moon toggle in the Context Bar
- Theme preference persisted via localStorage
- All CSS design tokens from UI/UX Specifications implemented

### 3. Global Layout
- Fixed top header with app name and Context Bar
- Desktop: Horizontal pill-style tab navigation (Apps | Reviews | Analytics | Categories | Word Cloud | Reporting)
- Mobile (<=768px): Fixed bottom navigation bar with consolidated tabs (Insights merges Analytics + Categories + Word Cloud)
- Responsive breakpoints: Mobile (<=480px), Tablet (<=768px), Desktop (>=1024px)

### 4. Context Bar
- App selector dropdown (placeholder — no apps yet)
- Platform toggle pills (Android / iOS)
- Manual sync button (placeholder — disabled, wired in Phase 2)
- Theme toggle (sun/moon icon switch)

### 5. Global Filter System
- React Context provider for filter state
- Platform filter (All / Android / iOS)
- Time period quick filters (Today, Yesterday, Last 7/15/30 Days)
- Custom date range picker (From / To)
- Filter state persisted in URL search params
- Filter state shared across all pages via Context
- Mobile: Filter bar collapses to filter icon opening full-screen modal

### 6. Page Stubs
- All 6 tab pages created with placeholder content
- Each page wrapped in the global layout with active tab indication
- Empty state messages displayed on each page

### 7. Database Schema
- SQL migration files for all tables: apps, reviews, categories, review_categories, ai_replies, weekly_pulses, fee_explainers, sync_logs
- All indexes defined
- Supabase client library configured (connection via env vars)

## Test Criteria

- [ ] Application loads without errors on localhost
- [ ] All 6 navigation tabs are clickable and render their respective pages
- [ ] Active tab is visually highlighted (pill style with accent color)
- [ ] Theme toggle switches between light and dark mode instantly
- [ ] Theme persists after page refresh
- [ ] OS preference is detected on first load (no prior localStorage)
- [ ] Mobile (<=768px): Bottom nav bar appears, top tab bar hides
- [ ] Mobile: "Insights" tab consolidates Analytics + Categories + Word Cloud
- [ ] Mobile: Filter icon opens full-screen filter modal
- [ ] Desktop: Filter bar is inline with all controls visible
- [ ] Platform toggle (All/Android/iOS) updates filter state
- [ ] Quick filter buttons update the active time period
- [ ] Custom date range picker validates start < end
- [ ] Filter state persists when navigating between tabs
- [ ] All pages show appropriate empty state messages
- [ ] No console errors or warnings in browser dev tools
- [ ] Responsive layout works across mobile, tablet, and desktop widths
- [ ] Touch targets are minimum 48dp on mobile
