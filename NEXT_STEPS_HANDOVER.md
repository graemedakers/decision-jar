# Handover Plan: API Consolidation & Architecture Refactor
**Date:** January 8, 2026
**Status:** In Progress

## 1. Context
We are in the middle of a major architectural cleanup called **"Phase 1: Architectural Cleanup"**. The goal is to eliminate inconsistent API patterns, specifically the confusing split between `/api/jar` (singular) and `/api/jars` (plural).

## 2. Work Completed This Session
*   **Markdown Rendering:** Fixed `DateReveal` and `AddIdeaModal` to correctly render "Holiday Itineraries" and Markdown content using a new `ItineraryMarkdownRenderer` component.
*   **Jar Renaming:** Consolidated `PATCH /api/jar/[id]` into the standard `PUT /api/jars/[id]`.
*   **Jar Deletion:** Consolidated `DELETE /api/jar/[id]/delete` into the standard `DELETE /api/jars/[id]`.
*   **Voting Migration:** Moved `api/jar/[id]/vote` to `api/jars/[id]/vote`. Updated `VotingManager.tsx`.
*   **Switching Migration:** Moved `api/jar/[id]/switch` to `api/users/switch-jar`. Updated `JarSwitcher.tsx`.
*   **Reset Migration:** Moved `api/jar/reset` to `api/jars/[id]/reset` (Explicit ID). Updated `SettingsModal.tsx`.
*   **Regenerate Code Migration:** Moved `api/jar/regenerate-code` to `api/jars/[id]/regenerate-code`. Updated `SettingsModal.tsx`.
*   **Remove Partner Migration:** Moved `api/jar/delete-member` to `api/jars/[id]/remove-partner`. Updated `SettingsModal.tsx`.
*   **Deleted Legacy Directory:** `app/api/jar` has been DELETED.

## 3. Next Session Action Items (The To-Do List)

We have successfully deleted the problematic `app/api/jar` folder AND fixed the stragglers! The specific `SettingsModal` endpoints are now using the clean architecture.

### A. Final Verification & Bug Bash
1.  **Test Settings Modal:** Open settings for a jar and verify:
    *   "Empty Jar" works (calls `/api/jars/[id]/reset`).
    *   "Regenerate Key" works (calls `/api/jars/[id]/regenerate-code`).
    *   "Remove Partner" works (calls `/api/jars/[id]/remove-partner`).
    *   "Switch Jar" works (calls `/api/users/switch-jar`).

### B. Proceed to Phase 2 (UX)
With the API architecture now clean and consolidated:
1.  Start "Quick-Add Ideas" feature.
2.  Or investigate "API/Jars/Community" logic for further cleanup.

## 4. How to Resume
1.  Launch the app.
2.  Do a quick manual test of the Settings Modal features listed above.
3.  If all good, pick the next feature from the Roadmap!

## 5. Future Strategy: Phase 2 UX (Tool Consolidation)
**Objective:** Reduce cognitive load by consolidating 6+ entry points into 3 clear user journeys.

### The "Three-Path" Strategy
1.  **"I have an idea" (Smart Input)**
    *   **Concept:** Single input bar that accepts Text, URLs, or Images.
    *   **Tech:** Auto-detects input type.
        *   Text -> Create Idea.
        *   URL -> Activate Scraper -> Create Idea.
        *   Image -> Activate Vision AI -> Create Idea.
    *   **Action:** Replace "Add Manual", "Paste Link", "Upload Photo" buttons.

2.  **"I need inspiration" (Unified Concierge)**
    *   **Concept:** A single "Concierge" entry point.
    *   **Tech:** Chat-like interface (GenericConciergeModal).
    *   **Action:** Specific agents (Dining, Movie, Weekend) become *skills* enabled via config/prompt, not separate UI buttons.

3.  **"I want to browse" (Templates)**
    *   **Concept:** Curated lists and packs.
    *   **Action:** Keep "Template Gallery" as the browsing option.
