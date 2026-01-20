# Conditional Email Verification Implementation Plan

## Current State Analysis

### Database Schema
- `User.emailVerified` (DateTime?) - Already exists
- `User.verificationToken` (String?) - Already exists  
- OAuth users created via NextAuth with PrismaAdapter

### Current Blocking Points
1. **Login** (`app/api/auth/login/route.ts:39-41`)
   - Blocks ALL unverified email/password users from logging in
   - Message: "Please verify your email address before logging in."

### Current Verification Flow
- Email/password signups get `emailVerified: null` + a `verificationToken`
- OAuth signups (Google/Facebook) use NextAuth's PrismaAdapter
- Verification happens via `/api/auth/verify` endpoint

## Implementation Strategy

### Phase 1: Auto-Verify OAuth Users ✅
**Goal**: OAuth users should be auto-verified since Google/Facebook already verified them

**Changes**:
1. Update `lib/auth-options.ts` `createUser` event to set `emailVerified: new Date()` for OAuth users
2. User check: If user has no `passwordHash`, they're OAuth → auto-verify

### Phase 2: Remove Login Blocking ✅
**Goal**: Allow unverified users to use the app

**Changes**:
1. Remove the blocking check in `app/api/auth/login/route.ts` (lines 38-41)
2. Users can now login regardless of verification status

### Phase 3: Add Verification Nudges 🎯
**Goal**: Encourage verification without blocking

**Changes**:
1. Create `<VerificationBanner>` component for unverified users
2. Show subtle banner in dashboard with "Verify email to unlock full features"
3. Make it dismissible but persistent until verified

### Phase 4: Gate Premium Features Behind Verification 🔒
**Goal**: Require verification for high-value actions

**Features to Gate**:
1. **Jar Invitations** (sending invite links/emails)
   - Check in jar invite API/UI
   - Show modal: "Verify your email to invite friends"
   
2. **Email Notifications** (opt-in for notifications)
   - Check when enabling notification preferences
   - Can't enable email notifs without verified email
   
3. **Pro Upgrade** (Stripe billing)
   - Require verification before showing Stripe checkout
   - Ensures valid email for billing

**Features NOT Gated** (Available to unverified):
- Creating/joining jars
- Adding ideas
- Voting/spinning
- Using the app solo
- Push notifications (web push, not email)

### Phase 5: Improve Verification UX 📧
**Goal**: Make verification emails more compelling

**Changes**:
1. Update verification email template
2. New subject: "Unlock Jar Sharing - Verify Your Email"
3. Add benefits: "Verify to invite friends, get notifications, and more!"

## Files to Modify

### Core Auth Logic
- [ ] `lib/auth-options.ts` - Auto-verify OAuth users in `createUser` event
- [ ] `app/api/auth/login/route.ts` - Remove blocking verification check

### UI Components (New)
- [ ] `components/VerificationBanner.tsx` - Dismissible nudge for unverified users
- [ ] `components/VerifyEmailGate.tsx` - Reusable modal for gated features

### API Gating (To Add Checks)
- [ ] `app/api/jars/invite` (if exists) or jar sharing logic
- [ ] `app/api/user/notification-settings` or similar
- [ ] Stripe checkout flow

### Email Template
- [ ] Verification email template (if separate file)

## Testing Checklist

### Local Testing (Do NOT commit)
- [ ] Create OAuth user → Check auto-verified
- [ ] Create email/password user → Check NOT auto-verified
- [ ] Login as unverified user → Should work
- [ ] Try to send jar invite as unverified → Should show gate
- [ ] Try to enable email notifications as unverified → Should show gate
- [ ] Verify email → Gate should disappear

## Safety Notes
- ✅ No production database changes
- ✅ No commits until approved
- ✅ Test in local environment only
- ❓ Ask user if unsure about any gating decision
