# Application Architecture & Code Review

## 1. System Overview
**"Decision Jar"** is a Next.js (App Router) web application designed to help couples and groups decide on activities. It features a "Jar" concept where ideas are added, and then randomly selected or voted upon.

### Core Stack
- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion.
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL.
- **State**: React Local State (heavy usage), URL Search Params (for PWA shortcuts).
- **Authentication**: Custom implementation (NextAuth.js patterns observed but custom endpoints `/api/auth/me`).

---

## 2. Core Functionality & Rules

### A. Jars & Modes
The application revolves around "Jars". A user can belong to multiple jars (Memberships), but has one "Active Jar".
- **Jar Types**:
    - `ROMANTIC`: Partner-focused. Linked to one other user ("Partner").
    - `SOCIAL`: Group-focused. Multiple members.
- **Selection Modes** (`jarSettings`):
    - `RANDOM`: Standard "Spin the Jar". Animations pick a random winner.
    - `ADMIN_PICK`: Members add ideas, but the Spin button is locked. Only Admin can "Pick a Winner" (manually select).
    - `VOTING`: "Spin" button is replaced by "Start Voting". Admin starts a timed session; members vote; system resolves winner.
    - `ALLOCATION` (Task Mode): Ideas are "tasks". Admin distributes them to members.

### B. Idea Management
- **Adding Ideas** (`AddIdeaModal`):
    - **Manual**: Users enter Description, Category, etc.
    - **Magic Fill**: Uses AI (`/api/magic-idea`) to generate details based on the user's location and jar topic.
    - **Community Rules**: If a user is a "Community Member" (not Creator/Admin), their ideas might be flagged for review (implied by "Suggest Idea" text logic).
- **Filtering**: Users can filter the "Spin" based on Cost, Time, Duration, and Activity Level.

### C. Concierge Tools (AI)
There are 11 AI-powered "Concierge" tools (Dining, Bar, Movie, etc.).
- **Mechanism**:
    1.  User inputs criteria (Cuisine, Vibe, Location).
    2.  App calls specific API (e.g., `/api/dining-concierge`).
    3.  Backend calls OpenAI to generate 3 recommendations.
    4.  frontend displays results in `ConciergeResultCard`.
- **Rules**:
    - **Premium Gating**: Free users get ~3 trials (stored in `localStorage` via `useDemoConcierge`). Premium users have unlimited access.
    - **Community Logic**: These tools are **HIDDEN** for Community Jars to keep the focus on the group's own ideas.

### D. User Settings & Admin (`SettingsModal`)
- **Profile**: Users set `homeTown` and `interests` (used for AI context).
- **Danger Zone**: 
    - "Empty Jar": Deletes ALL ideas.
    - "Delete Partner/Member": Removes the connection.
- **Premium**: "Regenerate Premium Token" allows creators to generate a signup link that gifts Premium status to new members.

---

## 3. Codebase Analysis & Refactoring Report

### A. Dashboard Monolith (`app/dashboard/page.tsx`)
**Status**: **Resolved** (Previously Critical Complexity).
- **Actions Taken**:
    - Extracted `DashboardModals` component to handle all modal rendering.
    - Extracted `DashboardModals` and `SmartToolsGrid` components.
    - Implemented global `useModalSystem` hook (Context-based) to replace local state management.
- **Result**: `page.tsx` reduced from ~1700 lines to ~1000 lines. Improved readability and maintainability.

### B. Concierge Modal Duplication
**Status**: **Resolved**.
- **Action Taken**: Replaced individual `Dining`, `Bar`, `Book`, etc. modals with a single `GenericConciergeModal` driven by `concierge-configs.ts`.
- **Remaining Standalone**: Complex planners like `DateNightPlannerModal`, `CateringPlannerModal`, and `WeekendPlannerModal` remain independent due to specialized UI requirements.

### C. Form Validations
- **`AddIdeaModal`**:
    - Validates "Category" matches "Jar Topic".
    - Auto-fixes invalid categories on load.
    - **Refactor**: [Completed] Logic extracted to `useIdeaForm` and `useMagicIdea` hooks.

### D. Navigation
- **Mobile vs Desktop**:
    - Desktop: Sidebar/Grid layout.
    - Mobile: Bottom Nav + "Explore" Page.
- **Inconsistency**: [Resolved] Dashboard and Explore page now utilize `DASHBOARD_TOOLS` constant.
- **Fix**: [Completed] Defined the list of Tools in `lib/constants/tools.ts` and iterated over it in both places.

---

## 4. Key Rules Reference
| Feature | Logic |
| :--- | :--- |
| **Community Jar** | Hides: Spin Button, Vault, Concierge Tools, Templates. Shows: Voting Manager, Suggest Idea. |
| **Voting** | Requires `jarSelectionMode === 'VOTING'`. Admin starts -> Members Vote -> Admin Resolves. |
| **Magic Fill** | Uses `user.location` and `jar.topic` to prompt LLM. |
| **Premium** | Checked via `userData.isPremium`. Unlocks all Concierge tools and unlimited Spins. |


## 5. Next Steps
- **Calendar Integration**: [Completed] Added 'Add to Calendar' to DateReveal and ViewMemoryModal.
- **Surprise Me Flow**: [Completed] Enhanced Dashboard integration with direct AI magic mode.
- **Demo Page Fix**: [Completed] Resolved Vercel build errors by centralizing Concierge Modal usage.
- **Refactor `AddIdeaModal`**: [Completed] Logic extracted to `useIdeaForm` and `useMagicIdea` hooks.
- **Global Modal System**: [Completed] `DashboardPage` and `ExplorePage` now use `ModalProvider` and `useModalSystem`.
- **Explore Page Refactor**: [Completed] Updated to use `useModalSystem` hook.
- **Planner UI**: `BarCrawlPlanner` and `MenuPlanner` remain standalone.

### Upcoming
1.  **Refactor `CalendarModal`**: Evaluate simplification opportunities.
2.  **General Polish**: Review UI consistency.


## 6. Standardization & Scalability Roadmap
To improve maintainability and scalability without altering functionality, the following architectural improvements are recommended:

### A. Consolidated Type Definitions (Priority 1)
- **Status**: **Completed**
- **Problem**: Interfaces like `Idea`, `User`, and `Jar` were redefined in multiple components.
- **Solution**: Created `types/domain.ts` (or `lib/types.ts`) and updated `DashboardPage`, `DashboardModals`, `AddIdeaModal`, and `DateReveal` to use shared strict types.
- **Benefit**: Ensures consistency and type safety across the frontend.

### B. Global Modal System (Priority 2)
- **Status**: **Completed**
- **Problem**: `DashboardModals` and `ExplorePage` acted as switchboards with manual state.
- **Solution**: Implemented `ModalContext` and `ModalProvider`. Components trigger `openModal('ID', props)`.
- **Benefit**: Decoupled modal triggering. Modals are now managed centrally via `DashboardModals` wrapper.

### C. Centralized API Services (Priority 3)
- **Status**: **Completed**
- **Problem**: `fetch` calls are scattered inside UI components (e.g., in `AddIdeaModal`, `DateReveal`).
- **Solution**: Extracted API interactions into custom hooks (`useUser`, `useIdeas`, `useFavorites`). Refactored `DashboardPage`, `JarPage`, and `MemoriesPage` to use these hooks.
- **Benefit**: Separates UI from data fetching. Logic is reusable across Dashboard/Explore.

### D. "Wizard" Component for Planners (Priority 4)
- **Problem**: Analyzed planners (`BarCrawl`, `MenuPlanner`) share identical "Input -> AI Process -> Result -> Save" flows but duplicate the logic.
- **Solution**: Create a generic `<WizardModal>` component handling steps and navigation.
- **Benefit**: Accelerates creation of future AI tools and ensures consistent UX.
