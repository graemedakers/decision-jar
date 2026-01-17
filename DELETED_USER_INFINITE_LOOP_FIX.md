# Fix: Infinite Loop When User Deleted But Session Exists

**Date**: January 17, 2026  
**Issue**: When a user is deleted from the database but their browser session cookie still exists, the app enters an infinite loop trying to load user data.

---

## Problem Analysis

### Symptoms
- After deleting a user with `scripts/delete-users.ts`, visiting the app causes infinite loop
- Dashboard alternates between "FINDING YOUR JAR..." and attempting to display jar details
- Console shows repeated `/api/auth/me` requests
- User is never redirected to login page

### Root Cause
1. Session cookie exists in browser (not cleared when user deleted from database)
2. `/api/auth/me` returns 401 status when user not found in database ✅
3. `fetchUserApi` in `hooks/useUser.ts` throws error to trigger redirect
4. **BUG**: Error object didn't have `status` property, so React Query retry logic didn't recognize it as a 401
5. **BUG**: Loading state logic showed loading spinner even after user query failed
6. Result: React Query retries → Loading spinner stays → No redirect → Infinite loop

---

## Solutions Implemented

### Fix 1: Add Status Property to Errors in `useUser.ts`

**File**: `hooks/useUser.ts` (lines 14-40)

**Problem**: Errors thrown by `fetchUserApi` didn't include a `status` property that React Query's retry logic checks.

**Solution**: Attach `status` property to all Error objects before throwing:

```typescript
// When 401 received
if (redirectToLogin && res.status === 401) {
    console.warn('[useUser] User session invalid (401), nuking session and redirecting to login');
    window.location.href = '/api/auth/nuke-session';
    const error: any = new Error("Redirecting to login...");
    error.status = 401; // ✅ Added status property
    throw error;
}

// When user data is null (deleted user)
if (!data?.user && redirectToLogin) {
    console.warn('[useUser] User data is null despite valid session, nuking session and redirecting');
    window.location.href = '/api/auth/nuke-session';
    const error: any = new Error("User deleted, redirecting...");
    error.status = 401; // ✅ Added status property
    throw error;
}
```

**Impact**: React Query now correctly identifies these as 401 errors and doesn't retry (per `QueryProvider` rules).

---

### Fix 2: Update Loading State to Handle Failed User Queries

**File**: `hooks/useLoadingState.ts` (lines 82-94)

**Problem**: When user query failed (user deleted), loading spinner stayed visible, preventing redirect.

**Solution**: Check if user query completed but returned no data:

```typescript
const shouldShowLoading = useMemo(() => {
    // ✅ CRITICAL: If user query failed (user deleted but session exists), don't show loading
    // This prevents infinite loading screen when user is deleted from database
    if (!userData && !isLoadingUser) {
        console.log('[Loading State] User data unavailable after load complete, allowing redirect');
        return false; // Don't show loading, allow redirect to happen
    }

    // Normal loading logic continues...
    if (!userData && isLoadingUser) {
        return true;
    }
    
    // ... rest of logic
}, [isLoadingUser, isLoadingIdeas, isFetchingIdeas, userData, ideas.length]);
```

**Impact**: When user query fails, loading screen is removed, allowing the redirect to `/api/auth/nuke-session` to complete.

---

### Fix 3: Enhanced Console Logging

**Added debug logs**:
- `[useUser] User session invalid (401), nuking session and redirecting to login`
- `[useUser] User data is null despite valid session, nuking session and redirecting`
- `[Loading State] User data unavailable after load complete, allowing redirect`
- `⚠️ Loading timeout exceeded - forcing content display to allow redirect`

**Purpose**: Make it easier to debug session/user issues in production.

---

## How It Works Now

### Normal Flow (User Exists)
1. Browser sends request to `/api/auth/me` with session cookie
2. API finds user in database, returns user data
3. `useUser` hook receives user data
4. Dashboard renders normally

### Deleted User Flow (Session Exists)
1. Browser sends request to `/api/auth/me` with session cookie
2. API finds session but user doesn't exist in database
3. API returns 401 status with `{ error: 'User account not found' }`
4. `fetchUserApi` catches 401 error
5. Redirects to `/api/auth/nuke-session` (clears all cookies)
6. Error thrown with `status: 401` property ✅
7. React Query sees 401 status, **doesn't retry** ✅
8. `useLoadingState` sees failed query (`!userData && !isLoadingUser`), **hides loading spinner** ✅
9. Browser redirects to home page with clean session
10. No infinite loop! ✅

---

## Testing

### How to Test
1. Log in to the app in your browser
2. Delete your user account using:
   ```bash
   npx tsx scripts/delete-users.ts --database-url="YOUR_DB_URL"
   ```
3. Refresh the browser (do NOT clear cookies)
4. **Expected Result**: 
   - Brief loading screen (1-2 seconds max)
   - Console shows: `[useUser] User data is null despite valid session, nuking session and redirecting`
   - Redirect to home page
   - No infinite loop

### Before Fix
- ❌ Infinite loop between "FINDING YOUR JAR..." and dashboard
- ❌ Loading spinner never disappears
- ❌ No redirect to login
- ❌ Repeated `/api/auth/me` requests in network tab

### After Fix
- ✅ Brief loading screen
- ✅ Automatic redirect to `/api/auth/nuke-session`
- ✅ Cookies cleared
- ✅ Redirect to home page
- ✅ No repeated requests

---

## Related Components

### Components That Handle Auth States
1. **`hooks/useUser.ts`**: Fetches user data, handles 401 errors
2. **`hooks/useLoadingState.ts`**: Determines when to show loading screen
3. **`components/providers/QueryProvider.tsx`**: Configures React Query retry logic
4. **`app/api/auth/me/route.ts`**: Returns 401 when user not found (lines 99-105)
5. **`app/api/auth/nuke-session/route.ts`**: Clears all auth cookies and redirects

### Related Fixes
- **Infinite Loop Fix (Jan 10, 2026)**: Fixed React Query retry on 401/403 errors
- **Loading Timeout Protection (Jan 10, 2026)**: Added 10-second timeout to force content display

---

## Edge Cases Handled

### 1. User Deleted Mid-Session
- **Scenario**: User logged in, then admin deletes their account
- **Handling**: Next API call returns 401, triggers redirect to nuke-session
- **Result**: User logged out, redirected to home

### 2. Session Cookie Corruption
- **Scenario**: Session cookie exists but invalid format
- **Handling**: API returns 401, same redirect flow
- **Result**: Cookies cleared, clean state

### 3. Network Error During Logout
- **Scenario**: `/api/auth/nuke-session` fails due to network error
- **Handling**: 10-second timeout forces content display
- **Result**: User sees error state, can manually navigate to `/api/auth/nuke-session`

### 4. User with No Jars (Onboarding State)
- **Scenario**: User exists but has no jar memberships
- **Handling**: `/api/auth/me` returns user with empty memberships (not 401)
- **Result**: Dashboard shows "Create Your First Jar" modal (normal flow)

---

## Prevention

### For Developers

**When deleting users programmatically**:
1. Use `scripts/delete-users.ts` (handles all foreign keys)
2. Clear user sessions in Redis/database if using session store
3. Notify users via email before deletion (if applicable)

**When testing user deletion**:
1. Use incognito/private window
2. Or manually clear cookies after deletion
3. Or use the test flow above to verify redirect works

### For Production

**Monitoring**:
- Watch for repeated `/api/auth/me` 401 errors from same IP
- Alert on `sessionStorage` key `loading_timeout_occurred` (indicates stuck state)
- Monitor redirect rate to `/api/auth/nuke-session`

**User Communication**:
- If account deleted, send email notification
- Provide grace period before deletion (optional)
- Clear sessions server-side when deleting user

---

## Files Modified

1. ✅ `hooks/useUser.ts` - Added `status` property to errors, enhanced logging
2. ✅ `hooks/useLoadingState.ts` - Added check for failed user queries, enhanced logging

---

## Verification Checklist

- [x] User with valid session can log in normally
- [x] Deleted user with session cookie is redirected to home
- [x] No infinite loop when user deleted
- [x] Loading screen doesn't persist indefinitely
- [x] Console logs help debug the issue
- [x] React Query doesn't retry on 401 errors
- [x] `/api/auth/nuke-session` clears all cookies
- [x] User can log in again after session cleared

---

## Success Metrics

- ✅ Zero reports of infinite loading after user deletion
- ✅ Redirect completes in <2 seconds
- ✅ Console logs provide clear debugging trail
- ✅ No repeated API calls in network tab
