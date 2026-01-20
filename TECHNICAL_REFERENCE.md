# Technical Reference & Architecture Guide

This document provides a comprehensive technical overview of the "Decision Jar" application, including its architecture, component hierarchy, data flow, and key workflows.

---

## 1. System Architecture

### Core Stack
- **Frontend Framework**: Next.js 14 (App Router).
- **Language**: TypeScript (Strict typing enforced).
- **Styling**: Tailwind CSS + Framer Motion (Animations).
- **Database**: PostgreSQL (via Supabase or similar).
- **ORM**: Prisma.
- **State Management**:
    - **Global Modal System**: Context API (`ModalProvider`).
    - **Data Fetching**: Custom Hooks (`useUser`, `useIdeas`, `useFavorites`) replacing raw fetch.
    - **UI State**: React `useState` for local component logic.
- **Authentication**: Custom Session-based (HTTP-only cookies). Endpoints: `/api/auth/*`.

### Directory Structure
- `app/`: Next.js App Router pages.
    - `dashboard/`: Main application hub.
    - `jar/`: Jar management & settings.
    - `memories/`: Historical vault of completed activities.
    - `explore/`: Discovery of specific concierge tools.
    - `(auth)/`: Login, Signup, Password Reset.
    - `api/`: Backend endpoints (Serverless functions).
- `components/`: Reusable UI blocks.
    - `ui/`: Primitives (Button, Input, etc.).
    - `DashboardModals.tsx`: Central registry for all application modals.
    - `SmartToolsGrid.tsx`: "Executive Decision Suite" layout.
- `hooks/`: Custom logic encapsulation.
    - `useConciergeActions.ts`: Shared logic for AI tool results.
    - `useUser.ts`, `useIdeas.ts`: Centralized data access.
- `lib/`: Utilities.
    - `prisma.ts`: DB client.
    - `auth.ts`: Session handling.
    - `gemini.ts` / `openai.ts`: AI model interfaces.

---

## 2. Key Components & Responsibilities

### Layout System
- **`DashboardPage`**: The primary controller.
    - **Header**: Shows `JarSwitcher` (Context title) and "Trophy Case" (Gamification).
    - **Body**: dynamic content based on state (Empty vs Populated).
    - **Footer**: `BottomNav` for mobile.
    - **Modals**: Renders `<DashboardModals />` which conditionally mounts active modals.

### The "Jar" Concept
- **`JarSwitcher`**: Dropdown component in header. fetchs `user.memberships` to allow switching `activeJarId`.
- **`DateReveal`**: The core "Spin" component. Handles the animation of the jar selecting an idea.
- **`VotingManager`**: Alternative to "Spin" for Group Jars (`jarSelectionMode === 'VOTING'`).

### Modal System (`ModalProvider`)
All major interactions occur in overlays. Key Types:
- **`ADD_IDEA`**: Uses `AddIdeaModal`. Modes: Create, Edit, Magic Fill.
- **`CONCIERGE`**: Uses `GenericConciergeModal`. Dynamically configured by `concierge-configs.ts` (Dining, Movies, etc.).
- **Planners**: Specialized heavy modals:
    - `DateNightPlannerModal`: Complex multi-step date creation.
- **`SpinFilters`**: Configures the selection algorithm (Cost, Time, etc.).

---

## 3. Data Flow & API Interactions

### User Data (`useUser`)
- **Source**: `/api/auth/me`
- **Content**: User Profile, Membership List (Jars), Active Jar ID, Gamification Stats (XP, Level).
- **Lifecycle**: Fetched on mount. Refreshed on Jar Switch or significant actions (Level Up).

### Idea Data (`useIdeas`)
- **Source**: `/api/ideas` (GET)
- **Content**: Array of `Idea` objects for the *Active Jar*.
- **Lifecycle**: Fetched on mount, refetched after Add/Edit/Delete/Move.
- **Mutation**:
    - `POST /api/ideas`: Create.
    - `PATCH /api/ideas/[id]`: Edit / Update Rating / Add Photos.
    - `DELETE /api/ideas/[id]`: Remove.
    - `POST /api/jar/spin`: Select a winner (Server-side RNG).
    - `POST /api/ideas/[id]/move`: Transfer to another jar.

### Concierge & AI
- **Pattern**: Client -> API Route -> Database Cache (HIT?) -> AI Service -> Database Cache (SAVE) -> Client.
- **Endpoints**:
    - `/api/concierge`: Generic tools.
    - `/api/magic-idea`: "Surprise Me" single idea generation.

---

## 4. Key Workflows (Technical View)

### 1. Spinning the Jar
1. User clicks "Spin Jar".
2. App checks `filters` (State).
3. **API Call**: `POST /api/jar/spin` with filters.
4. **Backend**: Fetches eligible ideas -> Filters -> Random Pick -> Updates `idea.selectedAt` -> Returns Idea.
5. **Frontend**: Receives Idea -> Opens `DATE_REVEAL` modal -> Plays Animation -> Shows Result.
6. **Post-Action**: User clicks "Go Tonight!" -> Idea marked as "Memory" (Date set).

### 3. Moving an Idea
1. User clicks "Move" icon on idea card (`JarPage`).
2. App calls `GET /api/jar/list` to show targets.
3. User selects Target Jar.
4. **API Call**: `POST /api/ideas/[id]/move`.
5. **Frontend**: Updates local list (removes idea).

---

## 5. Security & Validation
- **Authentication**: All API routes check `getSession()`.
- **Authorization**:
    - Jar operations check `JarMember` table for `userId` + `jarId`.
    - "Move" checks membership in *Source* AND *Target*.
- **Premium**:
    - `isPremium` flag checked on Frontend (UI hiding) AND Backend (API blocking).
    - Rate limits applied to Free tier AI usage.

