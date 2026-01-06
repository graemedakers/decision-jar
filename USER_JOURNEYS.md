# User Journeys & Workflows

This document details the primary user journeys within the "Decision Jar" application, mapping out the step-by-step interactions for key personas and scenarios.

---

## Journey 1: The "First Run" (Onboarding)
**Persona**: New User (Couple)
**Goal**: Set up a shared space and add the first few ideas.

1.  **Landing**: User arrives at `/`. Clicks "Get Started".
2.  **Signup**: Enters Email/Password. Account is created.
3.  **Jar Creation Wizard**:
    -   Prompt: "What kind of jar?" -> Selects `Romantic`.
    -   Setup: Enters Partner's Name (e.g., "Sarah").
    -   Result: App creates a Jar, sets User as Admin, generates `referenceCode`.
4.  **Dashboard Arrival**: User sees an empty jar animation.
    -   *Guide*: "Your jar is empty! Add 3 ideas to get started."
5.  **First Contribution**:
    -   User clicks "Add Idea" -> Selects "Magic Fill" -> "Surprise Me".
    -   AI generates "Sunset Picnic at [Local Park]".
    -   User saves.
6.  **Partner Invitational**:
    -   User clicks "Settings" -> "Invite Partner".
    -   Copies Link/Code.
    -   Partner joins -> Instant access to the same Jar.

---

## Journey 2: The "Indecisive Evening" (Core Loop)
**Persona**: Established User
**Goal**: Decide on dinner or an activity strictly because "I don't know, what do you want?" is forbidden.

1.  **Trigger**: It's 6:00 PM. Couple opens the app.
2.  **Dashboard**: They see the standard jar.
3.  **Filtering (Optional)**:
    -   They only have 2 hours and want to stay cheap.
    -   Click "Filters" -> Select `Under $20`, `2 Hours`.
4.  **The Spin**:
    -   Click "Spin Jar".
    -   Animation plays (haptic feedback on mobile).
5.  **The Reveal**:
    -   Result: "Make Homemade Pizza".
    -   Reaction: "Okay, let's do it."
6.  **Commitment**:
    -   Click "Go Tonight!".
    -   Result moves from "Jar" to "Vault" (Memories).
    -   Confetti triggered.

---

## Journey 3: The "Executive Planner" (Advanced)
**Persona**: The "Type A" Partner
**Goal**: Plan the entire week's meals and a weekend date in one sitting.

1.  **Menu Planning**:
    -   Opens `MenuPlanner` (from "Executive Decision Suite").
    -   Inputs: "7 Days", "Keto", "Spicy".
    -   Generates Plan.
    -   Reviews suggestions. Clicks "Add to Jar" on 3 favorites (Tacos, Salmon, Stir-fry).
    -   *Result*: 3 new "Meal" ideas added to the Jar.
2.  **Weekend Prep**:
    -   Opens `WeekendPlanner`.
    -   Inputs: "Relaxing", "Outdoor".
    -   AI suggests "Botanical Garden Visit".
    -   User edits description to add specific driving directions.
    -   Saves to Jar.

---

## Journey 4: The "Social Coordinator" (Community Mode)
**Persona**: Group Leader
**Goal**: Organize a Friday night out with 5 friends.

1.  **Setup**:
    -   User creates a *New Jar*. Type: `Social`. Name: "Friday Squad".
    -   Mode: `VOTING` (Important change from Random).
2.  **Invites**: Shares code in Group Chat. 4 friends join.
3.  **Ideation**:
    -   Everyone opens the app.
    -   Each friend adds 1-2 suggestions (Bar A, Club B, Karaoke).
    -   *Note*: In Community Mode, Concierge tools are hidden to focus on user ideas.
4.  **Voting Phase**:
    -   Admin (Leader) clicks "Start Voting".
    -   Timer starts (2 minutes).
    -   All phones show the Voting UI.
    -   Users swipe right/left or rate ideas.
5.  **Resolution**:
    -   Timer ends.
    -   App calculates weighted scores.
    -   Winner Announced: "Karaoke at Melody Bar".

---

## Journey 5: The "Nostalgic Review" (Retention)
**Persona**: Long-time User
**Goal**: Reminisce and clean up.

1.  **Vault Access**: User navigates to `/memories`.
2.  **Review**: Scrolls through past months.
    -   Sees "Sunset Picnic" (from Journey 1).
    -   Realizes they never rated it.
3.  **Enrichment**:
    -   Clicks "Rate/Add Photos".
    -   Uploads a selfie from that day.
    -   Rates 5 stars.
4.  **Cleanup**:
    -   Notices "Bad Movie Night" was awful.
    -   Deletes it from history to keep the vault "clean" (or keeps it for laughs).
5.  **Re-roll**:
    -   Sees "Italian Restaurant" was amazing.
    -   Clicks "Add Again" (Copy) to put it back into the active Jar for a future spin.

