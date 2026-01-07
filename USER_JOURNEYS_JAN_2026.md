# User Journey Mapping
**Date**: January 7, 2026
**Scope**: Detailed analysis of all primary user workflows.

## 1. The "Cold Start" Journey (New User)
**Goal**: Convert a registered user into an active user with a populated jar.

1.  **Arrival**: User lands on Dashboard. `activeJarId` is null (or user has 0 jars).
2.  **Empty State**: `EnhancedEmptyState` component renders.
    *   *Visuals*: Welcoming graphic, clear Call-to-Actions (CTAs).
3.  **Action - Import Template**:
    *   User clicks "Browse Templates".
    *   **Modal**: `TemplateBrowserModal` opens.
    *   **Selection**: User picks "Date Night Ideas" (or similar).
    *   **Decision**: User selects "Create New Jar" (since they have none).
4.  **System Action**:
    *   Backend creates Jar + 10-50 Ideas.
    *   Backend sets `activeJarId` to new Jar.
    *   Client redirects/refreshes.
5.  **Success State**:
    *   **Toast**: "Jar Created Successfully".
    *   **Dashboard Update**: Jar is now visible. "Spin" button is enabled.
    *   **Engagement**: User is positioned immediately to spin.

## 2. The "Daily Decision" Journey (Spinning)
**Goal**: User extracts a decision from their jar.

1.  **Context Check**: User checks Header.
    *   *Jar Switcher*: Verifies current jar (e.g., "Date Night" vs "Dinner").
    *   *Action*: Uses Search in Jar Switcher if needed to find correct jar.
2.  **Initiation**: Click "Spin the Jar".
3.  **Configuration**: `SpinFiltersModal` opens.
    *   User sets optional filters: "Cheap ($)", "Indoor", "Short (< 1hr)".
4.  **The Spin**:
    *   Animation plays (Sound + Haptic feedback).
    *   Server Action `spinJar` executes.
5.  **The Reveal**: `DateRevealModal` connects.
    *   Display: Winner Idea details.
6.  **Resolution**:
    *   *Accept*: Click "Let's do it!" -> Moves to Memories.
    *   *Reject*: Click "Spin Again" -> Rerolls (excludes previous pick).
    *   *Edit*: Click "Edit Idea" -> Tweaks details before accepting.

## 3. The "Concierge" Journey (AI Planning)
**Goal**: Generate high-quality ideas without manual entry.

1.  **Entry**: Click "Dining Concierge" (or PWA shortcut).
2.  **Constraint Input**: User inputs "Italian, downtown, under $100".
3.  **AI Processing**:
    *   Streaming response fills the UI.
    *   Recommendations appear with Ratings, Maps, and Pricing.
4.  **Selection**:
    *   User likes a suggestion.
    *   Click "Go Tonight" or "Add to Jar".
5.  **Conversion**:
    *   Idea is saved to Database.
    *   **Toast**: "Added 'Luigi's Pasta' to your jar".
    *   User returned to dashboard to see new idea in list.

## 4. The "Power User" Journey (Management)
**Goal**: Organize multiple contexts (Personal, Couple, Group).

1.  **Navigation**: Click Jar Name in Header (Jar Switcher).
2.  **Search**: User types "Work" to find "Work Lunch Group".
3.  **Switch**: Click finding.
    *   Dashboard refreshes data for new Jar context.
4.  **Maintenance**:
    *   User notices old/stale ideas.
    *   Opens "Manage Jars" (Sticky footer in Switcher).
    *   Selects old jar -> "Delete" or "Leave".
    *   **Confirmation**: Modal warns of data loss.
    *   **Success**: Toast confirms deletion. Active jar auto-switches to next available.

## 5. The "On-the-Go" Journey (Mobile/PWA)
**Goal**: Quick interactions via native-like features.

1.  **Launch**: Open from Home Screen icon.
2.  **Quick Action**: Long-press icon or use Widget (future) -> "Draft Idea".
3.  **Haptic Feedback**: User feels ticks while scrolling list or spinning.
4.  **Offline Access**:
    *   User views "Memories" (cached).
    *   Tries to Spin -> Toast "You are offline".

