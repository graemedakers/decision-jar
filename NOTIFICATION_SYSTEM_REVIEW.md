# Notification System Review - Decision Jar

**Date:** 2026-01-19
**Scope:** Review of notification implementation (Push, Real-time, Email)

---

## Executive Summary

The notification system review has identified and **resolved** key critical issues. The system now includes a robust real-time synchronization engine and improved email deliverability UX. Push notifications for core events (Idea Added, Jar Spun) and voting sessions have been patched to respect user preferences.

---

## Architecture Overview

### Core Components

1. **`lib/notifications.ts`**
   - `sendPushNotification(userId, payload)` - Sends to individual user
   - `notifyJarMembers(jarId, excludeUserId, payload, preferenceKey?)` - Sends to jar members with preference filtering

2. **Notification Preferences (User Model)**
   - `notifyStreakReminder` - Daily streak reminders
   - `notifyAchievements` - Achievement unlocks
   - `notifyLevelUp` - Level up events
   - `notifyIdeaAdded` - **New ideas added to shared jar**
   - `notifyJarSpun` - **Jar spin events**

3. **Push Subscription Storage**
   - `PushSubscription` model stores user device endpoints
   - Supports multiple devices per user
   - Auto-cleanup of expired subscriptions (410/404 status codes)

---

## Recent Implementation Updates (Jan 2026)

### 1. Real-time Synchronization
Implemented a robust real-time update system to ensure all jar members see changes instantly.
*   **Architecture:** Hybrid approach using Supabase Realtime broadcasts + Polling fallback.
*   **Components:**
    *   `useSquadMode` hook: Manages Supabase channels and listens for `content-update` events.
    *   `useIdeaMutations`: Dispatches local `decision-jar:broadcast` events upon successful mutations (Add/Update/Delete).
    *   `useIdeas`: Implements a 4-second polling interval and 5-second stale time to guarantee consistency even if broadcasts fail.
*   **Fallback:** If real-time sockets fail, the polling mechanism ensures UI updates within 4 seconds.

### 2. Push Notification Fixes
*   **Idea Added:** Now correctly uses `notifyJarMembers` with the `notifyIdeaAdded` preference key.
*   **Jar Spun:** Refactored to use `notifyJarMembers` with the `notifyJarSpun` preference key, deduplicating logic.

### 3. Email UX Improvements
*   Added helpful "Check your spam/junk folder" prompts to Forgot Password and Signup Verification screens.
*   Configurable Sender Email via `EMAIL_FROM` environment variable to support DKIM-verified custom domains.

### 4. Vote Notification Preferences
*   Added `notifyVoting` preference to User Schema (default: true).
*   Updated `lib/notifications.ts` helper and `app/api/jars/[id]/vote/route.ts` to enforce this preference.
*   Added UI toggle in `NotificationPreferences` component.

---

## Critical Issues Found

### 🟢 [RESOLVED] Issue 1: Missing Preference Key in Idea Addition Notifications

**Location:** `app/api/ideas/route.ts` (line 126) and `app/actions/ideas.ts` (line 113)

**Problem:**
```typescript
notifyJarMembers(currentJarId, session.user.id, {
    title: `💡 ${session.user.name || 'Someone'} added a new idea`,
    body: isSecretIdea ? '🤫 It\'s a secret... spin to find out!' : description,
    url: '/jar',
    icon: '/icon-192.png'
}).catch(err => console.error("Notification error:", err));
```

**Missing:** The 4th parameter `preferenceKey: 'notifyIdeaAdded'` is not provided.

**Impact:** 
- ALL jar members receive notifications regardless of their preference settings
- Users who disabled "New Idea" notifications still get spammed
- No way to opt-out of idea notifications

**Fix Required:**
```typescript
notifyJarMembers(currentJarId, session.user.id, {
    title: `💡 ${session.user.name || 'Someone'} added a new idea`,
    body: isSecretIdea ? '🤫 It\'s a secret... spin to find out!' : description,
    url: '/jar',
    icon: '/icon-192.png'
}, 'notifyIdeaAdded'); // ← ADD THIS
```

---

### 🟢 [RESOLVED] Issue 2: Jar Spin Notifications Don't Use Preference System

**Location:** `app/actions/spin.ts` (lines 124-131)

**Problem:**
```typescript
const notificationPromises = members.map(member =>
    sendPushNotification(member.userId, {
        title: `🎯 New pick: "${selectedIdea.description}"`,
        body: `${session.user.name || 'Someone'} selected this from your jar!`,
        url: `/jar?selected=${selectedIdea.id}`,
        icon: selectedIdea.photoUrls?.[0] || '/icon-192.png'
    })
);
```

**Issues:**
1. Uses `sendPushNotification` directly instead of `notifyJarMembers`
2. No preference filtering - sends to ALL members
3. Manually queries members instead of using the helper function
4. Doesn't respect `notifyJarSpun` preference

**Impact:**
- Users cannot disable jar spin notifications
- Inefficient code duplication
- Inconsistent with other notification patterns

**Fix Required:**
Replace the manual member query and notification loop with:
```typescript
await notifyJarMembers(currentJarId, session.user.id, {
    title: `🎯 New pick: "${selectedIdea.description}"`,
    body: `${session.user.name || 'Someone'} selected this from your jar!`,
    url: `/jar?selected=${selectedIdea.id}`,
    icon: selectedIdea.photoUrls?.[0] || '/icon-192.png'
}, 'notifyJarSpun');
```

---

### � [RESOLVED] Issue 3: Vote Notifications Missing Preference Key

**Location:** `app/api/jars/[id]/vote/route.ts`

**Problem:**
Vote-related notifications were sent to all jar members without checking preferences.

**Resolution:**
- Added `notifyVoting` boolean to User schema.
- Updated `notifyJarMembers` to support `notifyVoting` key.
- Updated all `notifyJarMembers` calls in vote route to pass this key.

---

### 🟢 Issue 4: Achievement/Level Notifications (Working Correctly)

**Location:** `lib/achievements.ts` (line 76) and `lib/gamification.ts` (line 133)

**Status:** ✅ **Correctly implemented**

These properly use the preference system:
```typescript
notifyJarMembers(jarId, null, {
    title: `🏆 Achievement Unlocked!`,
    body: `${user.name} unlocked "${achievement.name}"!`,
    url: '/dashboard'
}, 'notifyAchievements');
```

---

## Additional Observations

### 1. VAPID Configuration Warning
The system logs a warning if VAPID keys aren't configured but continues silently. This could lead to confusion in production if notifications aren't working.

**Recommendation:** Add health check endpoint to verify notification system status.

### 2. Notification URL Patterns Inconsistent
- Ideas: `/jar`
- Spin: `/jar?selected=${id}`
- Vote: `/dashboard?jarId=${jarId}&mode=vote`
- Achievements: `/dashboard`

**Recommendation:** Standardize URL patterns for better deep-linking.

### 3. No Notification History/Logging
There's no persistent record of sent notifications for debugging or user review.

**Recommendation:** Add `NotificationLog` table to track sent notifications.

### 4. Missing Notification Types
No notifications for:
- User joins jar (could notify admins)
- User leaves jar (could notify admins)
- Jar settings changed
- Memory captured (could notify jar members)

### 5. Timezone Handling
Notification times don't account for user timezones. The cron job for streak reminders sends at a fixed UTC time.

---

## Testing Checklist

To verify fixes, test these scenarios:

### Idea Addition Notifications
- [ ] User A adds idea to shared jar
- [ ] User B (with `notifyIdeaAdded: true`) receives notification
- [ ] User C (with `notifyIdeaAdded: false`) does NOT receive notification
- [ ] Private/surprise ideas show masked content in notification

### Jar Spin Notifications
- [ ] Admin spins jar
- [ ] Other members (with `notifyJarSpun: true`) receive notification
- [ ] Members with `notifyJarSpun: false` do NOT receive notification
- [ ] Spinner does not receive their own notification

### Vote Notifications
- [ ] Admin starts vote → all members notified
- [ ] Vote completes → all members notified
- [ ] Tie/runoff → all members notified
- [ ] Preference filtering works (once implemented)

### Preference Changes
- [ ] User can toggle preferences in settings
- [ ] Changes persist across sessions
- [ ] Changes take effect immediately

---

## Priority Fixes

### High Priority (Breaks User Experience)
1. ✅ Add `'notifyIdeaAdded'` preference key to idea notifications
2. ✅ Refactor spin notifications to use `notifyJarMembers` with `'notifyJarSpun'`

### Medium Priority (Feature Gaps)
3. 🟢 [RESOLVED] Add `notifyVoting` preference to schema
4. 🟢 [RESOLVED] Apply voting preference to all vote notifications
5. Add notification for jar joins/leaves

### Low Priority (Nice to Have)
6. Standardize notification URLs
7. Add notification history/logging
8. Implement timezone-aware scheduling
9. Add notification health check endpoint

---

## Recommended Code Changes

### 1. Fix Idea Notifications (2 locations)

**File:** `app/api/ideas/route.ts` (line 126)
```typescript
// BEFORE
notifyJarMembers(currentJarId, session.user.id, {
    title: `💡 ${session.user.name || 'Someone'} added a new idea`,
    body: isSecretIdea ? '🤫 It\'s a secret... spin to find out!' : (description.length > 60 ? description.substring(0, 57) + '...' : description),
    url: '/jar',
    icon: '/icon-192.png'
}).catch(err => console.error("Notification error:", err));

// AFTER
notifyJarMembers(currentJarId, session.user.id, {
    title: `💡 ${session.user.name || 'Someone'} added a new idea`,
    body: isSecretIdea ? '🤫 It\'s a secret... spin to find out!' : (description.length > 60 ? description.substring(0, 57) + '...' : description),
    url: '/jar',
    icon: '/icon-192.png'
}, 'notifyIdeaAdded').catch(err => console.error("Notification error:", err));
```

**File:** `app/actions/ideas.ts` (line 113)
```typescript
// Same fix as above
```

### 2. Fix Spin Notifications

**File:** `app/actions/spin.ts` (lines 114-133)
```typescript
// BEFORE
const members = await prisma.jarMember.findMany({
    where: {
        jarId: currentJarId,
        userId: { not: session.user.id }
    },
    include: { user: true }
});

const notificationPromises = members.map(member =>
    sendPushNotification(member.userId, {
        title: `🎯 New pick: "${selectedIdea.description}"`,
        body: `${session.user.name || 'Someone'} selected this from your jar!`,
        url: `/jar?selected=${selectedIdea.id}`,
        icon: selectedIdea.photoUrls?.[0] || '/icon-192.png'
    })
);

await Promise.allSettled(notificationPromises);

// AFTER
await notifyJarMembers(currentJarId, session.user.id, {
    title: `🎯 New pick: "${selectedIdea.description}"`,
    body: `${session.user.name || 'Someone'} selected this from your jar!`,
    url: `/jar?selected=${selectedIdea.id}`,
    icon: selectedIdea.photoUrls?.[0] || '/icon-192.png'
}, 'notifyJarSpun');
```

---

## Conclusion

The notification infrastructure is well-designed with proper preference filtering capabilities, but **implementation is incomplete**. The two critical issues (idea and spin notifications) bypass the preference system entirely, making it impossible for users to control their notification experience.

**Estimated Fix Time:** 30 minutes  
**Risk Level:** Low (isolated changes, well-tested helper function)  
**User Impact:** High (currently users cannot opt-out of notifications)
