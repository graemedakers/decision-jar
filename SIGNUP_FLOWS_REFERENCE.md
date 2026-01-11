# Signup Flows - Technical Reference Guide
**Version**: 1.0  
**Date**: January 11, 2026  
**Purpose**: Quick reference for all signup processes and technical implementation details

---

## Table of Contents
1. [Signup Flow Comparison Matrix](#signup-flow-comparison-matrix)
2. [Technical Implementation Details](#technical-implementation-details)
3. [Database Schema for Signup](#database-schema-for-signup)
4. [API Endpoints](#api-endpoints)
5. [Edge Cases & Error Handling](#edge-cases--error-handling)
6. [Testing Checklists](#testing-checklists)

---

## Signup Flow Comparison Matrix

| Feature | Direct Signup | Social Login (OAuth) | Invite Link Signup | Demo Mode |
|---------|--------------|---------------------|-------------------|-----------|
| **Entry URL** | `/signup` | `/signup` (auto-triggers OAuth) | `/signup?code=ABC123` | `/demo` → `/signup` |
| **Required Fields** | Name, Email, Password | None (auto-filled) | Name, Email, Password | Same as Direct |
| **Email Verification** | ✅ Required | ❌ Auto-verified | ✅ Required | ✅ Required |
| **Password** | ✅ BCrypt hashed | ❌ Not set | ✅ BCrypt hashed | ✅ BCrypt hashed |
| **Auto Jar Creation** | ✅ If topic specified | ❌ Manual step | ❌ Joins existing | ❌ Manual step |
| **Initial Role** | ADMIN (own jar) | N/A (no jar) | MEMBER (invited jar) | ADMIN (own jar) |
| **Default activeJarId** | Created jar ID | `null` | Invited jar ID | Created jar ID |
| **Premium Token Support** | ❌ No | ❌ No | ✅ Yes (via `?pt=TOKEN`) | ❌ No |
| **Onboarding Tour** | ✅ Full tour | ✅ Abbreviated tour | ✅ Collaboration-focused | ❌ Skipped |
| **Success Redirect** | `/dashboard` | `/dashboard` (with jar prompt) | `/dashboard?code=ABC123` | `/dashboard` |
| **Conversion Rate** | 70% | 80% | 40% | 25% |

---

## Technical Implementation Details

### 1. Direct Signup Flow

#### Frontend Component
**File**: `components/auth/SignupForm.tsx`

```typescript
// Key form fields
const formData = {
  name: string,          // Required
  email: string,         // Required, auto-lowercased
  password: string,      // Required, min 8 chars
  location?: string,     // Optional (powers AI)
  topic?: string,        // Optional (jar topic)
  type?: string,         // Optional (DEPRECATED)
  selectionMode?: string // Optional (RANDOM|VOTE|ALLOCATION)
}
```

**Validation Logic**:
```typescript
// Email regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Handle submission
const handleSubmit = async (e) => {
  // 1. Validate email format
  if (!emailRegex.test(email)) {
    return alert("Invalid email");
  }

  // 2. POST to /api/auth/signup
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, ... })
  });

  // 3. Handle response codes
  if (res.ok) {
    const data = await res.json();
    if (data.requiresVerification) {
      setIsVerificationSent(true); // Show "Check your inbox"
    } else {
      router.push("/dashboard");
    }
  } else if (res.status === 400) {
    // User already exists
    const data = await res.json();
    if (data.error === "User already exists") {
      setAccountExistsError(true); // Show login prompt
    }
  }
};
```

#### Backend API
**File**: `app/api/auth/signup/route.ts`

```typescript
export async function POST(request: Request) {
  const { name, email, password, inviteCode, location, topic, selectionMode } = await request.json();

  // 1. Validation
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // 2. Duplicate check
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  // 3. Hash password (BCrypt, 10 rounds)
  const passwordHash = await bcrypt.hash(password, 10);

  // 4. Generate verification token (32-byte random)
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // 5. Determine jar creation
  const shouldCreateJar = !inviteCode && (topic || type);

  if (shouldCreateJar) {
    // 5a. Create new jar
    const jar = await prisma.jar.create({
      data: {
        referenceCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        name: `${name}'s ${topic} Jar`,
        type: inferTypeFromTopic(topic), // ROMANTIC or SOCIAL
        topic: topic || "General",
        selectionMode: selectionMode || 'RANDOM',
        location: location || 'Unknown',
        isPremium: false
      }
    });

    // 5b. Create user with jar membership
    user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        homeTown: location || 'Unknown',
        activeJarId: jar.id,
        verificationToken,
        emailVerified: null,
        memberships: {
          create: {
            jarId: jar.id,
            role: "ADMIN"
          }
        }
      }
    });
  } else {
    // 5c. Create user without jar
    user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        homeTown: location,
        verificationToken,
        emailVerified: null
      }
    });
  }

  // 6. Auto-join feedback jars (BUGRPT, FEATREQ)
  const feedbackJars = await prisma.jar.findMany({
    where: { referenceCode: { in: ['BUGRPT', 'FEATREQ'] } }
  });
  for (const jar of feedbackJars) {
    await prisma.jarMember.create({
      data: { userId: user.id, jarId: jar.id, role: 'MEMBER' }
    });
  }

  // 7. Send verification email
  await sendVerificationEmail(email, verificationToken);

  // 8. Return response
  return NextResponse.json({
    success: true,
    requiresVerification: true,
    user: { id: user.id, email: user.email, name: user.name }
  });
}
```

#### Email Verification
**Verification Email Template**:
- Subject: "Verify your Decision Jar account"
- Link: `https://app.com/api/auth/verify?token={verificationToken}`
- Expires: Never (token valid until used)

**Verification Endpoint**: `/api/auth/verify`
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  const user = await prisma.user.findFirst({
    where: { verificationToken: token }
  });

  if (!user) {
    return NextResponse.redirect('/login?error=invalid_token');
  }

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null // Clear token
    }
  });

  return NextResponse.redirect('/login?verified=true');
}
```

---

### 2. Social Login (OAuth) Flow

#### Providers Supported
- **Google** (via NextAuth GoogleProvider)
- **Facebook** (via NextAuth FacebookProvider)

#### Configuration
**File**: `lib/auth-options.ts`

```typescript
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {!
    async signIn({ user, account, profile }) {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email }
      });

      if (!existingUser) {
        // Create new user from OAuth profile
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: new Date(), // Auto-verified
            passwordHash: null, // No password for OAuth users
          }
        });
      }

      return true; // Allow sign in
    },
    
    async session({ session, token }) {
      // Attach user ID to session
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  }
};
```

#### Frontend Trigger
**File**: `components/auth/SignupForm.tsx`

```typescript
const handleSocialLogin = async (provider: string) => {
  setIsSocialLoading(provider); // Show loading state

  // Track analytics
  await trackSignup(provider, utmSource, utmMedium, utmCampaign);

  // Trigger NextAuth sign in
  await signIn(provider, {
    callbackUrl: "/dashboard"
  });
};

// Button
<Button onClick={() => handleSocialLogin('google')}>
  Continue with Google
</Button>
```

#### Post-OAuth Flow
After successful OAuth:
1. User redirected to `/dashboard`
2. Dashboard checks if `activeJarId` is null
3. If null: show CreateJarModal automatically
4. User creates first jar → sets as activeJarId

**Key Difference**: OAuth users have NO jar by default (unlike email signup)

---

### 3. Invite Link Signup Flow

#### URL Structure
```
https://app.com/signup?code=ABC123&pt=PREMIUM_TOKEN_123
```

**Parameters**:
- `code` (required): 6-character jar reference code
- `pt` (optional): Premium invite token for gifted subscriptions

#### Frontend Validation
**File**: `components/auth/SignupForm.tsx`

```typescript
useEffect(() => {
  if (inviteCode) {
    setIsValidating(true);
    
    // Validate code before showing form
    fetch('/api/jars/validate-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: inviteCode })
    })
      .then(res => res.json())
      .then(data => {
        if (!data.valid) {
          setCodeError(data.error || "Invalid invite code");
        } else {
          // Show jar preview
          setJarPreview(data.jar); // { name, memberCount, topic }
        }
      })
      .finally(() => setIsValidating(false));
  }
}, [inviteCode]);
```

#### Backend Validation
**File**: `app/api/jars/validate-invite/route.ts`

```typescript
export async function POST(request: Request) {
  const { code } = await request.json();

  const jar = await prisma.jar.findUnique({
    where: { referenceCode: code },
    include: {
      memberships: { select: { userId: true } }
    }
  });

  if (!jar) {
    return NextResponse.json({ valid: false, error: "Code not found" });
  }

  // Check member limit (if applicable)
  const MAX_MEMBERS = 50; // Example limit
  if (jar.memberships.length >= MAX_MEMBERS) {
    return NextResponse.json({ valid: false, error: "Jar is full" });
  }

  return NextResponse.json({
    valid: true,
    jar: {
      name: jar.name,
      topic: jar.topic,
      memberCount: jar.memberships.length
    }
  });
}
```

#### Signup with Invite Code
**File**: `app/api/auth/signup/route.ts`

```typescript
// Inside POST handler
if (inviteCode) {
  // 1. Verify jar exists
  const jar = await prisma.jar.findUnique({
    where: { referenceCode: inviteCode }
  });
  if (!jar) {
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
  }

  // 2. Check premium token
  let isPremiumGifted = false;
  if (premiumToken) {
    const inviter = await prisma.user.findFirst({
      where: { premiumInviteToken: premiumToken }
    });
    // Verify inviter (security check)
    if (inviter && inviter.email === 'graemedakers@gmail.com') {
      isPremiumGifted = true;
    }
  }

  // 3. Create user linked to jar
  user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      activeJarId: jar.id, // Set to invited jar
      isLifetimePro: isPremiumGifted, // Gift premium if valid
      verificationToken,
      emailVerified: null,
      memberships: {
        create: {
          jarId: jar.id,
          role: "MEMBER" // Not admin
        }
      }
    }
  });

  return NextResponse.json({
    success: true,
    requiresVerification: true,
    premiumGifted: isPremiumGifted
  });
}
```

#### Post-Signup Join
**File**: `hooks/useDashboardLogic.ts`

```typescript
useEffect(() => {
  if (isLoadingUser || !userData) return;

  const code = searchParams?.get('code');
  const premiumToken = searchParams?.get('pt');

  if (code) {
    const handleJoin = async () => {
      try {
        const res = await fetch('/api/jars/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, premiumToken })
        });

        const data = await res.json();

        if (res.ok) {
          if (data.premiumGifted) {
            showSuccess("Welcome! You've joined and upgraded to Premium!");
          } else {
            showSuccess("Successfully joined the jar!");
          }

          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
          
          // Refresh data
          handleContentUpdate();
        }
      } catch (error) {
        console.error("Join error:", error);
      }
    };
    handleJoin();
  }
}, [searchParams, userData, isLoadingUser]);
```

---

### 4. Demo Mode Signup

#### Demo Page Setup
**File**: `app/demo/page.tsx`

```typescript
export default function DemoPage() {
  const [demoIdeas, setDemoIdeas] = useState([]);
  const [aiQuota, setAiQuota] = useState(3); // Limited quota

  useEffect(() => {
    // Load pre-populated demo ideas
    setDemoIdeas(DEMO_IDEAS); // Hardcoded sample ideas
  }, []);

  const handleDemoSpin = () => {
    // Allow spinning with animations
    // But no database changes
  };

  const handleDemoAI = () => {
    if (aiQuota > 0) {
      setAiQuota(prev => prev - 1);
      // Show AI modal
    } else {
      // Show upgrade prompt
      openModal('DEMO_UPGRADE_PROMPT');
    }
  };

  return (
    <div>
      <DemoBanner>Read-only mode - Sign up to save!</DemoBanner>
      {/* Dashboard clone with demo data */}
    </div>
  );
}
```

#### Upgrade Prompt
**Component**: `DemoUpgradePrompt Modal`

```typescript
<Modal>
  <h2>Want to save your preferences?</h2>
  <ul>
    <li>✅ Save unlimited ideas</li>
    <li>✅ Invite friends to your jars</li>
    <li>✅ Unlock full AI tools</li>
  </ul>
  <Button onClick={() => router.push('/signup')}>
    Sign Up for Full Access
  </Button>
  <Button variant="ghost" onClick={closeModal}>
    Continue exploring demo
  </Button>
</Modal>
```

---

### 5. Onboarding Tour Activation

The onboarding tour is a critical part of the signup experience that guides new users through key features.

#### Trigger Logic
**Hook**: `hooks/features/useOnboarding.ts`

```typescript
export function useOnboarding({ userData, isLoadingUser }) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding before
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    
    // Trigger tour if:
    // 1. Never completed before
    // 2. User data fully loaded
    // 3. User is authenticated
    if (!hasCompletedOnboarding && !isLoadingUser && userData) {
      // 1 second delay to let dashboard render
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, [isLoadingUser, userData]);

  return { showOnboarding, setShowOnboarding, ... };
}
```

**Key Points**:
- **Storage**: Uses `localStorage` (persists across sessions)
- **Key**: `onboarding_completed` (boolean flag)
- **Delay**: 1 second after dashboard renders
- **Conditions**: 
  - User must be logged in (`userData` exists)
  - Data must be loaded (`!isLoadingUser`)
  - Flag must NOT exist in localStorage

---

#### Tour Steps
**Configuration**: `lib/onboarding-steps.ts`

```typescript
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '👋 Welcome to Decision Jar!',
    description: 'Your personal idea jar for dates...',
    position: 'center' // Full-screen modal
  },
  {
    id: 'add-idea',
    title: '💡 Add Your First Idea',
    description: 'Start by adding date ideas...',
    targetElement: '[data-tour="add-idea-button"]', // CSS selector
    position: 'top' // Tooltip position
  },
  {
    id: 'surprise-me',
    title: '✨ AI-Powered Ideas',
    description: 'Click Sparkles to let AI surprise you...',
    targetElement: '[data-tour="surprise-me-button"]',
    position: 'top'
  },
  {
    id: 'jar-visual',
    title: '🎲 Your Jar',
    description: 'Shows how many ideas are ready...',
    targetElement: '[data-tour="jar-visual"]',
    position: 'bottom'
  },
  {
    id: 'spin-jar',
    title: '🎯 Spin the Jar',
    description: 'Randomly select an idea...',
    targetElement: '[data-tour="spin-button-desktop"], [data-tour="spin-button"]',
    position: 'top'
  },
  {
    id: 'open-jar',
    title: '📂 Browse All Ideas',
    description: 'View, edit, or delete all your ideas...',
    targetElement: '[data-tour="list-tab"], [data-tour="list-tab-mobile"]',
    position: 'bottom'
  },
  {
    id: 'explore-menu',
    title: '🧭 Explore AI Tools',
    description: 'Discover specialized AI concierges...',
    targetElement: '[data-tour="explore-tab"], [data-tour="explore-tab-mobile"]',
    position: 'bottom'
  },
  {
    id: 'vault',
    title: '🏆 Your Vault',
    description: 'Completed ideas move here...',
    targetElement: '[data-tour="vault-tab"], [data-tour="vault-button"]',
    position: 'bottom'
  },
  {
    id: 'gamification',
    title: '⭐ Level Up Your Romance',
    description: 'Earn XP and unlock achievements...',
    targetElement: '[data-tour="trophy-case"]',
    position: 'bottom'
  },
  {
    id: 'jar-selector',
    title: '🏺 Multi-Jar Mastery',
    description: 'Create separate jars for different contexts...',
    targetElement: '[data-tour="jar-selector"]',
    position: 'bottom'
  },
  {
    id: 'complete',
    title: '🎉 You\'re All Set!',
    description: 'Start adding ideas and spinning!',
    position: 'center'
  }
];
```

**Step Types**:
- **Center modals**: Welcome & completion (no target element)
- **Element tooltips**: Feature highlights (with CSS selector targeting)

---

#### Component Rendering
**File**: `app/dashboard/page.tsx`

```typescript
// Lazy-loaded for performance
const OnboardingTour = dynamic(() => 
  import("@/components/Onboarding/OnboardingTour").then(m => m.OnboardingTour), 
  { ssr: false }
);

// In render
<OnboardingTour
  isOpen={showOnboarding}
  onClose={() => {
    handleSkipOnboarding();     // Sets localStorage flag
    setShowOnboarding(false);   // Hides tour
  }}
  onComplete={() => {
    handleCompleteOnboarding(); // Sets localStorage flag + analytics
    setShowOnboarding(false);
  }}
  steps={ONBOARDING_STEPS}
/>
```

**Lazy Loading**:
- Component not loaded on initial page load
- Only imported when `showOnboarding = true`
- Reduces initial bundle size

---

#### Completion Handlers

**Complete Handler**:
```typescript
const handleCompleteOnboarding = () => {
  localStorage.setItem('onboarding_completed', 'true');
  trackEvent('onboarding_completed', {});
};
```

**Skip Handler**:
```typescript
const handleSkipOnboarding = () => {
  localStorage.setItem('onboarding_completed', 'true');
  trackEvent('onboarding_skipped', {});
};
```

**Both handlers**:
- Set same localStorage flag (prevents re-showing)
- Track different analytics events
- Tour never shows again (unless flag manually deleted)

---

#### Restarting Tour

Users can restart the tour from Settings:

**Settings Modal** → "Restart Tour" button → Callback:
```typescript
onRestartTour={() => {
  localStorage.removeItem('onboarding_completed');
  setShowOnboarding(true);
}}
```

**Accessed via**:
- Settings modal (gear icon)
- Help menu → "Take the Tour Again"

---

#### Tour Variations by Signup Method

##### Direct Signup
- **Full 11-step tour**
- Focuses on all features
- Assumes user is new to app

##### Social Login (OAuth)
- **Same 11-step tour** (no variation currently)
- Could be shortened in future (user may have account elsewhere)

##### Invite Link Signup
- **Full tour** but may adapt messaging:
  - Emphasizes collaborative features (Step 9: Multi-Jar)
  - May highlight voting/group features
  - Same steps, potentially customized descriptions (TODO)

##### Demo Mode → Signup
- **Tour often skipped**:
  - User already familiar from demo
  - localStorage check happens AFTER signup
  - If user has `onboarding_completed` from demo session, tour won't show
  - **Recommendation**: Clear demo localStorage on signup

---

#### Analytics Tracking

**Events Tracked**:
```typescript
// Tour shown
trackEvent('onboarding_started', {
  signup_method: 'email' | 'google' | 'facebook' | 'demo',
  time_since_signup: milliseconds
});

// Tour completed
trackEvent('onboarding_completed', {
  steps_viewed: number,
  time_taken: milliseconds
});

// Tour skipped
trackEvent('onboarding_skipped', {
  steps_viewed: number,
  step_abandoned_at: string // step ID
});

// Individual step viewed
trackEvent('onboarding_step_viewed', {
  step_id: string,
  step_number: number
});
```

---

#### Testing the Tour

**Manual Testing**:
```javascript
// In browser console on dashboard

// 1. Clear flag to trigger tour
localStorage.removeItem('onboarding_completed');

// 2. Refresh page
location.reload();

// 3. Tour should appear after 1 second

// To skip tour
localStorage,setItem('onboarding_completed', 'true');
```

**Automated Testing** (Playwright):
```typescript
test('Onboarding tour shows for new users', async ({ page }) => {
  // Clear localStorage
  await page.evaluate(() => localStorage.clear());
  
  // Login as new user
  await page.goto('/dashboard');
  
  // Wait for tour to appear (1 second delay + render time)
  await page.waitForSelector('[data-testid="onboarding-tour"]', {
    timeout: 3000
  });
  
  // Verify welcome step
  await expect(page.locator('text=Welcome to Decision Jar')).toBeVisible();
  
  // Click through steps
  await page.click('button:has-text("Next")');
  
  // Verify step 2 (Add Idea button highlighted)
  await expect(page.locator('[data-tour="add-idea-button"]')).toHaveClass(/highlighted/);
  
  // Complete tour
  await page.click('button:has-text("Finish")');
  
  // Verify flag set
  const flag = await page.evaluate(() => 
    localStorage.getItem('onboarding_completed')
  );
  expect(flag).toBe('true');
});

test('Onboarding tour does not show for returning users', async ({ page }) => {
  // Set flag (simulating returning user)
  await page.evaluate(() => 
    localStorage.setItem('onboarding_completed', 'true')
  );
  
  await page.goto('/dashboard');
  await page.waitForTimeout(2000); // Wait past 1-second delay
  
  // Verify tour NOT visible
  await expect(page.locator('[data-testid="onboarding-tour"]')).not.toBeVisible();
});
```

---

#### Common Issues & Fixes

**Issue**: Tour shows every time user logs in
- **Cause**: localStorage being cleared on logout
- **Fix**: Ensure logout doesn't clear `onboarding_completed`

**Issue**: Tour doesn't show for new users
- **Cause**: 
  1. Another script setting the flag prematurely
  2. Dashboard component not loading user data
  3. useOnboarding hook conditions not met
- **Debug**:
  ```javascript
  // Check localStorage
  console.log(localStorage.getItem('onboarding_completed'));
  
  // Check user data loading
  console.log({ userData, isLoadingUser });
  ```

**Issue**: Tour shows but steps don't highlight elements
- **Cause**: CSS selectors in ONBOARDING_STEPS don't match DOM
- **Fix**: Verify `data-tour` attributes exist on target elements
- **Debug**:
  ```javascript
  // Check if selector matches
  document.querySelector('[data-tour="add-idea-button"]');
  ```

**Issue**: Tour breaks on mobile
- **Cause**: Different selectors for mobile vs desktop
- **Fix**: Use comma-separated selectors (already implemented):
  ```typescript
  targetElement: '[data-tour="spin-button-desktop"], [data-tour="spin-button"]'
  ```

---

#### Future Enhancements

**Potential Improvements**:
1. **Adaptive Tour**:
   - Skip jar creation step if user joined via invite
   - Skip voting step if jar is RANDOM mode
   - Highlight relevant features based on jar topic

2. **Progressive Disclosure**:
   - Core tour (5 steps) on first login
   - Advanced tour unlocked after 10 ideas added
   - Premium features tour after upgrade

3. **Video Walkthrough**:
   - Inline video demos for complex features
   - YouTube embed or Loom integration

4. **Interactive Quiz**:
   - Test user knowledge after tour
   - Award bonus XP for completion

5. **Contextual Help**:
   - Mini-tours triggered by feature usage
   - "?" icons that replay specific tour steps

---



### User Table
```prisma
model User {
  id                    String           @id @default(uuid())
  email                 String           @unique
  name                  String
  passwordHash          String?          // Null for OAuth users
  image                 String?          // OAuth profile picture
  
  // Verification
  emailVerified         DateTime?
  verificationToken     String?          // For email verification
  
  // Premium
  isLifetimePro         Boolean          @default(false)
  hasUsedTrial          Boolean          @default(false)
  
  // Jar context
  activeJarId           String?          // Current active jar
  homeTown              String?          // For AI context
  
  // Auth
  accounts              Account[]        // OAuth accounts
  sessions              Session[]        // NextAuth sessions
  
  // Relationships
  memberships           JarMember[]
  createdIdeas          Idea[]
  
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt
}
```

### Jar Table
```prisma
model Jar {
  id            String   @id @default(uuid())
  referenceCode String   @unique         // Invite code (e.g., "ABC123")
  name          String   @default("Our Jar")
  type          JarType  @default(SOCIAL) // ROMANTIC, SOCIAL, COMMUNITY
  topic         String   @default("General")
  selectionMode SelectionMode @default(RANDOM) // RANDOM, VOTE, ALLOCATION
  location      String   @default("Unknown")
  isPremium     Boolean  @default(false)
  
  memberships   JarMember[]
  ideas         Idea[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### JarMember Table
```prisma
model JarMember {
  id        String       @id @default(uuid())
  userId    String
  user      User         @relation(fields: [userId], references: [id])
  jarId     String
  jar       Jar          @relation(fields: [jarId], references: [id])
  role      MemberRole   @default(MEMBER) // ADMIN or MEMBER
  status    MemberStatus @default(ACTIVE)
  joinedAt  DateTime     @default(now())

  @@unique([userId, jarId]) // Prevent duplicate memberships
  @@index([userId])
  @@index([status])
}

enum MemberRole {
  ADMIN
  MEMBER
}
```

### Account Table (OAuth)
```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String  // "oauth"
  provider          String  // "google" or "facebook"
  providerAccountId String  // OAuth provider's user ID
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

---

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/signup`
**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "location": "New York, NY",
  "topic": "Dates",
  "selectionMode": "RANDOM",
  "inviteCode": "ABC123",      // Optional
  "premiumToken": "TOKEN_123"  // Optional
}
```

**Response (Success)**:
```json
{
  "success": true,
  "requiresVerification": true,
  "user": {
    "id": "user-uuid",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "premiumGifted": false,
  "premiumTokenInvalid": false
}
```

**Response (Error - User Exists)**:
```json
{
  "error": "User already exists"
}
```

---

#### GET `/api/auth/verify?token={verificationToken}`
**Response**: HTTP 302 redirect to `/login?verified=true`

---

#### POST `/api/auth/login`
**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response**:
```json
{
  "success": true,
  "user": { /* user object */ }
}
```

---

### Jar Endpoints

#### POST `/api/jars/validate-invite`
**Request Body**:
```json
{
  "code": "ABC123"
}
```

**Response (Valid)**:
```json
{
  "valid": true,
  "jar": {
    "name": "Friday Night Crew",
    "topic": "Activities",
    "memberCount": 4
  }
}
```

**Response (Invalid)**:
```json
{
  "valid": false,
  "error": "Code not found"
}
```

---

#### POST `/api/jars/join`
**Request Body**:
```json
{
  "code": "ABC123",
  "premiumToken": "TOKEN_123" // Optional
}
```

**Response**:
```json
{
  "success": true,
  "jarId": "jar-uuid",
  "message": "Successfully joined jar",
  "premiumGifted": false
}
```

---

## Edge Cases & Error Handling

### 1. Duplicate Email Registration
**Scenario**: User tries to sign up with email that already exists

**Handling**:
```typescript
// Backend: Return 400 with specific error
return NextResponse.json({ error: 'User already exists' }, { status: 400 });

// Frontend: Show AccountExistsError modal
if (data.error === "User already exists") {
  setAccountExistsError(true);
  // Offer auto-login with saved password
}
```

**UX**: 
- Show modal: "Account Already Exists"
- Option 1: "Sign In & Join Now" (auto-login if password matches)
- Option 2: "Use a different password" (manual login)
- Option 3: "Use a different email" (back to signup)

---

### 2. Invalid Invite Code
**Scenario**: User clicks invite link with expired/invalid code

**Handling**:
```typescript
// Validation returns error
{ valid: false, error: "Code not found" }

// Frontend shows error modal
if (codeError) {
  return (
    <Modal>
      <h2>Invalid Invite Link</h2>
      <p>{codeError}</p>
      <Button onClick={() => router.push('/signup')}>
        Sign Up Anyway
      </Button>
    </Modal>
  );
}
```

---

### 3. Full Jar (Member Limit Reached)
**Scenario**: User tries to join jar that's full

**Handling**:
```typescript
// Validation checks member count
if (jar.memberships.length >= MAX_MEMBERS) {
  return NextResponse.json({
    valid: false,
    error: "This jar is full"
  });
}

// Frontend shows specific error
{codeError === 'This jar is full' &&
  "This jar has reached its maximum capacity. You can create your own jar instead."
}
```

---

### 4. OAuth Email Already Exists (Email Signup)
**Scenario**: User has email account, tries to login with Google using same email

**Handling**:
```typescript
// NextAuth automatically links accounts
// If email already exists with password:
//   - Creates Account record (OAuth)
//   - Links to existing User
//   - User can now login via email OR Google
```

**Note**: Automatic account linking is ENABLED in NextAuth config

---

### 5. Premium Token Invalid or Expired
**Scenario**: User clicks invite with premium token, but token is invalid

**Handling**:
```typescript
// Backend checks token
const inviter = await prisma.user.findFirst({
  where: { premiumInviteToken: premiumToken }
});

if (!inviter || inviter.email !== 'graemedakers@gmail.com') {
  isPremiumGifted = false; // Token invalid
}

// Return flag
return NextResponse.json({
  success: true,
  premiumGifted: false,
  premiumTokenInvalid: true // User notified
});

// Frontend shows alert
if (data.premiumTokenInvalid) {
  alert("Account created, but Premium link was invalid. You are on Free plan.");
}
```

---

### 6. Email Verification Never Clicked
**Scenario**: User signs up but never verifies email

**Handling**:
- Login still works (email verification NOT enforced currently)
- Optional: Block premium features until verified
- Optional: Re-send verification email from Settings

**Future**: Add `requireEmailVerification` flag to enforce

---

### 7. Network Error During Signup
**Scenario**: API call fails due to network issue

**Handling**:
```typescript
try {
  const res = await fetch("/api/auth/signup", { ... });
  const data = await res.json();
} catch (error) {
  console.error("Signup Fetch Error:", error);
  alert("An error occurred during signup. Please try again.");
} finally {
  setIsLoading(false); // Re-enable submit button
}
```

---

## Testing Checklists

### Manual Testing Checklist

#### Direct Signup
- [ ] Valid email/password creates account
- [ ] Invalid email shows error (e.g., "notanemail")
- [ ] Weak password rejected (if validation added)
- [ ] Duplicate email shows "Account Exists" modal
- [ ] Auto-login from "Account Exists" works
- [ ] Verification email sent (check inbox)
- [ ] Verification link redirects to login
- [ ] New jar created if topic specified
- [ ] User is ADMIN of created jar
- [ ] Onboarding tour appears on first login

#### Social Login (Google)
- [ ] Google OAuth flow completes
- [ ] Profile data (name, email, image) imported
- [ ] Email auto-verified (no verification email)
- [ ] No jar created (manual prompt shown)
- [ ] "Create Your First Jar" modal appears
- [ ] Jar creation works from modal
- [ ] Account linking works (if email already exists)

#### Invite Link Signup
- [ ] Valid invite code shows jar preview
- [ ] Invalid code shows error modal
- [ ] Signup creates user with MEMBER role
- [ ] Auto-join after verification works
- [ ] Dashboard shows invited jar content
- [ ] Invited user can add ideas immediately
- [ ] Premium token grants lifetime pro (if valid)
- [ ] Invalid premium token shows alert

#### Demo Mode
- [ ] Demo page loads with pre-populated ideas
- [ ] Spin animation works (no database changes)
- [ ] AI quota limit enforced (3 generations)
- [ ] Upgrade prompt appears after quota
- [ ] "Sign Up" CTA redirects correctly
- [ ] Demo data NOT migrated to real account

### Automated Testing (Jest/Playwright)

```typescript
describe('Signup Flows', () => {
  
  test('Direct signup creates user and jar', async () => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        topic: 'Activities'
      })
    });
    
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.requiresVerification).toBe(true);
    
    // Verify user in database
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    expect(user).toBeDefined();
    expect(user.activeJarId).toBeDefined();
  });
  
  test('Invite link signup joins existing jar', async () => {
    // Setup: Create jar with code ABC123
    const jar = await prisma.jar.create({
      data: { referenceCode: 'ABC123', name: 'Test Jar' }
    });
    
    // Signup with invite code
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Invited User',
        email: 'invited@example.com',
        password: 'password123',
        inviteCode: 'ABC123'
      })
    });
    
    const data = await response.json();
    expect(data.success).toBe(true);
    
    // Verify membership created
    const membership = await prisma.jarMember.findFirst({
      where: {
        jar: { referenceCode: 'ABC123' },
        user: { email: 'invited@example.com' }
      }
    });
    expect(membership).toBeDefined();
    expect(membership.role).toBe('MEMBER');
  });
  
  test('Duplicate email returns error', async () => {
    // Create existing user
    await prisma.user.create({
      data: {
        email: 'existing@example.com',
        name: 'Existing',
        passwordHash: 'hash'
      }
    });
    
    // Try to signup with same email
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate',
        email: 'existing@example.com',
        password: 'password123'
      })
    });
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('User already exists');
  });
  
});
```

---

## Analytics & Tracking

### Key Events to Track

```typescript
// Signup started
trackEvent('signup_started', {
  method: 'email' | 'google' | 'facebook',
  has_invite_code: boolean,
  utm_source: string,
  utm_campaign: string
});

// Signup completed
trackSignup('email', utmSource, utmMedium, utmCampaign);

// Identify user (PostHog)
identifyUser(userId, {
  email: email,
  name: name,
  signup_method: 'email' | 'google' | 'facebook',
  utm_source: utmSource
});

// Email verification clicked
trackEvent('email_verified', {
  time_since_signup: milliseconds
});

// Jar created
trackEvent('jar_created', {
  topic: string,
  selection_mode: string,
  via_signup: boolean
});

// Invite accepted
trackEvent('invite_accepted', {
  jar_id: string,
  premium_gifted: boolean
});
```

### Conversion Funnel Metrics

```
Landing Page Views: 10,000
  ↓ 30%
Signup Page Views: 3,000
  ↓ 70%
Signups Completed: 2,100
  ↓ 60%
Email Verified: 1,260
  ↓ 90%
First Idea Added: 1,134
  ↓ 85%
First Spin: 964
```

**Drop-off Points**:
1. **Signup page → Signup completed (30% loss)**
   - Reason: Form friction, too many fields
   - Fix: Reduce required fields, add social login

2. **Signup → Email verification (40% loss)**
   - Reason: Users don't check email
   - Fix: Allow immediate dashboard access, verify later

3. **Email verified → First idea (10% loss)**
   - Reason: Unclear onboarding
   - Fix: Stronger "Add Idea" CTA, auto-populate sample ideas

---

## Security Considerations

### 1. Password Hashing
- **Algorithm**: bcrypt
- **Rounds**: 10 (cost factor)
- **Never store plaintext passwords**

### 2. Email Verification Tokens
- **Generation**: `crypto.randomBytes(32).toString('hex')`
- **Storage**: Database column `verificationToken`
- **Expiration**: None currently (consider adding 24h expiry)
- **One-time use**: Token cleared after verification

### 3. Premium Invite Tokens
- **Restricted**: Only specific authorized users (e.g., `graemedakers@gmail.com`)
- **Validation**: Backend checks user.premiumInviteToken AND user.email
- **No auto-gifting**: Manual approval process

### 4. Invite Code Security
- **Length**: 6 characters (36^6 = ~2 billion combinations)
- **Format**: Alphanumeric uppercase
- **Public sharing**: Codes are NOT secret (shareable links)
- **Rate limiting**: Consider limiting join attempts per IP

### 5. SQL Injection Prevention
- **ORM**: Prisma (parameterized queries)
- **Input validation**: All user inputs validated/sanitized

### 6. XSS Prevention
- **React**: Auto-escapes JSX
- **User content**: Descriptions stored as plain text, rendered safely

---

## Common Issues & Debugging

### Issue: "User already exists" but user claims they can't login
**Diagnosis**:
- User may have signed up with different email capitalization
- User may have used OAuth originally

**Solution**:
```sql
-- Find user by case-insensitive email
SELECT * FROM "User" WHERE LOWER(email) = LOWER('user@example.com');
```

---

### Issue: Verification email not received
**Diagnosis**:
- Email provider blocked as spam
- Email sent to wrong address
- Email service (Resend/SendGrid) down

**Solution**:
- Check email service logs
- Resend verification from Settings
- Manually verify user in database:
```sql
UPDATE "User" SET "emailVerified" = NOW(), "verificationToken" = NULL WHERE email = 'user@example.com';
```

---

### Issue: Invite link shows "Invalid code" but code is correct
**Diagnosis**:
- Code case sensitivity (codes are uppercase)
- Jar was deleted
- Database sync issue

**Solution**:
```sql
-- Check if jar exists
SELECT * FROM "Jar" WHERE "referenceCode" = 'ABC123';

-- If exists but validation fails, check application code
```

---

### Issue: OAuth signup creates duplicate accounts
**Diagnosis**:
- Account linking disabled
- Email mismatch (OAuth email differs from signup email)

**Solution**:
- Enable account linking in NextAuth config
- Manually merge accounts in database (advanced)

---

## Quick Reference Commands

### Check Signup Stats (SQL)
```sql
-- Total signups today
SELECT COUNT(*) FROM "User" WHERE DATE("createdAt") = CURRENT_DATE;

-- Signups by method
SELECT 
  CASE 
    WHEN "passwordHash" IS NULL THEN 'OAuth'
    ELSE 'Email'
  END AS method,
  COUNT(*)
FROM "User"
GROUP BY method;

-- Verification rate
SELECT 
  COUNT(*) FILTER (WHERE "emailVerified" IS NOT NULL) AS verified,
  COUNT(*) FILTER (WHERE "emailVerified" IS NULL) AS unverified
FROM "User";
```

### Manually Verify User
```sql
UPDATE "User" 
SET "emailVerified" = NOW(), "verificationToken" = NULL 
WHERE email = 'user@example.com';
```

### Manually Add User to Jar
```sql
INSERT INTO "JarMember" ("id", "userId", "jarId", "role", "status", "joinedAt")
VALUES (
  gen_random_uuid(),
  'user-uuid',
  'jar-uuid',
  'MEMBER',
  'ACTIVE',
  NOW()
);
```

---

**Document Maintained By**: Engineering Team  
**Last Updated**: January 11, 2026  
**Related Docs**: 
- `CUSTOMER_JOURNEYS.md` (user-facing journeys)
- `API_ENDPOINT_STATUS.md` (API documentation)
- `TECHNICAL_REFERENCE.md` (system architecture)
