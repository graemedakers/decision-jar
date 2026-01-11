# Guided Onboarding Tour - Trigger Strategy
**Date**: January 11, 2026  
**Status**: ✅ **OPTIMIZED**

---

## Current Implementation

The guided onboarding tour triggers when **ALL** of the following conditions are met:

### ✅ Trigger Conditions

1. **User has never completed the tour**
   - `localStorage.getItem('onboarding_completed') === null`

2. **User data is fully loaded**
   - `!isLoadingUser && userData !== null`

3. **User has a personal jar**
   - User has at least one membership with role `ADMIN` or `OWNER`
   - Ensures user is not just in community jars (BUGRPT, FEATREQ)

4. **Dashboard has loaded**
   - Triggers **1 second** after dashboard renders
   - Gives UI time to settle before tour starts

### 📍 Code Location

**File**: `hooks/features/useOnboarding.ts` (lines 8-24)

```typescript
useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    
    // Check if user has at least one jar where they are ADMIN (personal jar)
    const hasPersonalJar = userData?.memberships?.some(
        (m: any) => m.role === 'ADMIN' || m.role === 'OWNER'
    );
    
    // Only show onboarding if:
    // 1. Never completed before
    // 2. User data fully loaded
    // 3. User is authenticated
    // 4. User has a personal jar (not just community jar membership)
    if (!hasCompletedOnboarding && !isLoadingUser && userData && hasPersonalJar) {
        setTimeout(() => setShowOnboarding(true), 1000); // 1-second delay
    }
}, [isLoadingUser, userData]);
```

---

## User Journey & Tour Trigger Points

### 🎯 Scenario 1: Email Signup with Topic (Ideal Path)

```
1. User signs up: /signup
   └─ Form: name, email, password, topic = "Activities"
   
2. Email verification
   └─ User clicks verification link
   
3. Login redirect
   └─ Redirect to /dashboard
   
4. Personal jar already exists
   └─ "User's Activities Jar" created during signup
   └─ activeJarId set
   
5. Dashboard loads
   └─ User data loads (has personal jar ✅)
   └─ 1 second delay
   
6. 🎓 TOUR TRIGGERS
   └─ "👋 Welcome to Decision Jar!"
   └─ Shows 11-step guided tour
   └─ User learns: Add ideas, spin jar, explore features
```

**Timeline**: ~3-5 seconds after dashboard loads

---

### 🎯 Scenario 2: OAuth Signup (Google/Facebook) - NEW FLOW

```
1. User signs up: OAuth (Google/Facebook)
   └─ No topic selected during OAuth flow
   
2. Auto-verified, redirect to /dashboard
   └─ activeJarId = null (no jar yet)
   
3. Dashboard detects no personal jar
   └─ "Create Your First Jar" modal appears
   
4. User creates jar
   └─ Modal: Name = "Date Ideas", Topic = "Dates", Mode = "Spin"
   └─ Jar created successfully
   └─ activeJarId set to new jar
   
5. Modal closes, dashboard refreshes
   └─ User data reloads (now has personal jar ✅)
   └─ 1 second delay
   
6. 🎓 TOUR TRIGGERS
   └─ Tour starts in newly created jar
```

**Timeline**: ~5-8 seconds after creating jar

---

### 🎯 Scenario 3: Invite Link Signup

```
1. User clicks invite link: /signup?code=ABC123
   └─ Joins existing shared jar
   
2. Email verification + login
   └─ activeJarId = shared jar (role = MEMBER)
   
3. Dashboard loads
   └─ Shows shared jar with existing ideas
   └─ "Create Your First Jar" modal appears
   
4. User can:
   
   Option A: Create personal jar now
   └─ Creates jar → Tour triggers (as in Scenario 2)
   
   Option B: Dismiss modal, use shared jar
   └─ No personal jar yet (role = MEMBER only)
   └─ ❌ Tour does NOT trigger (no ADMIN/OWNER jar)
   
   Option C: Create personal jar later
   └─ From jar switcher: "+ New Jar"
   └─ After creation → Next dashboard load → Tour triggers ✅
```

**Decision Point**: Should invited users see tour in shared jar?

**Current Behavior**: NO - Tour waits until personal jar created  
**Rationale**: Shared jar may have different purpose; personal jar tour is more relevant

---

### 🎯 Scenario 4: User Skips/Dismisses Jar Creation

```
1. OAuth user lands on dashboard
   └─ "Create Your First Jar" modal appears
   
2. User dismisses modal (clicks X or Cancel)
   └─ No personal jar created
   └─ sessionStorage flag set: 'create_first_jar_prompt'
   
3. User browses dashboard
   └─ Can view community jars (BUGRPT, FEATREQ)
   └─ ❌ Tour does NOT trigger (no personal jar)
   
4. User creates jar later
   └─ Via navbar: "+ New Jar" or jar switcher
   └─ After creation → Returns to dashboard
   └─ 🎓 Tour triggers on next page load ✅
```

**Improvement Opportunity**: Could show a gentler prompt like:
> "👋 Create your first jar to see a quick tour of Decision Jar!"

---

## Why "Has Personal Jar" is Required

### ✅ Benefits of This Approach:

1. **Relevant Context**
   - Tour shows "Add Your First Idea" in user's own jar
   - User can immediately try features (add, spin, etc.)
   - Avoids confusion of touring community jars

2. **Better Engagement**
   - User is invested (just created jar)
   - More likely to complete tour
   - Can experiment with own content

3. **Prevents Edge Cases**
   - No tour in empty community jars (BUGRPT)
   - No tour for users who only joined invite
   - No tour for users exploring without commitment

4. **Clearer Navigation**
   - Tour targets: `[data-tour="add-idea-button"]`
   - These elements exist in personal jars
   - User has permission to interact

### ❌ Problems This Prevents:

1. **OAuth users landing in BUGRPT**
   - Old bug: Tour triggered in empty community jar
   - User tried to add ideas to bug reports (wrong context)

2. **Invite-only users**
   - User in shared jar, not admin
   - Tour says "Add Your First Idea" but jar has 20 ideas already
   - Confusing and irrelevant

3. **Community jar members**
   - User only has BUGRPT/FEATREQ membership
   - Tour not applicable to feedback submission

---

## Tour Completion & Replay

### Completion:
```typescript
handleCompleteOnboarding() {
    localStorage.setItem('onboarding_completed', 'true');
    trackEvent('onboarding_completed', {});
}
```

### Skip:
```typescript
handleSkipOnboarding() {
    localStorage.setItem('onboarding_completed', 'true');
    trackEvent('onboarding_skipped', {});
}
```

### Replay:
- User can manually restart tour from Settings menu
- Clears `localStorage` flag and refreshes
- Tour triggers again on next dashboard load

---

## Optimal Trigger Timing

### Current: **1 Second Delay**

```typescript
setTimeout(() => setShowOnboarding(true), 1000);
```

**Rationale**:
- ✅ Gives UI time to render fully
- ✅ Allows animations to complete
- ✅ Prevents tour from blocking initial load
- ✅ User sees dashboard briefly before tour starts

**Could be adjusted to**:
- **Instant (0ms)**: More aggressive, might feel rushed
- **2 seconds**: Safer for slow connections, might feel delayed
- **On first interaction**: Wait for user to click something (too passive)

**Recommendation**: Keep at **1 second** - Good balance

---

## Alternative Trigger Strategies (Not Implemented)

### 1. **Progressive Disclosure**
```
Step 1: Welcome message only (modal)
Step 2: User dismisses, sees dashboard
Step 3: After 10 seconds idle → "Want a tour?" prompt
Step 4: User clicks "Yes" → Tour starts
```

**Pros**: Less intrusive  
**Cons**: Lower completion rate

---

### 2. **Action-Triggered Tour**
```
Step 1: User lands on dashboard (no tour)
Step 2: User clicks "Add Idea" button
Step 3: Tour starts: "Great! Let's walk through adding an idea..."
```

**Pros**: Contextual, user-initiated  
**Cons**: User might not discover tour

---

### 3. **Deferred Tour**
```
Step 1: User creates jar, sees dashboard
Step 2: Tour does NOT trigger
Step 3: User adds 1-2 ideas manually
Step 4: After 3rd idea → "You're doing great! Want a tour of advanced features?"
```

**Pros**: User already engaged  
**Cons**: Misses explaining basics

---

## Metrics to Track

### Tour Engagement:
- **Trigger Rate**: % of new users who see tour
- **Completion Rate**: % who complete all 11 steps
- **Skip Rate**: % who skip/close early
- **Step Dropoff**: Which step do users abandon at?

### User Outcomes:
- **Ideas Added**: Users who complete tour vs. those who skip
- **First Spin**: Time to first jar spin (tour vs. no tour)
- **Retention**: 7-day retention (tour vs. no tour)

### Current Targets:
- Trigger Rate: **80%+** (users with personal jar)
- Completion Rate: **65%+**
- Skip Rate: **<35%**

---

## Recommendations

### ✅ Current Implementation is Good

The current trigger logic is well-designed:
1. ✅ Waits for personal jar (avoids confusion)
2. ✅ 1-second delay (smooth UX)
3. ✅ Can be replayed (user control)
4. ✅ Tracks completion (analytics)

### 🔄 Possible Improvements:

1. **Add "Tour" Button on Dashboard**
   ```tsx
   {!hasCompletedOnboarding && (
       <button onClick={() => setShowOnboarding(true)}>
           🎓 Start Tour
       </button>
   )}
   ```

2. **Show Tour Reminder After 1st Idea**
   ```tsx
   if (ideasAdded === 1 && !hasCompletedOnboarding) {
       showNotification("Nice! Want a tour of other features?");
   }
   ```

3. **Context-Aware Tour**
   ```tsx
   // Different tour for invite users vs. creators
   const tourSteps = userRole === 'MEMBER' 
       ? COLLABORATIVE_TOUR_STEPS 
       : PERSONAL_JAR_TOUR_STEPS;
   ```

---

## Summary: When Does Tour Trigger?

### ✅ Tour Triggers When:
1. User has **personal jar** (ADMIN/OWNER role)
2. User has **never completed** tour before
3. Dashboard **fully loaded** (1 second delay)
4. User is **authenticated**

### ❌ Tour Does NOT Trigger When:
1. User only in **community jars** (BUGRPT, FEATREQ)
2. User is **MEMBER** of shared jar (no personal jar)
3. User **dismissed jar creation** (no jar yet)
4. Tour **already completed** (`localStorage` flag set)

### 🎯 Best Case Scenario:
```
Signup → Create Jar → Dashboard → 🎓 Tour (1s delay) → Complete → Start using app!
```

**Total Time to Tour**: ~5-10 seconds after jar creation

---

**Document Created**: January 11, 2026  
**Status**: ✅ Current implementation optimal  
**Next Review**: After analyzing tour completion metrics
