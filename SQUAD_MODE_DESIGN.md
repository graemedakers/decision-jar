# Squad Mode: Design & Monetization Strategy

## Core Concept
Transform **Date Jar** from a "Couple's App" into a "Social Decision Platform".
Users currently belong to **one** `Couple`. The new model allows users to belong to **multiple** `Jars`.

---

## 1. Architecture Changes (Multiple Jars)

### Current Data Model
- **User** has one `coupleId`.
- **Couple** contains 2 Users.

### Proposed Data Model
We move to a Many-to-Many relationship.

1.  **Rename** `Couple` table to `Jar`.
    *   Add `type`: `ROMANTIC` | `SOCIAL` | `FAMILY`.
    *   Add `name`: e.g., "The Bois", "Sunday Brunch Crew".
    *   Add `ownerId`: The creator of the jar.

2.  **New Relationship Table**: `JarMember`
    *   `userId`
    *   `jarId`
    *   `role`: `ADMIN` | `MEMBER`.

3.  **User Experience**
    *   **Jar Switcher**: A simple dropdown or sidebar (like Discord/Slack) to switch between context.
    *   **Identity**: Your "Interests" profile might need to be global, but your "Availability" might be per-jar.

### Jar Limits & Constraints
**Updated 2026-01-08:** Romantic jar restrictions have been removed for flexibility.

- **All Jar Types**: 
    - **Limit:** Users can create and join multiple jars of any type
    - **Members:** Consistent limits across all types (based on subscription tier)
    - Romantic, Social, and Generic jars now function identically
    
**Note:** The legacy "one romantic jar" limit was deprecated to support:
- Multiple romantic relationships (polyamory, dating)
- Themed romantic jars ("Date Nights", "Anniversaries", "Weekend Getaways")
- Greater organizational flexibility

---

## 2. Danger Zone & Permissions
How "Danger Zone" actions adapt to multiple jars:

| Action | Role | Effect |
| :--- | :--- | :--- |
| **Leave Jar** | Member | Removes user from the jar. Jar remains intact with remaining members. |
| **Delete Jar** | Owner/Admin | **Irreversible.** Deletes the jar and all containing ideas/memories. |
| **Kick Member** | Owner/Admin | Removes a specific user from the jar. (Replaces "Delete Partner"). |
| **Empty Jar** | Owner/Admin | Deletes all *Ideas* in the jar, but keeps Memories and Members. |

**Critical Constraints:**
- You cannot "Leave" a jar if you are the **only Owner**. You must either Transfer Ownership or Delete the Jar.
- "Delete Partner" (Legacy) -> Migrates to "Kick Member" (if Admin) or "Leave Jar" (if Partner).

---

## 3. Monetization Strategy

How do we charge for this? The current model is "One payment per user".

### Option A: The "Premium Subscriber" (Spotify Model)
**User-centric pricing.**
- **Free User:** Can create and join up to 3 jars total.
- **Premium User ($5/mo):**
    - Create unlimited Social Jars.
    - Unlock "Voting Mode" (Polls) for any Jar they own.
    - Unlock "AI Concierge" for any Jar they own.
    - **Pros:** Simple. "Power users" pay.
    - **Cons:** Hard to upsell if I just want to join my friend's jar.

### Option B: The "Premium Jar" (Discord Nitro / Server Boost)
**Jar-centric pricing.**
- **Free Jar:** Basic spinning. Max 5 members. Ads?
- **Premium Jar ($10/mo split or paid by one):**
    - Unlimited members.
    - "Vibe Check" filters (AI-powered "Chill night" vs "Party").
    - Integration with Calendar/Uber.
    - **Pros:** Groups can chip in. "Our group has a premium jar".
    - **Cons:** Friction of payment for a casual friend group.

### Recommended Approach: "The Host Advantage" (Option A)
Focus on the **Creator/Host**.
1.  **Everyone is Free** to join.
2.  **Premium Users** ($4.99/mo or $50 Lifetime) get:
    *   **Unlimited Jar Creation**: Create jars for work friends, gym buddies, etc.
    *   **Superpowers**: When *they* spin the jar, they get 3 options to Vote on (instead of 1).
    *   **No Limits**: Their Jars can have up to 50 members.

This encourages the "Organizer" of the friend group (the person who usually plans things) to buy the app, while their friends can just join for free. This is the highest virality loop.

---

## 3. Migration Plan

1.  **Database Migration**:
    *   Create `Jar` table.
    *   Migrate existing `Couple` records to `Jar` (Type = ROMANTIC).
    *   Create `JarMember` records linking Users to their old Couples.
2.  **UI Update**:
    *   Add "My Jars" list in the Settings/Menu.
    *   Update Dashboard to fetch data based on `activeJarId` instead of `user.coupleId`.
