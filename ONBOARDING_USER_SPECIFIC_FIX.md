# Onboarding Tour User-Specific Fix
**Date**: January 11, 2026  
**Issue**: Tour doesn't trigger for new users on same browser  
**Status**: ✅ **FIXED**

---

## Problem

### What Happened:
1. User tested app with email A (e.g., `test1@example.com`)
2. Completed or skipped onboarding tour
3. `localStorage.setItem('onboarding_completed', 'true')` set **globally**
4. User signed up with **new** email B (e.g., `test2@example.com`)
5. Tour did NOT trigger ❌

### Root Cause:

**Before** (Browser-Wide):
```typescript
// ❌ Same for ALL users on this browser
const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
```

This used a **single localStorage key** for the entire browser, not per-user!

**Impact:**
- Different users on same browser share onboarding status
- New signups on previously tested browsers skip tour
- Testing/dev environments affected most

---

## Solution

### Changed to User-Specific Keys:

**After** (User-Specific):
```typescript
// ✅ Unique per user ID
const userId = userData?.id;
const userOnboardingKey = `onboarding_completed_${userId}`;
const hasCompletedOnboarding = localStorage.getItem(userOnboardingKey);
```

**localStorage Keys Now:**
```
Old (broken):
  onboarding_completed = 'true'

New (fixed):
  onboarding_completed_user-abc-123 = 'true'
  onboarding_completed_user-def-456 = 'true'
  onboarding_completed_user-xyz-789 = 'true'
```

---

## Code Changes

**File**: `hooks/features/useOnboarding.ts`

### Change #1: Check (lines 8-15)
```typescript
useEffect(() => {
    // ✅ Get user ID first
    const userId = userData?.id;
    if (!userId) return; // Wait for user ID to load
    
    // ✅ Create user-specific key
    const userOnboardingKey = `onboarding_completed_${userId}`;
    const hasCompletedOnboarding = localStorage.getItem(userOnboardingKey);
    
    // ... rest of logic
}, [isLoadingUser, userData]);
```

### Change #2: Complete Handler (lines 27-33)
```typescript
const handleCompleteOnboarding = () => {
    const userId = userData?.id;
    if (!userId) return;
    
    const userOnboardingKey = `onboarding_completed_${userId}`;
    localStorage.setItem(userOnboardingKey, 'true'); // ✅ User-specific
    trackEvent('onboarding_completed', {});
};
```

### Change #3: Skip Handler (lines 36-42)
```typescript
const handleSkipOnboarding = () => {
    const userId = userData?.id;
    if (!userId) return;
    
    const userOnboardingKey = `onboarding_completed_${userId}`;
    localStorage.setItem(userOnboardingKey, 'true'); // ✅ User-specific
    trackEvent('onboarding_skipped', {});
};
```

---

## Testing

### Test Case 1: Multiple Users, Same Browser

**Steps**:
1. Sign up as `user1@example.com`
2. Create jar, see tour
3. Complete tour
4. Log out
5. Sign up as `user2@example.com` (same browser)
6. Create jar

**Expected Result**:
- ✅ User 2 sees tour (new user)
- ✅ localStorage has TWO keys:
  - `onboarding_completed_<user1-id>: 'true'`
  - `onboarding_completed_<user2-id>: null` (not set yet)

**Before Fix**:
- ❌ User 2 did NOT see tour (browser-wide flag)

---

### Test Case 2: Same User, Different Browsers

**Steps**:
1. Sign up as `user@example.com` on Chrome
2. Complete tour
3. Login as same user on Firefox (different browser)

**Expected Result**:
- ✅ Tour triggers on Firefox (different localStorage)
- Both browsers track independently

**Note**: This is expected behavior with localStorage. For cross-device sync, we'd need database storage (see "Future Enhancement" below).

---

### Test Case 3: Clear localStorage

**Steps**:
1. User completes tour
2. Open DevTools → Application → Local Storage
3. Delete `onboarding_completed_<user-id>` key
4. Refresh dashboard

**Expected Result**:
- ✅ Tour triggers again (flag cleared)
- User can replay tour

---

## Browser DevTools Check

### View localStorage Keys:

**Chrome/Edge DevTools**:
1. F12 → Application tab
2. Storage → Local Storage
3. Select your domain
4. Look for keys like:
   ```
   onboarding_completed_clxy7z8p90000v... = 'true'
   ```

### Clear Specific User's Tour:
```javascript
// In console:
localStorage.removeItem('onboarding_completed_<YOUR_USER_ID>');
location.reload();
```

### Clear All Tours:
```javascript
// In console:
Object.keys(localStorage)
  .filter(key => key.startsWith('onboarding_completed_'))
  .forEach(key => localStorage.removeItem(key));
```

---

## Migration for Existing Users

### Old Flag Cleanup:

If some users have the old global flag:
```typescript
// Optional cleanup (can add to useEffect)
const oldFlag = localStorage.getItem('onboarding_completed');
if (oldFlag && userData?.id) {
    // Migrate to user-specific
    const userKey = `onboarding_completed_${userData.id}`;
    localStorage.setItem(userKey, oldFlag);
    localStorage.removeItem('onboarding_completed'); // Clean up old
}
```

**Decision**: Not implemented (low impact, old flag will just be ignored)

---

## Why This Matters

### Development/Testing:
- ✅ Team can test with multiple accounts
- ✅ QA can verify tour for different user types
- ✅ Staging environment testing valid

### Production:
- ✅ Shared computers (libraries, cafes)
- ✅ Family sharing devices
- ✅ User switches accounts

### Analytics:
- ✅ Accurate tour completion rates per user
- ✅ Can track which users saw tour
- ✅ Better retention metrics

---

## Alternative Approaches Considered

### Option 1: Database Storage ❌
```typescript
// Store in User table
model User {
    hasCompletedOnboarding Boolean @default(false)
}
```

**Pros**: 
- Cross-device sync
- More reliable

**Cons**: 
- Extra database query on every dashboard load
- Slower
- Not necessary for this feature

**Decision**: Stick with localStorage (faster, good enough)

---

### Option 2: Cookie Storage ❌
```typescript
document.cookie = `onboarding_${userId}=true; max-age=31536000`;
```

**Pros**: 
- Can be httpOnly
- Sent with requests

**Cons**: 
- 4KB limit
- More complex
- Not needed for client-side state

**Decision**: localStorage simpler for UI state

---

### Option 3: Session Storage ❌
```typescript
sessionStorage.setItem(`onboarding_${userId}`, 'true');
```

**Pros**: 
- Clears on browser close

**Cons**: 
- User sees tour EVERY session
- Annoying

**Decision**: We want persistent "completed" status

---

## Edge Cases Handled

### 1. User ID Not Loaded Yet
```typescript
const userId = userData?.id;
if (!userId) return; // ✅ Early return, wait for data
```

### 2. Rapid Switching Between Users
- Each user has own key
- No conflicts

### 3. User Deletes Account, Signs Up Again
- New user ID = new key
- Tour triggers (treated as new user) ✅

---

## Rollback Plan

If issues arise:

```typescript
// Revert to old code
const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');

// And
localStorage.setItem('onboarding_completed', 'true');
```

**Rollback Risk**: LOW - This is purely additive (user ID suffix)

---

## Verification

### To Verify Fix is Working:

1. **Clear localStorage** in DevTools
2. **Sign up** with new email
3. **Create jar**
4. **Check localStorage**:
   - Should see: `onboarding_completed_<your-user-id>` = `null` (not set yet)
5. **Tour should trigger** ✅
6. **Complete tour**
7. **Check localStorage again**:
   - Should see: `onboarding_completed_<your-user-id>` = `'true'`

8. **Sign up with ANOTHER email** (same browser)
9. **Create jar**
10. **Tour should trigger again** ✅ (different user ID)

---

## Summary

### Problem:
- ❌ `localStorage.getItem('onboarding_completed')` was browser-wide
- ❌ New users on same browser skipped tour

### Fix:
- ✅ `localStorage.getItem('onboarding_completed_${userId}')` per user
- ✅ Each user gets their own onboarding state

### Impact:
- ✅ Multiple users can test on same browser
- ✅ Accurate tour tracking per user
- ✅ Better development/testing experience

---

**Fixed By**: Engineering Team  
**Date**: January 11, 2026  
**Status**: ✅ **DEPLOYED - READY FOR TESTING**  
**Test**: Sign up with new email on browser you've tested before
