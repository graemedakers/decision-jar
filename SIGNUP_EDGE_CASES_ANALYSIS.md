# Signup Edge Cases & Inconsistencies Analysis
**Date**: January 11, 2026  
**Scope**: Comprehensive edge case analysis of all signup flows  
**Status**: 🔴 **CRITICAL ISSUES IDENTIFIED**

---

## Executive Summary

This document identifies **12 critical edge cases** and **7 inconsistencies** in the signup flows that could lead to poor user experience or system failures. Prioritized by severity and likelihood.

### Severity Levels
- 🔴 **CRITICAL**: Breaks user experience, data corruption risk
- 🟠 **HIGH**: Poor UX, confusion, potential churn
- 🟡 **MEDIUM**: Edge case, affects small % of users
- 🟢 **LOW**: Minor inconvenience, easily resolved

---

## Table of Contents
1. [Community Jar Signup Issues](#1-community-jar-signup-issues)
2. [Invite Code Edge Cases](#2-invite-code-edge-cases)
3. [OAuth vs Email Signup Inconsistencies](#3-oauth-vs-email-signup-inconsistencies)
4. [Onboarding Tour Conflicts](#4-onboarding-tour-conflicts)
5. [Multi-Jar Activation Logic](#5-multi-jar-activation-logic)
6. [Premium Token Edge Cases](#6-premium-token-edge-cases)
7. [Email Verification Gaps](#7-email-verification-gaps)
8. [Race Conditions](#8-race-conditions)
9. [Data Consistency Issues](#9-data-consistency-issues)
10. [UX Confusion Scenarios](#10-ux-confusion-scenarios)

---

##  1. Community Jar Signup Issues

### 🔴 **CRITICAL**: OAuth User Lands in Empty Community Jar

**Scenario**:
```
1. User signs up via Google OAuth
2. NextAuth createUser event fires
3. User auto-added to BUGRPT (Bug Reports) jar
4. activeJarId set to BUGRPT jar ID
5. User redirected to /dashboard
6. Dashboard shows EMPTY jar (BUGRPT has no ideas)
7. User sees EnhancedEmptyState with confusing CTAs
```

**Code Location**:
```typescript
// lib/auth-options.ts
events: {
  createUser: async ({ user }) => {
    const bugJar = communityJars.find(j => j.referenceCode === 'BUGRPT');
    if (bugJar) {
      await prisma.user.update({
        where: { id: user.id },
        data: { activeJarId: bugJar.id } // ❌ Sets community jar as active!
      });
    }
  }
}
```

**Impact**:
- ❌ User thinks app is broken (empty jar on first load)
- ❌ Onboarding tour still triggers (but jar is empty)
- ❌ "Create Your First Jar" prompt fires (lines 144-158 in dashboard)
- ❌ Confusing experience: "Why am I in Bug Reports?"

**Current Mitigation** (Partial):
```typescript
// app/dashboard/page.tsx (lines 144-158)
useEffect(() => {
  if (userData?.activeJarId && isCommunityJar) {
    const hasPersonalJars = userData.memberships?.some((m) => m.role === 'OWNER');
    if (!hasPersonalJars) {
      openModal('CREATE_JAR'); // ✅ Prompts user to create jar
    }
  }
}, [userData, openModal, isCommunityJar]);
```

**Problem**: This fix only works IF the jar is correctly identified as `isCommunityJar`. But the activeJarId is ALREADY set to BUGRPT.

**Why This is Critical**:
1. **First impressions matter**: OAuth users see broken state immediately
2. **Confusion cascade**: User doesn't understand why they're in "Bug Reports"
3. **Silent failure**: No error shown, just empty dashboard

**Recommended Fix**:
```typescript
// lib/auth-options.ts
events: {
  createUser: async ({ user }) => {
    const communityJars = await prisma.jar.findMany({
      where: { referenceCode: { in: ['BUGRPT', 'FEATREQ'] } }
    });

    if (communityJars.length > 0) {
      // Add memberships
      await prisma.jarMember.createMany({
        data: communityJars.map(jar => ({
          jarId: jar.id,
          userId: user.id!,
          role: 'MEMBER'
        }))
      });

      // ❌ DON'T set activeJarId to community jar
      // ✅ Leave activeJarId as null (user creates personal jar later)
      // await prisma.user.update({
      //   where: { id: user.id },
      //   data: { activeJarId: null }
      // });
    }
  }
}
```

**Additional Fix Needed**:
```typescript
// app/dashboard/page.tsx
// Add explicit check for OAuth users with no personal jar
useEffect(() => {
  if (!isLoadingUser && userData && !userData.activeJarId) {
    // User has NO active jar (OAuth user)
    const hasSeenPrompt = sessionStorage.getItem('create_first_jar_prompt');
    if (!hasSeenPrompt) {
      openModal('CREATE_JAR');
      sessionStorage.setItem('create_first_jar_prompt', 'true');
    }
  }
}, [userData, isLoadingUser, openModal]);
```

---

### 🟠 **HIGH**: Email Signup Also Auto-Joins Community Jars

**Scenario**:
```
1. User signs up via email (with topic specified)
2. Personal jar created (e.g., "Lisa's Activities Jar")
3. activeJarId set to personal jar
4. Lines 157-198 execute: Auto-add to BUGRPT + FEATREQ
5. User now has 3 jars total: Personal + BUGRPT + FEATREQ
6. Jar switcher shows all 3 jars immediately
```

**Code Location**:
```typescript
// app/api/auth/signup/route.ts (lines 157-198)
try {
  const feedbackJars = await prisma.jar.findMany({
    where: {
      referenceCode: { in: ['BUGRPT', 'FEATREQ'] }
    }
  });

  // Add user to feedback jars
  for (const jar of feedbackJars) {
    await prisma.jarMember.create({
      data: {
        userId: user.id,
        jarId: jar.id,
        role: 'MEMBER'
      }
    });
  }
} catch (feedbackError) {
  console.error('Failed to add user to feedback jars:', feedbackError);
}
```

**Impact**:
- 🟡 Not critical (user has personal jar)
- 🟠 But confusing: "What are BUGRPT and FEATREQ?"
- 🟠 Clutters jar switcher for new users
- 🟠 No explanation provided

**Recommended Fix**:
1. **Option A**: DON'T auto-add to community jars on signup
   - Add them when user explicitly clicks "Report Bug" or "Request Feature"
   
2. **Option B**: Add welcome message explaining community jars
   ```typescript
   if (feedbackJars.length > 0 && justAddedToFeedback) {
     // Show one-time tooltip
     showTooltip('JAR_WELCOME', {
       message: "We've added you to community feedback jars (BUGRPT, FEATREQ). Use these to report bugs or request features!"
     });
   }
   ```

3. **Option C**: Hide community jars from jar switcher by default
   ```typescript
   // components/JarSwitcher.tsx
   const visibleJars = userData.memberships.filter(m => 
     !m.jar.isCommunityJar || m.jar.id === userData.activeJarId
   );
   ```

---

### 🟡 **MEDIUM**: Community Jar Empty State Shows Wrong CTAs

**Scenario**:
```
1. User in BUGRPT jar (community jar)
2. Jar is empty (no bugs reported yet)
3. EnhancedEmptyState renders
4. Shows CTAs: "Add your first idea", "Try AI Surprise Me"
5. These CTAs are contextually wrong for bug reports
```

**Code Location**:
```typescript
// components/EnhancedEmptyState.tsx (lines 137-140)
{isCommunityJar ? "Submit Bug / Feedback" : "Add Ideas Manually"}
// Description:
{isCommunityJar ? "Help us improve or report an issue" : "Start from scratch..."}
```

**Issue**: CTA text IS customized, but EnhancedEmptyState still shows:
- ❌ "Browse Templates" (line 80) - NOT hidden for community jars
- ❌ "Try AI Surprise Me" (line 105) - NOT hidden for community jars

**Impact**:
- Users confused: "What templates for bug reports?"
- AI Surprise Me generates random ideas, not bug reports

**Recommended Fix**:
```typescript
// components/EnhancedEmptyState.tsx
{!isCommunityJar && ( // ADD THIS CHECK
  <motion.div> {/* Browse Templates */}
    ...
  </motion.div>
)}

{!isCommunityJar && ( // ADD THIS CHECK
  <motion.div> {/* AI Surprise Me */}
    ...
  </motion.div>
)}
```

---

## 2. Invite Code Edge Cases

### 🔴 **CRITICAL**: User Joins Invite Jar But Has No Personal Jar

**Scenario**:
```
1. User receives invite link: /signup?code=ABC123
2. User signs up (creates account)
3. activeJarId set to invited jar (ABC123)
4. User sees OTHER people's ideas in jar
5. User wants to create PERSONAL jar
6. No clear UX to create personal jar
7. User stuck in shared jar
```

**Code Location**:
```typescript
// app/api/auth/signup/route.ts (lines 136-154)
user = await prisma.user.create({
  data: {
    activeJarId: jar.id, // ❌ Invited jar becomes active
    memberships: {
      create: {
        jarId: jar.id,
        role: "MEMBER" // ❌ Not admin
      }
    }
  }
});
```

**Impact**:
- ❌ User has NO personal jar
- ❌ User is MEMBER (not admin) of only jar
- ❌ Cannot modify jar settings
- ❌ May think app only supports shared jars

**Current Mitigation**: NONE

**Recommended Fix**:
```typescript
// After invite jar signup, show welcome modal
if (inviteCode) {
  return NextResponse.json({
    success: true,
    requiresVerification: true,
    joinedViaInvite: true, // NEW FLAG
    inviteJarName: jar.name
  });
}

// Frontend: SignupForm.tsx
if (data.joinedViaInvite) {
  // After email verification, show modal:
  showModal('INVITE_WELCOME', {
    message: `You've joined "${data.inviteJarName}"! Want to create your own personal jar too?`,
    actions: [
      { label: 'Create My Jar', onClick: () => openModal('CREATE_JAR') },
      { label: 'Not Now', onClick: () => router.push('/dashboard') }
    ]
  });
}
```

---

### 🟠 **HIGH**: Invite Code + Premium Token Both Present

**Scenario**:
```
1. User receives invite with premium token: /signup?code=ABC123&pt=PREMIUM_XYZ
2. Premium token is INVALID (or expired)
3. User signs up, joins jar
4. Gets alert: "Premium link was invalid"
5. User still added to jar
6. activeJarId = invited jar
7. User premium status = FALSE
```

**Code Location**:
```typescript
// app/api/auth/signup/route.ts (lines 125-134, 203)
if (premiumToken) {
  const inviter = await prisma.user.findFirst({
    where: { premiumInviteToken: premiumToken }
  });

  if (inviter && inviter.email === 'graemedakers@gmail.com') {
    isPremiumGifted = true;
  }
}

// Return
const premiumTokenInvalid = !!premiumToken && !isPremiumGifted;
```

**Issues**:
1. ❌ Hardcoded email check (`graemedakers@gmail.com`)
2. ❌ No expiration date on premium tokens
3. ❌ No usage limit (same token can be used infinitely)
4. ❌ No audit log of premium grants

**Impact**:
- 🟠 Security risk: Anyone with token can gift premium
- 🟠 Abuse potential: Token shared publicly
- 🟠 No tracking of who used token when

**Recommended Fix**:
```typescript
// Create PremiumInviteToken model
model PremiumInviteToken {
  id            String   @id @default(uuid())
  token         String   @unique
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])
  usedBy        String?
  usedAt        DateTime?
  expiresAt     DateTime
  maxUses       Int      @default(1)
  currentUses   Int      @default(0)
}

// Validation logic
const tokenRecord = await prisma.premiumInviteToken.findUnique({
  where: { token: premiumToken },
  include: { createdBy: true }
});

if (tokenRecord) {
  // Check expiration
  if (new Date() > tokenRecord.expiresAt) {
    return { error: 'Premium token expired' };
  }

  // Check usage limit
  if (tokenRecord.currentUses >= tokenRecord.maxUses) {
    return { error: 'Premium token already used' };
  }

  // Grant premium
  isPremiumGifted = true;

  // Update token
  await prisma.premiumInviteToken.update({
    where: { id: tokenRecord.id },
    data: {
      usedBy: user.id,
      usedAt: new Date(),
      currentUses: { increment: 1 }
    }
  });
}
```

---

### 🟡 **MEDIUM**: Invite Code for Full Jar

**Scenario**:
```
1. Jar has member limit (e.g., max 10 members)
2. Jar currently has 10 members
3. User clicks invite link
4. Frontend validates code: /api/jars/validate-invite
5. Returns: { valid: false, error: "Jar is full" }
6. User sees error modal
7. Cannot join jar
```

**Code Location**:
```typescript
// components/auth/SignupForm.tsx (lines 49-68)
useEffect(() => {
  if (inviteCode) {
    fetch('/api/jars/validate-invite', {
      method: 'POST',
      body: JSON.stringify({ code: inviteCode })
    })
      .then(res => res.json())
      .then(data => {
        if (!data.valid) {
          setCodeError(data.error || "Invalid invite code");
        }
      });
  }
}, [inviteCode]);
```

**Issues**:
1. ✅ Validation DOES check for full jar (good!)
2. ❌ But error message is generic: "This jar is full"
3. ❌ No alternative action offered
4. ❌ User cannot request to join waitlist

**Impact**:
- 🟡 Rare edge case (most jars don't have limits)
- 🟡 But frustrating when it happens

**Recommended Fix**:
```typescript
// If jar is full, offer alternatives
if (codeError === 'Jar is full') {
  return (
    <Modal>
      <h2>This Jar is Full</h2>
      <p>This jar has reached its maximum capacity ({jar.memberLimit} members).</p>
      <p>You can:</p>
      <ul>
        <li>Ask the admin to increase the limit</li>
        <li>Request to join the waitlist (if enabled)</li>
        <li>Create your own jar instead</li>
      </ul>
      <Button onClick={() => router.push('/signup')}>
        Create My Own Jar
      </Button>
    </Modal>
  );
}
```

---

## 3. OAuth vs Email Signup Inconsistencies

### 🔴 **CRITICAL**: Different User States After Signup

| Attribute | Email Signup (with topic) | Email Signup (no topic) | OAuth (Google/FB) |
|-----------|---------------------------|-------------------------|-------------------|
| **activeJarId** | Created jar ID | `null` | BUGRPT jar ID 🔴 |
| **Personal jar** | ✅ Created | ❌ None | ❌ None |
| **Role** | ADMIN (own jar) | N/A | MEMBER (BUGRPT) 🔴 |
| **Membership count** | 3 (Personal + BUGRPT + FEATREQ) | 2 (BUGRPT + FEATREQ) | 2 (BUGRPT + FEATREQ) |
| **Dashboard experience** | Own jar with ideas | Empty/Prompt to create | Empty BUGRPT jar 🔴 |
| **Onboarding tour** | Triggers | May trigger | Triggers (but confusing) 🔴 |

**Why This is Critical**:
- **Inconsistent user experience** based on signup method
- **OAuth users disadvantaged**: Land in confusing state
- **Email users confused**: Why do I have 3 jars immediately?

**Recommended Fix**: **Standardize all signup paths**

```typescript
// Target State (ALL signup methods):
{
  activeJarId: null,              // No active jar initially
  memberships: [],                // No auto-memberships
  personalJarCreated: false       // Flag to track
}

// On first dashboard load:
if (!userData.activeJarId && !userData.personalJarCreated) {
  // Show Create First Jar wizard (ALL users)
  openModal('FIRST_JAR_WIZARD', {
    steps: [
      { type: 'name', prompt: 'Name your jar' },
      { type: 'topic', prompt: 'What's this jar for?' },
      { type: 'mode', prompt: 'How will you decide?' }
    ],
    onComplete: (jarData) => {
      createJar(jarData);
      setPersonalJarCreated(true);
    }
  });
}
```

---

## 4. Onboarding Tour Conflicts

### 🟠 **HIGH**: Onboarding Tour Fires in Empty Community Jar

**Scenario**:
```
1. OAuth user lands in BUGRPT jar (activeJarId = BUGRPT)
2. useOnboarding hook checks localStorage
3. No 'onboarding_completed' flag → triggers tour
4. Tour shows: "Add Your First Idea" (step 2)
5. Highlights [data-tour="add-idea-button"]
6. User clicks Add Idea
7. Idea submitted to BUGRPT (bug report jar)
8. User thinks: "Why is my date idea a bug report?"
```

**Code Location**:
```typescript
// hooks/features/useOnboarding.ts (lines 8-13)
useEffect(() => {
  const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
  if (!hasCompletedOnboarding && !isLoadingUser && userData) {
    setTimeout(() => setShowOnboarding(true), 1000);
  }
}, [isLoadingUser, userData]);
```

**Issues**:
1. ❌ Tour doesn't check if user has personal jar
2. ❌ Tour doesn't adapt to jar type (community vs personal)
3. ❌ Tour step "Add Your First Idea" is wrong for community jars

**Impact**:
- Users add wrong content to wrong jar
- Onboarding tour provides misleading guidance
- User thinks app is buggy

**Recommended Fix**:
```typescript
// hooks/features/useOnboarding.ts
useEffect(() => {
  const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
  
  // ✅ NEW: Check if user has personal jar
  const hasPersonalJar = userData?.memberships?.some(m => 
    m.role === 'ADMIN' && !m.jar.isCommunityJar
  );

  // Only trigger tour if user has personal jar
  if (!hasCompletedOnboarding && !isLoadingUser && userData && hasPersonalJar) {
    setTimeout(() => setShowOnboarding(true), 1000);
  }
}, [isLoadingUser, userData]);
```

**Alternative Fix**: Adaptive tour steps

```typescript
// lib/onboarding-steps.ts
export const getOnboardingSteps = (userData: UserData) => {
  const isCommunityJarActive = userData.isCommunityJar;
  
  if (isCommunityJarActive) {
    // Return community jar onboarding steps
    return [
      { id: 'welcome', title: 'Welcome to the Community!' },
      { id: 'submit', title: 'Submit Feedback', description: 'Report bugs or request features' },
      { id: 'create-jar', title: 'Create Your Personal Jar', description: 'You can also create your own jars' },
      ...
    ];
  }
  
  // Return standard steps
  return ONBOARDING_STEPS;
};
```

---

### 🟡 **MEDIUM**: Onboarding Tour Triggers for Invited Users

**Scenario**:
```
1. User signs up via invite link
2. Joins friend's jar "Weekend Adventures"
3. Jar has 15 existing ideas
4. User lands on dashboard
5. Onboarding tour triggers
6. Step 2: "Add Your First Idea"
7. User thinks: "But there are already 15 ideas here?"
```

**Impact**:
- Tour is contextually confusing
- User doesn't understand shared jar concept
- Tour talks about "your jar" but it's not their jar

**Recommended Fix**:
```typescript
// Detect invited users
const joinedViaInvite = userData.memberships?.some(m => 
  m.jar.id === userData.activeJarId && m.role === 'MEMBER'
);

if (joinedViaInvite) {
  // Show different tour for invited users
  setTourSteps(INVITED_USER_ONBOARDING_STEPS);
}

// lib/onboarding-steps.ts
export const INVITED_USER_ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome to the Jar!', description: 'You've been invited to collaborate' },
  { id: 'shared-ideas', title: 'Shared Ideas', description: 'Everyone in this jar can add ideas' },
  { id: 'add-your-idea', title: 'Add Your Suggestions', description: 'Contribute your own ideas to the jar' },
  { id: 'spin', title: 'Group Decision', description: 'When ready, anyone can spin to pick' },
  { id: 'create-personal', title: 'Create Your Own', description: 'You can also create personal jars' },
  ...
];
```

---

## 5. Multi-Jar Activation Logic

### 🟠 **HIGH**: activeJarId Can Point to Jar User is Not a Member Of

**Scenario** (Data corruption):
```
1. User in jar "Family Fun" (jarId: 123)
2. activeJarId = 123
3. Admin kicks user from jar
4. JarMember record deleted
5. BUT activeJarId still = 123
6. User tries to load dashboard
7. No membership found → errors
```

**Code Location**:
```typescript
// This check is NOT performed when loading user data
// hooks/useUser.ts fetches user
// But doesn't validate activeJarId against memberships
```

**Impact**:
- 🔴 Dashboard may fail to load
- 🔴 User sees errors instead of jars
- 🔴 No automatic fallback to another jar

**Recommended Fix**:
```typescript
// api/auth/me/route.ts (user data endpoint)
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  include: {
    memberships: { include: { jar: true } }
  }
});

// VALIDATION: Check if activeJarId is valid
if (user.activeJarId) {
  const hasAccess = user.memberships.some(m => m.jarId === user.activeJarId);
  
  if (!hasAccess) {
    // activeJarId points to jar user is not in!
    // Fix: Set to first available jar
    const firstJar = user.memberships[0]?.jarId || null;
    await prisma.user.update({
      where: { id: user.id },
      data: { activeJarId: firstJar }
    });
    user.activeJarId = firstJar;
  }
}

return user;
```

---

### 🟡 **MEDIUM**: No Clear Default When User Has Multiple Jars

**Scenario**:
```
1. User creates personal jar "My Ideas"
2. User joins friend's jar "Group Stuff"
3. User creates second personal jar "Work Tasks"
4. activeJarId = "Work Tasks" (last created)
5. User logs out, logs back in
6. activeJarId still = "Work Tasks"
7. User expected to see "My Ideas" (first jar)
```

**Issue**: No concept of "primary" jar or "favorite" jar

**Recommended Fix**:
```typescript
// Add user preference
model User {
  activeJarId      String?  // Current session jar
  defaultJarId     String?  // User's preferred default
  ...
}

// On login, set activeJarId to defaultJarId if set
// Otherwise, use last active jar
```

---

## 6. Premium Token Edge Cases

### 🟠 **HIGH**: Premium Token Security Issues

(Already covered in section 2, but worth restating)

**Issues**:
1. No expiration
2. No usage limits
3. Hardcoded email check
4. No audit trail
5. Token transmitted in URL (insecure)

**Recommended Fix**: Implement proper token management system (see section 2)

---

## 7. Email Verification Gaps

### 🟡 **MEDIUM**: User Can Use App Without Email Verification

**Current Behavior**:
```
1. User signs up
2. Verification email sent
3. User DOES NOT click link
4. User can still log in
5. User can use full app functionality
6. emailVerified = null in database
```

**Code Location**:
```typescript
// No enforcement of email verification anywhere
// Login works regardless of emailVerified status
```

**Issues**:
- Fake emails can be used
- No way to send important notifications
- Spam/abuse potential

**Current Risk**: LOW (no premium feature gating on verification)

**Recommended Fix** (if needed):
```typescript
// Middleware.ts or API routes
if (protectedRoute && !user.emailVerified) {
  return NextResponse.redirect('/verify-email');
}

// OR: Gate premium features only
if (premiumFeature && !user.emailVerified) {
  return { error: 'Please verify your email to use premium features' };
}
```

---

## 8. Race Conditions

### 🟡 **MEDIUM**: Concurrent Signup Attempts with Same Email

**Scenario**:
```
1. User submits signup form
2. Form is slow to respond
3. User clicks "Submit" again
4. Two API calls: POST /api/auth/signup
5. Both check for existing user (parallel)
6. Both pass (user doesn't exist yet)
7. Both try to create user with same email
8. Database UNIQUE constraint violation
9. One succeeds, one fails with 500 error
```

**Code Location**:
```typescript
// app/api/auth/signup/route.ts (lines 19-24)
const existingUser = await prisma.user.findUnique({
  where: { email },
});

if (existingUser) {
  return NextResponse.json({ error: 'User already exists' }, { status: 400 });
}

// ❌ Race condition: Both requests pass this check
```

**Impact**:
- Rare but possible
- User sees confusing error
- One request succeeds, one fails

**Recommended Fix**:
```typescript
// Frontend: Disable submit button after first click
const [isSubmitting, setIsSubmitting] = useState(false);

<Button 
  type="submit" 
  disabled={isSubmitting || isLoading}
  onClick={() => setIsSubmitting(true)}
>
  Create Account
</Button>

// Backend: Use upsert or handle unique constraint error
try {
  user = await prisma.user.create({ ... });
} catch (error) {
  if (error.code === 'P2002') { // Unique constraint violation
    return NextResponse.json({ 
      error: 'User already exists' 
    }, { status: 400 });
  }
  throw error;
}
```

---

## 9. Data Consistency Issues

### 🟠 **HIGH**: Community Jar Memberships May Be Missing

**Scenario**:
```
1. Email signup succeeds (user created)
2. Personal jar created
3. Community jar membership creation FAILS (lines 157-198)
4. Error is caught and logged
5. Signup continues (no failure returned)
6. User created successfully
7. BUT user NOT added to BUGRPT/FEATREQ
```

**Code Location**:
```typescript
// app/api/auth/signup/route.ts (lines 195-198)
} catch (feedbackError) {
  // Don't fail signup if feedback jar addition fails
  console.error('Failed to add user to feedback jars:', feedbackError);
}

// ✅ Continues to line 200 (email verification)
// ✅ Signup succeeds
// ❌ User missing from community jars
```

**Impact**:
- 🟡 Not critical (user can still use app)
- 🟠 But inconsistent: Some users in community jars, some not
- 🟠 Hard to debug: No indicator to user or admin

**Recommended Fix**:
```typescript
// Option 1: Add retry logic
let retryCount = 0;
while (retryCount < 3) {
  try {
    await addToCommunityJars(user.id);
    break; // Success
  } catch (error) {
    retryCount++;
    if (retryCount === 3) {
      // Log to error tracking service
      logError('community_jar_membership_failed', { userId: user.id, error });
    }
  }
}

// Option 2: Add background job to fix missing memberships
// Cron job runs daily: Find users NOT in community jars, add them
```

---

### 🟡 **MEDIUM**: Jar Reference Code Collision (Low Probability)

**Scenario**:
```
1. User creates jar → generates random 6-char code
2. Code: "AB3K9P"
3. Another user creates jar simultaneously
4. Random generator produces same code: "AB3K9P"
5. Database unique constraint violation
6. Jar creation fails
```

**Code Location**:
```typescript
// app/api/auth/signup/route.ts (line 68)
referenceCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
```

**Probability**: ~1 in 2 billion (36^6)
- With 10,000 jars: < 0.001% chance
- With 100,000 jars: ~0.25% chance
- Increases with scale

**Recommended Fix**:
```typescript
async function generateUniqueReferenceCode(): Promise<string> {
  let attempts = 0;
  while (attempts < 10) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existing = await prisma.jar.findUnique({
      where: { referenceCode: code }
    });
    if (!existing) return code;
    attempts++;
  }
  // Fallback: UUID-based code
  return uuid().substring(0, 8).toUpperCase();
}
```

---

## 10. UX Confusion Scenarios

### 🟠 **HIGH**: No Explanation of Auto-Added Community Jars

**Scenario**:
```
User's perspective:
1. Signs up for "Decision Jar"
2. Wants to track date ideas
3. Opens jar switcher
4. Sees three jars:
   - "Lisa's Activities Jar" ✅ (Expected)
   - "BUGRPT" ❓ (What's this?)
   - "FEATREQ" ❓ (What's this?)
5. Clicks "BUGRPT"
6. Sees empty jar or existing bug reports
7. Confused: "Why am I here?"
```

**Impact**:
- User thinks app is buggy
- No onboarding explanation
- User may delete these jars (if possible)

**Recommended Fix**:
```typescript
// Show one-time tooltip after first signup
const hasSeenCommunityExplainer = localStorage.getItem('community_jars_explained');

if (!hasSeenCommunityExplainer && userData.memberships.length > 1) {
  showTooltip({
    target: '[data-tour="jar-selector"]',
    message: "💡 We've added you to community feedback jars! Use BUGRPT to report bugs and FEATREQ to suggest features. You can hide these anytime.",
    actions: [
      { label: 'Got it', onClick: () => {
        localStorage.setItem('community_jars_explained', 'true');
      }},
      { label: 'Hide Community Jars', onClick: hideJarsInSettings }
    ]
  });
}
```

---

### 🟡 **MEDIUM**: Unclear Premium Token Failure Message

**Current Message**:
```
"Account created, but the Premium link was invalid or expired. You are on the Free plan."
```

**Issues**:
- Generic alert (not styled)
- No explanation why token invalid
- No recourse offered

**Better Message**:
```
<Modal>
  <h2>Welcome to Decision Jar! 🎉</h2>
  <p>Your account was created successfully.</p>
  <div className="warning">
    <AlertIcon />
    <div>
      <strong>Premium activation failed</strong>
      <p>The premium invite link you used has expired or was already used.</p>
      <p>You're currently on the Free plan, which includes:</p>
      <ul>
        <li>Up to 3 jars</li>
        <li>5 AI generations per month</li>
        <li>Unlimited manual ideas</li>
      </ul>
      <p>Want premium features? <a href="/pricing">View upgrade options</a></p>
    </div>
  </div>
  <Button>Continue to Dashboard</Button>
</Modal>
```

---

## Summary: Prioritized Fixes

### 🔴 **CRITICAL** (Fix Immediately)

1. **OAuth users land in empty BUGRPT jar**
   - Fix: Don't set activeJarId for OAuth users
   - Prompt to create personal jar on first load

2. **activeJarId can point to jar user doesn't have access to**
   - Fix: Validate activeJarId on user data load
   - Auto-correct to available jar

3. **Different user states based on signup method**
   - Fix: Standardize all signup paths

### 🟠 **HIGH** (Fix Soon)

4. **Onboarding tour triggers in wrong context**
   - Fix: Check for personal jar before triggering tour

5. **Premium token security issues**
   - Fix: Implement proper token system with expiry

6. **Auto-added community jars not explained**
   - Fix: Show one-time tooltip

7. **User joins via invite but has no personal jar**
   - Fix: Prompt to create personal jar after joining

### 🟡 **MEDIUM** (Fix When Possible)

8. **Community jar empty state shows wrong CTAs**
   - Fix: Hide irrelevant CTAs for community jars

9. **Race condition on concurrent signup**
   - Fix: Disable button, handle unique constraint error

10. **Jar reference code collision potential**
    - Fix: Check for uniqueness before saving

### 🟢 **LOW** (Nice to Have)

11. **Email verification not enforced**
    - Decision: Keep as-is or gate premium features

12. **No default jar preference**
    - Fix: Add defaultJarId field

---

## Testing Checklist

To verify these edge cases are handled:

```typescript
// Test Suite: Signup Edge Cases

describe('Community Jar Edge Cases', () => {
  test('OAuth user does not land in BUGRPT jar', async () => {
    const user = await signUpViaOAuth('google');
    expect(user.activeJarId).toBeNull();
    expect(user.memberships).toHaveLength(2); // BUGRPT, FEATREQ
  });

  test('Email user with topic creates personal jar first', async () => {
    const user = await signUpViaEmail({ topic: 'Activities' });
    expect(user.activeJarId).not.toBeNull();
    const activeJar = await getJar(user.activeJarId);
    expect(activeJar.isCommunityJar).toBe(false);
  });
});

describe('Invite Code Edge Cases', () => {
  test('Invited user prompted to create personal jar', async () => {
    const inviteCode = await createJarWithInvite();
    const user = await signUpWithInvite(inviteCode);
    
    // Load dashboard
    const dashboard = await loadDashboard(user);
    expect(dashboard.modals).toContain('CREATE_JAR_PROMPT');
  });

  test('Full jar shows helpful error', async () => {
    const jar = await createJar({ memberLimit: 1 });
    await addMember(jar.id);
    
    const validation = await validateInvite(jar.referenceCode);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('full');
  });
});

describe('Onboarding Tour Edge Cases', () => {
  test('Tour does not trigger for community jar users', async () => {
    const user = await signUpViaOAuth();
    user.activeJarId = BUGRPT_JAR_ID;
    
    const shouldTrigger = checkOnboardingTrigger(user);
    expect(shouldTrigger).toBe(false);
  });

  test('Tour adapts for invited users', async () => {
    const user = await signUpWithInvite(code);
    const tour = getTourSteps(user);
    
    expect(tour[0].title).toContain('Welcome to the Jar');
    expect(tour).not.toContain('Add Your First Idea');
  });
});
```

---

## Conclusion

**Total Edge Cases Identified**: 12 critical scenarios  
**Inconsistencies**: 7 major UX inconsistencies  
**Estimated Fix Time**: 2-3 sprint cycles

**Highest Priority**:
1. Fix OAuth user landing in BUGRPT (1-2 days)
2. Standardize signup flows (3-5 days)
3. Fix onboarding tour context awareness (2 days)

**Next Steps**:
1. Review this document with team
2. Prioritize fixes based on user impact
3. Create tickets for each issue
4. Add integration tests for edge cases
5. Update documentation with edge case handling

---

**Document Maintained By**: Product & Engineering Teams  
**Last Updated**: January 11, 2026  
**Status**: 🔴 Awaiting Review & Prioritization
