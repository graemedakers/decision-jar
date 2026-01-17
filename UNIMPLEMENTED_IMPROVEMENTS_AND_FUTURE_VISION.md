# Unimplemented Improvements & Future Vision
**Last Updated:** January 17, 2026

This document serves as a consolidated master list of features, technical debt, and strategic opportunities identified during architectural reviews but **not yet implemented**. It is intended to guide future agents and developers in prioritizing roadmap items.

---

## 1. Core Workflow & UX Optimization
*These items focus on making the app faster, cleaner, and more intuitive for daily use.*

*   **Reusable Wizard Component**: Standardize the multi-step "Wizard" flow used by planners (`BarCrawl`, `Menu`, `WeekendPlanner`). Replace duplicated logic with a `<WizardModal>` component or `useWizard` hook.
*   **Calendar Integration 2.0**: Refactor `CalendarModal` for better mobile UX and explore merging it into the `DateNightPlanner` to reduce UI fragmentation.
*   **Idea Transferability**: Implement "Move Idea" UI and API to allow users to transfer ideas between their different jars.
*   **Contextual Jar Auto-Switching**: When adding an idea from a specialized concierge (e.g., Dining), the app should intelligently suggest/switch to the most relevant jar (e.g., "Dining Ideas").
*   ~~**Digital Item Logic**: Update the `GameConcierge` and `ConciergeResultCard` to detect online/digital items and automatically hide physical map/address indicators.~~ ✅ **COMPLETED** (Jan 17, 2026)
*   ~~**Global UI Polish**: Conduct a spacing and alignment pass across the Dashboard and Explore grids to ensure 100% visual consistency.~~ ✅ **COMPLETED** (Jan 17, 2026)

---

## 2. "Squad Mode" & Group Engagement
*Enhancements targeted at friend groups, families, and social planning.*

*   **Consensus Tools**:
    *   **Veto Power**: Limited "Veto" cards for members to force a re-spin on results they dislike.
    *   **Runoff Voting**: A spin mode that picks 3 candidates and allows the group to vote on the final winner.
    *   **Host's Choice**: Spin 3 options, but leave the final decision to the Jar Admin.
*   **Logistics & Planning**:
    *   **Availability Heatmap**: Sync (Google/Apple) calendars to visually show when most members are free.
    *   **Ride-Share Deep Links**: Direct Uber/Lyft buttons on the "Result" card that pre-fill the location.
    *   **Bill Splitter**: Simple tracker within the "Memory" to log who paid for what.
*   **Social Connectivity**:
    *   **Plan Chat ("The Hype Train")**: Per-plan comment threads for coordinating arrival times and logistics.
    *   **Collaborative Memories**: Shared photo uploading for events where multiple jar members were present.

---

## 3. Community Discovery & Virality
*Features to move from private utility to a social discovery platform.*

*   **Public Jar Gallery**: A discoverability hub (`/discover`) for browsing high-quality public jars.
*   **"Forking" (Copy to My Jar)**: One-click cloning of public jar content into a user's personal jar.
*   **Curator Ecosystem**: Public profiles for power-curators to showcase their collections, with "Follow" functionality.
*   **Search & Discovery**: Robust keyword and location-based search for public experiences.

---

## 4. Premium Conversion & Pro Retention
*Mechanisms to drive higher LTV and trial-to-paid conversion.*

*   **Conversion "Nudge" Modals**:
    *   **Trial Expiry Modal**: High-impact modal that appears immediately upon trial end (Day 15).
    *   **Contextual Trial Status**: "X days left" badges inside Concierge tool headers.
*   **Email Lifecycle Automation**: (Requires Postmark/Resend/SendGrid)
    *   Nurture sequence for trial users (Welcome -> Halfway -> Expiry Warning -> Special Offer).
*   **Admin Control (Phase 9.4)**:
    *   Full UI for Managing Premium Gifting Links.
    *   Token revocation and usage auditing dashboard.
*   **Dynamic PWA Personalization**: Server-generated manifests to allow Pro users to choose custom app icons or home screen shortcuts.

---

## 5. Technical Debt & Performance
*Internal upgrades to ensure long-term scalability.*

*   **Offline "View-Only" Mode**: Enhance React Query and LocalStorage caching to allow users to view their jars while offline.
*   **Automation Coverage**: Implementation of the Playwright E2E suite for the critical signup-to-spin path.
*   **Server Actions Migration**: Continued refactoring of legacy API routes (`/api/*`) to Next.js Server Actions.
*   **Image Compression**: Implement client-side image resizing/compression before uploading to Cloudinary to save on egress/storage costs.

---

## 🔗 Original Source References
These items were aggregated from the following project documents:
1. `ROADMAP_IMPLEMENTATION_STATUS.md` (Future Recommendations section)
2. `IMPROVEMENT_SUGGESTIONS.md` (UX & Architecture recommendations)
3. `ANALYTICS_ENHANCEMENT_PROPOSAL.md` (Data-driven feature gaps)
4. `COMMUNITY_JARS_STRATEGY.md` (Discovery vision)
5. `SQUAD_MODE_IMPROVEMENTS.md` (Social feature set)
6. `TRIAL_UPGRADE_UX_ANALYSIS.md` (Conversion funnel gaps)
