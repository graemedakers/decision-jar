# Deleted User Infinite Loop Fix - Version 2

## Date
January 17, 2026

## Problem Summary
After deleting a user from the database, if their browser session cookie persisted, the app would enter an infinite loop alternating between:
1. "FINDING YOUR JAR..." loading screen
2. Dashboard attempting to render

### Root Causes Identified

**Primary Issue**: Multiple hooks were attempting to fetch data even when user was deleted/null:
- `useFavorites` hook was not checking if user exists before fetching
- Both `useFavorites` and `useIdeas` were not properly attaching `status` to thrown errors

**Secondary Issue**: These failed requests caused:
- 401 errors on `/api/favorites` and `/api/ideas`
- React Query retry logic triggering (even though we have global retry prevention for 401s)
- Multiple hooks refetching simultaneously
- Loading state toggling between showing and hiding

## Console Errors Observed
```
GET http://localhost:3000/api/favorites 401 (Unauthorized)
[useUser] User data is null despite valid session, nuking session and redirecting
[Loading State] User data unavailable after load complete, allowing redirect
[SW] Skipping API route: /api/auth/nuke-session
```

The service worker log is **not** an issue - it's correctly NOT intercepting the API route.

## Solutions Implemented

### 1. Fixed `useFavorites` Hook (`hooks/useFavorites.ts`)

**Changes**:
- ✅ Added `useUser` import and hook call
- ✅ Added `enabled: !!userData` to prevent fetching when no user exists
- ✅ Added `error.status = res.status` to thrown errors for React Query

```typescript
export function useFavorites() {
    const queryClient = useQueryClient();
    const { userData } = useUser({ redirectToLogin: false }); // ✅ NEW

    const query = useQuery({
        queryKey: CacheKeys.favorites(),
        queryFn: fetchFavoritesApi,
        staleTime: STALE_TIME.FAVORITES,
        enabled: !!userData, // ✅ NEW - Only fetch if we have user data
    });
    // ...
}
```

**In `fetchFavoritesApi`**:
```typescript
const fetchFavoritesApi = async (): Promise<Idea[]> => {
    const res = await fetch(getApiUrl('/api/favorites'), { credentials: 'include' });
    if (!res.ok) {
        const error: any = new Error("Failed to fetch favorites");
        error.status = res.status; // ✅ NEW - Attach status for React Query
        throw error;
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
};
```

### 2. Fixed `useIdeas` Hook (`hooks/useIdeas.ts`)

**Changes**:
- ✅ Added `error.status = res.status` to thrown errors (already had `enabled: !!userData`)

```typescript
const fetchIdeasApi = async (): Promise<Idea[]> => {
    const res = await fetch(getApiUrl('/api/ideas'), { credentials: 'include' });
    if (!res.ok) {
        const error: any = new Error("Failed to fetch ideas");
        error.status = res.status; // ✅ NEW - Attach status for React Query
        throw error;
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
};
```

### 3. Previous Fixes (Still Active)

These fixes from the first attempt are still in place and working:

**`hooks/useUser.ts`**:
- ✅ `fetchUserApi` throws error with `status: 401` when user is null
- ✅ Redirects to `/api/auth/nuke-session` when user is deleted

**`hooks/useLoadingState.ts`**:
- ✅ Returns `false` (hides loading) when `!userData && !isLoadingUser`
- ✅ 10-second timeout to force content display if stuck

**`components/providers/QueryProvider.tsx`**:
- ✅ Global retry prevention for 401/403 errors

## Why These Fixes Work Together

1. **`useUser`** detects deleted user → throws 401 error → triggers redirect to `/api/auth/nuke-session`

2. **`useLoadingState`** detects `!userData && !isLoadingUser` → hides loading spinner → allows redirect to proceed

3. **`useFavorites` and `useIdeas`** now have `enabled: !!userData` → **prevent 401 requests entirely** when no user exists → eliminates the trigger for re-renders

4. **Error status attachment** ensures React Query's global retry logic can correctly identify 401 errors and not retry

## Expected Behavior After Fix

### Scenario: Deleted User Session Persists

1. App loads, tries to fetch user data
2. `/api/auth/me` returns null user
3. `useUser` detects null user → logs warning → redirects to `/api/auth/nuke-session`
4. `useLoadingState` hides loading spinner (no longer blocks redirect)
5. **`useFavorites` and `useIdeas` DO NOT attempt to fetch** (queries are disabled)
6. User is logged out and redirected to login page
7. **No infinite loop, no 401 errors**

## Testing Instructions

### Local Testing

1. **Start the app**: `npm run dev`

2. **Log in as a test user** (e.g., `test@example.com`)

3. **Open DevTools Console** (F12)

4. **Delete the user from the database**:
   ```bash
   npx tsx scripts/delete-users.ts test@example.com
   ```

5. **Refresh the browser** (F5)

6. **Expected console output**:
   ```
   [useUser] User data is null despite valid session, nuking session and redirecting
   [Loading State] User data unavailable after load complete, allowing redirect
   ```

7. **Expected behavior**:
   - Brief "FINDING YOUR JAR..." loading screen
   - Redirect to `/api/auth/nuke-session`
   - Redirect to login page
   - **NO 401 errors on `/api/favorites` or `/api/ideas`**
   - **NO infinite loop**

### Production Testing (After Deployment)

Same steps as above, but use production database and production URL.

## Files Modified

1. `hooks/useFavorites.ts` - Added user check, enabled condition, error status
2. `hooks/useIdeas.ts` - Added error status to thrown errors
3. `DELETED_USER_INFINITE_LOOP_FIX_V2.md` - This documentation

## Deployment Checklist

- [ ] Commit changes with message: `fix: prevent infinite loop when deleted user session persists (v2)`
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Test in production with deleted user scenario
- [ ] Monitor Vercel logs for any errors
- [ ] Check PostHog for any error events

## Rollback Plan

If this fix causes issues:

1. Revert commits:
   ```bash
   git revert HEAD~1
   git push origin main
   ```

2. Vercel will auto-deploy the revert

3. Original behavior will be restored

## Notes

- The service worker is **not** interfering with the redirect. The console log `[SW] Skipping API route` is informational only.
- The key insight was that **preventing the 401 requests entirely** (via `enabled` conditions) is better than just handling them after they occur.
- This fix complements the previous fixes by eliminating the source of the re-render triggers.

## Success Criteria

✅ No 401 errors on `/api/favorites` or `/api/ideas` when user is deleted
✅ Clean redirect to login page within 1-2 seconds
✅ No infinite loop between loading and dashboard
✅ Console shows clear redirect logs
✅ No React Query retry attempts for deleted user scenario
