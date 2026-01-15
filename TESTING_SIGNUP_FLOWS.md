# Functional Testing Guide: Signup Workflows

**Version**: 1.0
**Date**: January 15, 2026
**Purpose**: To verify all user registration pathways, ensuring recent stability fixes (OAuth jar creation, deleted user loops, premium tokens) are functioning correctly.

---

## 🛠️ Prerequisites

1.  **Environment**: Localhost or Staging (Do not test creating thousands of users in Prod).
2.  **Tools**:
    *   Web Browser (Chrome/Edge in Incognito Mode recommended).
    *   Database Access (via scripts or Neon dashboard).
    *   Email Access (for verification tokens, or check logs).
3.  **Clean State**:
    *   Ideally, ensure the test email (`test@example.com`) does not exist in the DB before starting.
    *   Use `npm run db:delete-user -- email=test@example.com` to clean up.

---

## 🧪 Test Case 1: Standard Email Signup

**Goal**: Verify a user can sign up with email/password and gets a default jar.

| Step | Action | Expected Result |
|oss|---|---|
| 1 | Navigate to `/signup`. | Signup form loads. |
| 2 | Enter Name: `Test User`, Email: `test+std@example.com`, Password: `Password123!`. | Form validates input. |
| 3 | Click "Sign Up". | User redirected to `/dashboard`. |
| 4 | **Dashboard Check** | "Test User's General Jar" is active. Onboarding Tour starts. |
| 5 | **DB Verification** | User exists in `User` table. Jar exists in `Jar` table. Relationship exists in `JarMember` (Role: ADMIN). |

**SQL Verification**:
```sql
SELECT email, "activeJarId" FROM "User" WHERE email = 'test+std@example.com';
-- activeJarId should NOT be null
```

---

## 🧪 Test Case 2: OAuth Signup (Google) [CRITICAL]

**Goal**: Verify Fix #9 & #12 (OAuth users usually failed to get a personal jar).

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/login` or `/signup`. | Social login buttons visible. |
| 2 | Click "Continue with Google". | Redirect to Google Auth → Redirect back to Dashboard. |
| 3 | **Dashboard Check** | **CRITICAL**: User should land in "My First Jar", NOT "Bug Reports". |
| 4 | **DB Verification** | User `activeJarId` points to a jar owned by them. |

**SQL Verification**:
```sql
SELECT u.email, j.name, j.type 
FROM "User" u 
JOIN "Jar" j ON u."activeJarId" = j.id 
WHERE u.email = 'YOUR_GOOGLE_EMAIL';
-- Verify jar name is "My First Jar" or similar, not "Bug Reports"
```

---

## 🧪 Test Case 3: Invite Link Signup

**Goal**: Verify user joins an *existing* jar instead of creating a new one.

| Step | Action | Expected Result |
|---|---|---|
| 1 | **Preparation**: Get an invite code from an existing jar (e.g., `ABC123`). | Code exists. |
| 2 | Navigate to `/signup?code=ABC123`. | Signup form loads. Jar preview shows "You are joining [Jar Name]". |
| 3 | Enter new user details: `Invited User`, `test+invite@example.com`. | Form submits. |
| 4 | Click "Sign Up". | Redirect to Dashboard. |
| 5 | **Dashboard Check** | Active jar is the *Invited Jar*. User sees shared ideas. |
| 6 | **DB Verification** | User `activeJarId` = Jar ID of `ABC123`. Role in `JarMember` is `MEMBER` (not OWNER). |

---

## 🧪 Test Case 4: Premium Token Signup

**Goal**: Verify Fix #6 (Premium Invite Tokens).

| Step | Action | Expected Result |
|---|---|---|
| 1 | **Preparation**: Create a token in DB (or use `scripts/create-premium-token.ts` if available). | Token `PREMIUM_TEST` created. |
| 2 | Navigate to `/signup?pt=PREMIUM_TEST`. | UI *should* indicate premium gift (verify if UI shows this). |
| 3 | Sign up as `test+prem@example.com`. | Redirect to Dashboard. |
| 4 | **Dashboard Check** | Check Settings/Profile. Should say "Premium / Lifetime Pro". |
| 5 | **DB Verification** | `isLifetimePro` = true. `PremiumInviteToken` shows `usedById` matches user. |

---

## 🧪 Test Case 5: Deleted User (Infinite Loop Fix)

**Goal**: Verify Fix #18 (Deleted users are logged out immediately).

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login as `test+std@example.com`. | Dashboard loads. |
| 2 | **Destructive Action**: Delete user from DB manually. `DELETE FROM "User" WHERE email = ...` | User gone, but Browser has Cookie. |
| 3 | Update/Refresh Page in Browser. | **CRITICAL**: Should redirect to `/login` immediately. |
| 4 | **Failure State**: If page spins or reloads endlessly, Fix #18 is broken. | |

---

## 🧪 Test Case 6: Quick Add Validation

**Goal**: Verify Fix #20 (Prisma Error on Quick Add).

| Step | Action | Expected Result |
|---|---|---|
| 1 | Login to Dashboard. | "Quick Add Idea" input visible at bottom/top. |
| 2 | Type "Test Idea" and press Enter. | Modal opens title: "Add New Idea" (NOT "Duplicate Idea"). |
| 3 | Click "Save" immediately (stepping through Wizard). | **CRITICAL**: Success toast. details saved. |
| 4 | **Failure State**: Red toast error "Argument activityLevel missing". | |

---

## 🧪 Test Case 7: Jar Switching

**Goal**: Verify Fix #19 (Stale Content).

| Step | Action | Expected Result |
|---|---|---|
| 1 | User must have 2 jars (create a 2nd one if needed). | Jar A (5 ideas), Jar B (0 ideas). |
| 2 | Switch from Jar A to Jar B. | Header updates to "Jar B". **Content updates to Empty**. |
| 3 | **Failure State**: Header says "Jar B" but list still shows 5 ideas from Jar A. | |

---

## 📝 Testing Checklist

- [ ] Standard Email Signup
- [ ] OAuth Google Signup
- [ ] Invite Code Signup (`?code=`)
- [ ] Premium Token Signup (`?pt=`)
- [ ] Deleted User Redirect
- [ ] Quick Add Idea (No Errors)
- [ ] Jar Switching (Content Refresh)
