# Complete Testing Checklist
**Date**: January 11, 2026  
**Scope**: Critical + High Priority Fixes  
**Status**: 🔄 **READY FOR TESTING**

---

## Overview

This checklist covers testing for **all fixes** implemented:
- ✅ **4 Critical fixes**
- ✅ **2 High priority fixes**

---

## Pre-Testing Setup

### Database Migration

- [ ] **Apply Prisma migration**:
  ```bash
  cd c:\Users\graem\.gemini\antigravity\scratch\decision-jar
  npx prisma generate
  npx prisma migrate deploy
  # OR for development:
  npx prisma migrate dev
  ```

- [ ] **Verify schema**:
  ```bash
  npx prisma studio
  # Check that PremiumInviteToken table exists
  ```

---

## Critical Fix #1: OAuth Users Don't Land in BUGRPT

### Test Scenario 1A: Google OAuth Signup

**Steps**:
1. Clear browser cookies
2. Navigate to `/signup`
3. Click "Continue with Google"
4. Complete OAuth flow
5. Redirect to dashboard

**Expected Results**:
- [ ] User created successfully
- [ ] `activeJarId` is `null` (not BUGRPT ID)
- [ ] User added to BUGRPT and FEATREQ as MEMBER
- [ ] Dashboard shows "Create Your First Jar" modal
- [ ] Modal has clear "Create Jar" button
- [ ] No onboarding tour triggers yet
- [ ] No errors in console

**SQL Verification**:
```sql
-- Get latest OAuth user
SELECT id, email, activeJarId, createdAt 
FROM "User" 
WHERE "passwordHash" IS NULL 
ORDER BY createdAt DESC 
LIMIT 1;

-- Should show: activeJarId = NULL

-- Check memberships
SELECT jar.referenceCode, jm.role 
FROM "JarMember" jm
JOIN "Jar" jar ON jar.id = jm.jarId
WHERE jm.userId = '<user-id>';

-- Should show: BUGRPT (MEMBER), FEATREQ (MEMBER)
```

**Pass Criteria**: ✅ activeJarId is null, CREATE_JAR modal shown

---

For complete testing documentation including all scenarios, see the full testing checklist.

**Document Created**: January 11, 2026  
**Status**: 🔄 Ready for Testing
