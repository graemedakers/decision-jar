# Deep Linking Guide & Reference

This guide documents the URL parameters and "Deep Linking" capabilities implemented in the Dashboard (`useDashboardLogic.ts`). These links allow for powerful re-engagement campaigns, direct feature sharing, and streamlined user navigation.

---

## How It Works

The **Action Router** in `useDashboardLogic.ts` inspects the URL query parameters when the dashboard loads. If it finds a matching action, it:
1. Executes the action (e.g., opens a specific modal).
2. "Cleans" the URL by removing the parameters (using `window.history.replaceState`), ensuring the action doesn't trigger again on refresh.

---

## URL Parameters & Use Cases

All links should be formatted as: `https://[your-domain].com/dashboard?parameter=value`

### 1. Feature Actions (`?action=...`)

These actions open specific modals or trigger flows.

| Action Value | Effect | Example URL | Best Use Case |
| :--- | :--- | :--- | :--- |
| `add` | Opens the **Add Idea** modal directly. | `/dashboard?action=add` | "Quick Add" widget; "Did you find something cool?" email. |
| `spin` | Scrolls to the Jar and (optional) opens filters. | `/dashboard?action=spin` | "It's Friday Night!" push notification. |
| `quiz` | Launches the **Preference Quiz** modal. | `/dashboard?action=quiz` | Onboarding emails; "Stuck?" re-engagement campaigns. |
| `settings` | Opens the **Settings** modal. | `/dashboard?action=settings` | "Please update your location" transactional emails. |
| `invite` | Opens **Jar Management/Invite** modal. | `/dashboard?action=invite` | "Invite your partner" prompts. |
| `onboarding` | Restarts the **Onboarding Tour**. | `/dashboard?action=onboarding` | Help Center links; "Show me around again". |

---

### 2. Concierge Tools (`?action=concierge&tool=...`)

Links directly to a specific AI Concierge tool.

**Format:** `/dashboard?action=concierge&tool=[TOOL_ID]`

| Tool ID | Action | Use Case |
| :--- | :--- | :--- |
| `DINING` | Opens Dining Concierge. | "Hungry?" evening notifications. |
| `MOVIE` | Opens Movie Scout. | Weekend circulars; Friday afternoon emails. |
| `ACTIVITY` | Opens Activity Planner. | "Plan your weekend" campaigns. |
| `HOTEL` | Opens Hotel Finder. | Holiday/Vacation season promos. |
| `DRINK` | Opens Bar Scout. | "Thirsty Thursday" prompts. |

*(Note: Tool IDs must match keys in `CONCIERGE_CONFIGS`. They are generally case-insensitive in the router code, but UPPERCASE is standard).*

---

### 3. Direct Idea Links (`?ideaId=...`)

Opens the "Date Reveal" / Detail card for a specific idea.

**Format:** `/dashboard?ideaId=[UUID]`

*   **Behavior:** Finds the idea in the user's current jar. If found, opens the detailed view (read-only mode).
*   **Use Case:** Users sharing a specific idea with their partner via link (e.g., "Let's do this one!").

---

## Strategy for Usage

1.  **Email Marketing:** Use `action=quiz` for users who haven't added ideas in 7 days to help them populate their jar quickly.
2.  **Push Notifications:** Use `action=spin` for Friday/Saturday evening prompts.
3.  **In-App Prompts:** Use `action=invite` if the user is in a "Solo" jar but indicated they have a partner.

---

## Technical Implementation Notes

*   **Location:** `hooks/useDashboardLogic.ts`
*   **Dependencies:** Requires `ideas` and `isLoading` to be settled before running (to ensure Modals can open with data).
*   **Clean Up:** The code automatically removes `action`, `tool`, and `ideaId` params after execution to prevent loops.
*   **Premium Check:** Concierge deep links (`action=concierge`) perform a real-time premium check. Non-premium users are redirected to the Premium Upgrade modal.

---

## Premium Shortcut Engine (NEW)

The `ConciergeShortcutButton` component allows premium users to generate these deep links automatically for their device home screen.

### How it generates links:
1. Detects the `configKey` (e.g., `DINING`) of the active concierge.
2. Constructs a URL: `[origin]/dashboard?action=concierge&tool=DINING`.
3. **Windows:** Downloads a `.url` shortcut file with the app icon.
4. **Mobile:** Copies the link and provides OS-specific "Add to Home Screen" instructions.
5. **Analytics:** Tracks usage via the `concierge_shortcut_created` event.