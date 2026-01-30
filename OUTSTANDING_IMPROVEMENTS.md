# Outstanding Improvements & Recommendations
**Last Updated:** January 30, 2026
**Status:** Verified against codebase

This document consolidates all outstanding improvements, technical debt, and architectural recommendations identified in previous reviews (Jan 2026). It has been cross-referenced with the current codebase to ensure accuracy (removing items that have already been implemented).

---

## 1. Architecture & Technical Debt

### 1.1 Complete Server Actions Migration
**Status:** 🚧 Partial
**Priority:** High
**Reference:** `INDEPENDENT_RECOMMENDATIONS.md` (C1)

While the core `Idea` and `Vote` logic has been migrated to Server Actions (in `app/actions/`), significant parts of the application still rely on legacy API Route handlers.
*   **Outstanding Work**:
    *   **Jar Management**: `app/api/jars/route.ts` and `app/api/jars/[id]/route.ts` should be migrated to `app/actions/jars.ts`.
    *   **User Settings**: `app/api/user/settings` handles updates via PUT requests.
    *   **Analytics**: `app/api/analytics` handles event changes.
    *   **Uploads**: `app/api/upload-cloudinary` handles signing.

### 1.2 Offline "View-Only" Data Caching
**Status:** ❌ Missing
**Priority:** Medium
**Reference:** `UNIMPLEMENTED_IMPROVEMENTS_AND_FUTURE_VISION.md` (5. Technical Debt)

The app has basic PWA assets (`public/sw.js`, `manifest.json`), but lacks a robust offline strategy for dynamic data.
*   **Outstanding Work**:
    *   Configure `next-pwa` or update `sw.js` to cache `GET` API responses (e.g., jar contents).
    *   Configure `TanStack Query` (React Query) with `persist-client` to persist jar data to `localStorage` for offline viewing.
    *   Add "Offline Mode" UI path (read-only access to cached jars).

### 1.3 Standardize "Wizard" Components
**Status:** 🚧 Inconsistent
**Priority:** Low
**Reference:** `UNIMPLEMENTED_IMPROVEMENTS_AND_FUTURE_VISION.md` (1. Core Workflow)

A reusable `WizardFrame` component exists (`components/WizardFrame`), but it is not universally adopted.
*   **Outstanding Work**:
    *   Refactor `components/Onboarding/OnboardingWizard.tsx` to use `WizardFrame`.
    *   Refactor `components/wizard/IdeaWizard.tsx` to use `WizardFrame`.
    *   Remove duplicated step-management logic from individual wizard files.

### 1.4 Standardize API Error Handling
**Status:** ❌ Missing
**Priority:** Low
**Reference:** `INDEPENDENT_RECOMMENDATIONS.md` (C2)

API endpoints return inconsistent error formats (some return `{ error: string }`, others `{ success: false, message: string }`).
*   **Outstanding Work**:
    *   Create a standardized `ApiError` class or helper.
    *   Replace manual `NextResponse.json({ error: ... }, { status: 400 })` calls with this helper across all endpoints.

---

## 2. Testing & Quality Assurance

### 2.1 Expand Unit Test Coverage
**Status:** 🚧 Partial
**Priority:** High
**Reference:** `INDEPENDENT_RECOMMENDATIONS.md` (3. Testing Strategy)

The project has good E2E coverage (`tests/e2e` has 18 files), but Unit Test coverage for business logic is sparse.
*   **Outstanding Work**:
    *   `tests/unit` currently contains only ~7 files.
    *   Add unit tests for complex `lib/` utilities: `gamification.ts`, `date-utils.ts`, `filters.ts`.
    *   Add unit tests for Server Actions (mocking the database).

### 2.2 Visual Regression Testing
**Status:** 🚧 Started
**Priority:** Medium

`visual-regression.spec.ts` exists but coverage is minimal.
*   **Outstanding Work**:
    *   Implement Percy or comprehensive Playwright snapshots for key UI states: "Empty Jar", "Date Reveal Modal", "Wizard Steps".

---

## 3. Product Features & User Experience

### 3.1 Proactive AI Recommendations
**Status:** ❌ Missing
**Priority:** High (Retention)
**Reference:** `UNIMPLEMENTED_IMPROVEMENTS_AND_FUTURE_VISION.md` (4. Premium Conversion) & `INDEPENDENT_RECOMMENDATIONS.md` (F3)

Currently, AI is reactive (user asks for help). There is no system to proactively suggest ideas based on inactivity or weather.
*   **Outstanding Work**:
    *   Create a new cron job (`app/api/cron/suggest-ideas`) that runs weekly.
    *   Identify users with low activity.
    *   Use Gemini to generate 3 "Weekend Ideas" based on their location/preferences.
    *   Send via Email/Push Notification.

### 3.2 Community Discovery & Search
**Status:** ❌ Missing
**Priority:** Medium (Growth)
**Reference:** `UNIMPLEMENTED_IMPROVEMENTS_AND_FUTURE_VISION.md` (3. Community Discovery)

The `app/explore` page handles Templates, but there is no true user-to-user discovery.
*   **Outstanding Work**:
    *   **Public Gallery**: Allow users to publish their jars to a "Community" feed.
    *   **Search API**: Implement `app/api/search` to index and retrieve public jars/ideas by keyword/tag.
    *   **"Forking"**: Enhance the import logic to support cloning *any* public jar, not just templates.

### 3.3 "Squad Mode" & Deep Collaboration
**Status:** ❌ Missing
**Priority:** Medium (Engagement)
**Reference:** `UNIMPLEMENTED_IMPROVEMENTS_AND_FUTURE_VISION.md` (2. Squad Mode)

While basic "Live Voting" exists (via Supabase), the rich social presence features are unimplemented.
*   **Outstanding Work**:
    *   **Live Presence**: Show avatars of who is currently looking at the jar.
    *   **Activity Toasts**: "Sarah is adding an idea..." (typing indicator).
    *   **Consensus Tools**: Implement "Veto Cards" (a limited resource to reject ideas).

### 3.4 Calendar Integration 2.0
**Status:** ❌ Missing
**Priority:** Low
**Reference:** `UNIMPLEMENTED_IMPROVEMENTS_AND_FUTURE_VISION.md` (1. Core Workflow)

Current integration is a basic `.ics` download.
*   **Outstanding Work**:
    *   **Two-way Sync**: Integrate Google Calendar API to read "Busy" times.
    *   **Availability Heatmap**: Visualize when the group is free on the dashboard.

---

## 4. Completed Items (For Reference)

The following items from previous roadmaps have been **VERIFIED AS COMPLETED**:
*   ✅ **Unify AI Concierge**: All specialized tools (`Dining`, `Movie`, etc.) are now handled by a unified system (`app/api/concierge` or `ai/` folder structure).
*   ✅ **Consolidated Onboarding**: The "Three-Path UX" (Smart Input, Concierge, Templates) is implemented.
*   ✅ **Gamification**: Streaks, XP, and Levels are fully implemented (`lib/gamification.ts`, `StreakBadge`).
*   ✅ **Push Notifications**: VAPID infrastructure and Preference settings (`components/SettingsModal.tsx`) are in place.
*   ✅ **Swipe/Spin UX**: The updated `DateReveal` and `UnifiedIdeaCard` are live.
