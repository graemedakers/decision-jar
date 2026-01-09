# Dev Environment Test Plan - End-to-End Functional Verification

**Date:** January 9, 2026
**Objective:** Verify critical functionality following recent updates to Holiday Planner UI, Link Formatting, and Feedback Jars.

## 1. Holiday Planner UI & Functionality
**Goal:** Ensure UI fixes are applied and itinerary links work.

*   **Test Case 1.1: Component Layout**
    *   **Action:** Open a Holiday Planner result (or generate a mock one).
    *   **Verify:** "Add to Favorites" (Heart) button does NOT overlap with "Expand Details" (Chevron) button on the result card.
    *   **Verify:** Action button text reads "**Go Now**" instead of "View Plan".

*   **Test Case 1.2: Map Link Formatting**
    *   **Action:** Expand a day/item in the itinerary details.
    *   **Verify:** Text containing `(Map: ...)` is rendered as a clickable hyperlink.
    *   **Verify:** The link href is a valid Google Maps search URL (starts with `https://www.google.com/maps/search/`), not a deprecated `maps.app.goo.gl` short link (note: this depends on if we mock the data or generate new AI content. Old data might still have old links, need to verify new generation triggers new format).

## 2. Community Feedback Jars
**Goal:** Verify automatic enrollment and existence of feedback jars.

*   **Test Case 2.1: Jar Existence & Membership**
    *   **Action:** Open the Jar Switcher (Header).
    *   **Verify:** "🐛 Bug Reports" (`BUGRPT`) is present in the list.
    *   **Verify:** "💡 Feature Requests" (`FEATREQ`) is present in the list.

*   **Test Case 2.2: User Permissions**
    *   **Action:** Select "Bug Reports" jar.
    *   **Verify:** User can see the "Add Idea" button (implies MEMBER role).

## 3. Location Input (Sanity Check)
**Goal:** Ensure deprecated API warning doesn't break basic usage.

*   **Test Case 3.1: Input Rendering**
    *   **Action:** Navigate to Settings or any page with `LocationInput`.
    *   **Verify:** Input field is visible and typed text appears.
    *   **Verify:** No blocking errors in UI (console warnings are expected).

---
**Execution Method:**
- Automated Browser Agent for UI navigation and DOM inspection.
