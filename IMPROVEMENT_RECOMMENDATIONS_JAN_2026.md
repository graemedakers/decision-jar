# Improvement Recommendations & Roadmap
**Date**: January 7, 2026
**Priority**: High Impact, Low Disruption

## 1. Architecture & Code Quality

### 1.1 Unify AI Concierge Endpoints (High Priority)
*   **Current State**: 12+ separate API routes (`dining-concierge`, `movie-concierge`, etc.) with 90% duplicated logic.
*   **Recommendation**: Create a single `api/concierge/generate` endpoint.
*   **Implementation**: Pass `mode` or `configId` in the request body. Start using the `ConciergeConfig` object to dynamically select system prompts.
*   **Benefit**: Reduces maintenance burden by 90%. Fix a bug in one agent, fix it in all.

### 1.2 Refactor `useDashboardLogic` (Medium Priority)
*   **Current State**: A monolithic hook managing Modals, Data Fetching, PWA Shortcuts, Auth Redirects, and Confetti.
*   **Recommendation**: Split into specialized hooks:
    *   `useDashboardData()`: Pure data fetching.
    *   `useJarActions()`: Spin, Add, Delete handlers.
    *   `useAppEffects()`: PWA, Onboarding, Invite Code checks.
*   **Benefit**: Improves readability and makes unit testing possible.

### 1.3 Implement TanStack Query (React Query) (High Priority)
*   **Current State**: Manual `useEffect` + `fetch` + local state variables. Manual re-fetching via `refreshUser()`.
*   **Recommendation**: Adopt `useQuery` for reads and `useMutation` for server actions.
*   **Benefit**: Automatic caching, background refetching, deduping requests, and simpler code (deletes hundreds of lines of boilerplate).

---

## 2. User Experience (UX)

### 2.1 Optimistic UI Updates
*   **Problem**: When adding an idea, the user waits for the server roundtrip before seeing it in the list.
*   **Solution**: Immediately append the idea to the local list state upon submission. Revert if the server returns an error.
*   **Benefit**: App feels "instant" and "native".

### 2.2 Global Error Boundary
*   **Problem**: If a component crashes (e.g., rendering a malformed idea), the whole page turns white.
*   **Solution**: precise `ErrorBoundaries` around the Dashboard and Modal implementation.
*   **Benefit**: Users can recover (e.g., "Reload Jar") instead of refreshing the browser.

### 2.3 Deep Linking
*   **Opportunity**: Allow users to share specific ideas or stats.
*   **Implementation**: Routes like `/jar/[id]/idea/[ideaId]` that open the modal on load.
*   **Benefit**: Improves shareability and external engagement.

---

## 3. Testing Strategy

### 3.1 Critical Path Automation
*   **Recommendation**: Implement Playwright E2E tests for the "Cold Start" journey.
    *   Test: Register -> Import Template -> Spin Jar.
*   **Why**: This is the revenue/conversion funnel. It must never break.

### 3.2 Unit Tests for Logic
*   **Recommendation**: Jest/Vitest for `spin.ts` (Server Action).
    *   Test: Ensure filters (Indoor, Cost) strictly apply.
*   **Why**: Logic errors here frustrate users immediately.

---

## 4. Feature Opportunities

### 4.1 "Squad Mode" (Real-time)
*   **Concept**: Live voting where multiple users see the same spin result at the same time.
*   **Tech**: Use Supabase Realtime or Pusher.

### 4.2 Calendar Integration
*   **Concept**: "Push to Google Calendar" button on the Dates (Memories) page.
*   **Tech**: Simple `.ics` file generation client-side.

