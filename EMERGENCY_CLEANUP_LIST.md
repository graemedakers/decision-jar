# EMERGENCY: Remove All Community Jar Code References

## Files that need immediate cleanup:
1. app/api/auth/me/route.ts - Line 144: Remove isCommunityJar from response
2. app/dashboard/page.tsx - Lines 126, 153, 175, 187, 201, 433, 460: Remove all isCommunityJar usage
3. app/api/ideas/route.ts - Lines 81, 195, 210, 219, 225: Remove community jar logic
4. app/api/jars/[id]/route.ts - Lines 50, 54, 55: Remove isCommunityJar updates
5. app/api/jars/list/route.ts - Line 46: Remove from response
6. app/explore/page.tsx - Line 134: Remove community jar filter

## Quick Fix Strategy:
Replace all `isCommunityJar` checks with `false` or remove the conditionals entirely

## Critical files to fix NOW:
- app/api/auth/me/route.ts (MOST CRITICAL - causes 500 error)
- app/api/ideas/route.ts
- app/dashboard/page.tsx
