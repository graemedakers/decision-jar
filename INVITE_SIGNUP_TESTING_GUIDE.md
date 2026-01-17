# Invite & Signup Flow Testing Guide

**Date**: January 17, 2026  
**Purpose**: Comprehensive testing checklist for all signup and invite scenarios

---

## Changes Implemented

### 1. Email Signup Fix
**File**: `components/auth/SignupForm.tsx` (line 156)
- **Change**: Preserve `code` and `pt` URL parameters when redirecting to dashboard after successful signup
- **Impact**: Email signups with invite codes now correctly trigger the join flow on dashboard

### 2. OAuth Signup Fix
**Files**: 
- `components/auth/SignupForm.tsx` (lines 71-87)
- `hooks/useDashboardLogic.ts` (lines 180-250)

**Changes**:
- Store invite code in `sessionStorage` before OAuth redirect
- After OAuth callback, detect stored invite params
- Join invited jar via `/api/jars/join`
- Delete auto-created "My First Jar" if it exists and is empty
- Switch `activeJarId` to invited jar

**Impact**: OAuth signups with invite codes now correctly join the invited jar and clean up the auto-created jar

### 3. Skip Tour for Invite Users
**Files**:
- `hooks/features/useOnboarding.ts` (lines 18-22)
- `hooks/useDashboardLogic.ts` (line 152)

**Changes**:
- Set `email_invite_signup` or `oauth_invite_signup` flag in sessionStorage when user joins via invite
- Check for these flags in `useOnboarding` hook
- Skip onboarding tour if user joined via invite

**Impact**: Invite users no longer see the onboarding tour (which is designed for jar creators, not members)

### 4. Database Cleanup Script
**File**: `scripts/cleanup-orphan-jars.ts`

**Purpose**: Identify and delete orphan "My First Jar" records created during OAuth signups with invite codes

**Results**:
- ✅ Dev database: 0 orphan jars found (clean)
- ✅ Production database: 0 orphan jars found (clean)

---

## Testing Scenarios

### ✅ Scenario 1: Email Signup + Invite Code (NEW user)

**Setup**:
1. Get an invite link from an existing jar: `/signup?code=ABC123`
2. Open link in incognito/private browser window

**Steps**:
1. Click invite link
2. Verify: Signup form shows "Join Group" header
3. Fill in name, email, password
4. Click "Create Account"
5. Check email for verification link
6. Click verification link
7. Redirected to dashboard

**Expected Results**:
- ✅ User successfully joins the invited jar
- ✅ User sees the invited jar with existing ideas
- ✅ User's role in jar is "MEMBER"
- ✅ NO "empty jar" modal appears
- ✅ NO "create jar" modal appears
- ✅ NO onboarding tour appears
- ✅ Success toast: "Successfully joined the jar!"

**How to Verify**:
- Check jar switcher: should show invited jar name
- Check ideas list: should show existing ideas from invited jar
- Check jar settings: user should be listed as MEMBER

---

### ✅ Scenario 2: OAuth Signup + Invite Code (NEW user - Google)

**Setup**:
1. Get an invite link: `/signup?code=ABC123`
2. Open link in incognito window

**Steps**:
1. Click invite link
2. Verify: Signup form shows "Join Group" header
3. Click "Continue with Google"
4. Complete Google OAuth flow
5. Redirected to dashboard

**Expected Results**:
- ✅ User successfully joins the invited jar
- ✅ "My First Jar" is automatically deleted (if it was created)
- ✅ User sees the invited jar with existing ideas
- ✅ User's role in jar is "MEMBER"
- ✅ NO "empty jar" modal appears
- ✅ NO "create jar" modal appears
- ✅ NO onboarding tour appears
- ✅ Success toast: "Successfully joined the jar!"

**How to Verify**:
- Check jar switcher: should show invited jar name ONLY (no "My First Jar")
- Check ideas list: should show existing ideas from invited jar
- Check database: no orphan "My First Jar" record for this user

**Console Logs to Check**:
```
[OAuth Invite Cleanup] Starting cleanup for invite code: ABC123
[OAuth Invite Cleanup] Successfully joined invited jar
[OAuth Invite Cleanup] Successfully deleted "My First Jar"
[Onboarding] Skipping tour for invite user
```

---

### ✅ Scenario 3: OAuth Signup + Invite Code (NEW user - Facebook)

**Same as Scenario 2, but with Facebook OAuth**

**Expected Results**: Same as Scenario 2

---

### ✅ Scenario 4: Email Login + Invite Code (EXISTING user)

**Setup**:
1. User already has an account
2. Get an invite link: `/login?code=ABC123`

**Steps**:
1. Click invite link
2. Login form pre-fills email (if provided in URL)
3. Enter password
4. Click "Sign In"
5. Redirected to dashboard

**Expected Results**:
- ✅ User successfully joins the invited jar
- ✅ User's existing jar(s) remain intact
- ✅ Jar switcher shows new jar membership
- ✅ Success toast: "Successfully joined the jar!"
- ✅ User can switch between jars using jar switcher

---

### ✅ Scenario 5: OAuth Login + Invite Code (EXISTING user)

**Setup**:
1. User already has an account (OAuth)
2. Get an invite link: `/login?code=ABC123`

**Steps**:
1. Click invite link
2. Click "Continue with Google/Facebook"
3. Complete OAuth flow
4. Redirected to dashboard

**Expected Results**:
- ✅ User successfully joins the invited jar
- ✅ User's existing jar(s) remain intact
- ✅ Jar switcher shows new jar membership
- ✅ Success toast: "Successfully joined the jar!"

---

### ✅ Scenario 6: Standard Email Signup (NO invite code)

**Steps**:
1. Go to `/signup` (no code parameter)
2. Fill in name, email, password
3. Optionally expand "Advanced Options" and set jar topic/name
4. Click "Create Account"
5. Verify email
6. Redirected to dashboard

**Expected Results**:
- ✅ User creates a new jar (if advanced options used) OR prompted to create jar
- ✅ User is ADMIN/OWNER of their jar
- ✅ Onboarding tour appears (after 1.5 seconds)
- ✅ Empty jar modal appears (if jar is empty and user is owner)

---

### ✅ Scenario 7: Standard OAuth Signup (NO invite code)

**Steps**:
1. Go to `/signup`
2. Click "Continue with Google/Facebook"
3. Complete OAuth flow
4. Redirected to dashboard

**Expected Results**:
- ✅ "My First Jar" is created automatically
- ✅ User is OWNER of "My First Jar"
- ✅ User's `activeJarId` is set to "My First Jar"
- ✅ Onboarding tour appears (after 1.5 seconds)
- ✅ Empty jar modal appears

---

### ✅ Scenario 8: Invite Code + Premium Token

**Setup**:
1. Get invite link with premium token: `/signup?code=ABC123&pt=PREMIUM_TOKEN`

**Steps**:
1. Click invite link
2. Complete signup (email or OAuth)
3. Redirected to dashboard

**Expected Results**:
- ✅ User joins invited jar
- ✅ If premium token is valid: User is upgraded to Premium
- ✅ Success toast: "Welcome! You've joined the jar and upgraded to Premium!"
- ✅ Premium badge appears in UI

---

## Edge Cases to Test

### 🔍 Edge Case 1: Invalid Invite Code

**Steps**:
1. Go to `/signup?code=INVALID`
2. Wait for validation

**Expected Results**:
- ❌ Error modal: "Invalid Invite Link"
- ✅ Option to "Sign Up" (without invite code)

---

### 🔍 Edge Case 2: Full Jar (Member Limit Reached)

**Steps**:
1. Create a jar with `memberLimit = 2`
2. Add 2 members
3. Generate invite link
4. Try to sign up with invite link

**Expected Results**:
- ❌ Error modal: "This jar is full"
- ✅ Option to create own jar

---

### 🔍 Edge Case 3: Expired Premium Token

**Steps**:
1. Use invite link with expired premium token
2. Complete signup

**Expected Results**:
- ✅ User joins jar successfully
- ⚠️ Alert: "Account created, but the Premium link was invalid or expired. You are on the Free plan."

---

### 🔍 Edge Case 4: User Already Member of Invited Jar

**Steps**:
1. User is already a member of jar ABC123
2. Click invite link for same jar: `/login?code=ABC123`
3. Login

**Expected Results**:
- ✅ Success toast: "Already a member, switched to jar."
- ✅ User's `activeJarId` switches to that jar
- ✅ No duplicate membership created

---

## Manual Testing Checklist

Use this checklist to verify all scenarios:

- [ ] Scenario 1: Email Signup + Invite Code
- [ ] Scenario 2: OAuth Signup + Invite Code (Google)
- [ ] Scenario 3: OAuth Signup + Invite Code (Facebook)
- [ ] Scenario 4: Email Login + Invite Code
- [ ] Scenario 5: OAuth Login + Invite Code
- [ ] Scenario 6: Standard Email Signup
- [ ] Scenario 7: Standard OAuth Signup
- [ ] Scenario 8: Invite Code + Premium Token
- [ ] Edge Case 1: Invalid Invite Code
- [ ] Edge Case 2: Full Jar
- [ ] Edge Case 3: Expired Premium Token
- [ ] Edge Case 4: Already Member

---

## Debugging Tips

### Check SessionStorage

Open browser DevTools → Application → Session Storage → `http://localhost:3000`

Look for:
- `oauth_invite_signup`: Should be `"true"` for OAuth invite signups
- `email_invite_signup`: Should be `"true"` for email invite signups
- `pending_invite_code`: Should contain invite code during OAuth flow
- `pending_premium_token`: Should contain premium token (if provided)

### Check Console Logs

Look for these log messages:
```
[OAuth Invite Cleanup] Starting cleanup for invite code: ABC123
[OAuth Invite Cleanup] Successfully joined invited jar
[OAuth Invite Cleanup] Successfully deleted "My First Jar"
[Onboarding] Skipping tour for invite user
```

### Check Database

Query to verify user's jar memberships:
```sql
SELECT 
    u.email,
    u.activeJarId,
    j.name as jar_name,
    jm.role,
    jm.status
FROM "User" u
JOIN "JarMember" jm ON u.id = jm.userId
JOIN "Jar" j ON jm.jarId = j.id
WHERE u.email = 'test@example.com';
```

Query to check for orphan jars:
```sql
SELECT 
    j.id,
    j.name,
    j.createdAt,
    COUNT(i.id) as idea_count,
    COUNT(jm.id) as member_count
FROM "Jar" j
LEFT JOIN "Idea" i ON j.id = i.jarId
LEFT JOIN "JarMember" jm ON j.id = jm.jarId
WHERE j.name = 'My First Jar'
GROUP BY j.id, j.name, j.createdAt
HAVING COUNT(i.id) = 0 AND COUNT(jm.id) = 1;
```

---

## Rollback Plan

If issues are discovered in production:

1. **Revert Code Changes**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Redeploy Previous Version** via Vercel dashboard

3. **No Database Rollback Needed**: The cleanup script only deletes orphan jars (0 found in production)

---

## Success Criteria

All scenarios must pass with:
- ✅ No console errors
- ✅ Correct jar membership created
- ✅ Correct `activeJarId` set
- ✅ No duplicate jars created
- ✅ No orphan jars left in database
- ✅ Onboarding tour skipped for invite users
- ✅ Appropriate success/error messages shown
