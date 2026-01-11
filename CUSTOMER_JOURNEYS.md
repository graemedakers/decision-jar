# Decision Jar - Customer Journeys Documentation
**Version**: 1.0  
**Date**: January 11, 2026  
**Purpose**: Comprehensive mapping of all typical customer journeys with detailed signup processes

---

## Table of Contents
1. [User Personas](#user-personas)
2. [Signup & Onboarding Journeys](#signup--onboarding-journeys)
3. [Core Usage Journeys](#core-usage-journeys)
4. [Collaboration Journeys](#collaboration-journeys)
5. [Premium Conversion Journeys](#premium-conversion-journeys)
6. [Advanced Features Journeys](#advanced-features-journeys)
7. [Retention & Re-engagement Journeys](#retention--re-engagement-journeys)

---

## User Personas

### Primary Personas

#### 1. Solo Organizer (Lisa)
- **Demographics**: 25-35, urban professional
- **Jar Type**: PERSONAL
- **Primary Goal**: Overcome decision paralysis for personal activities
- **Pain Points**: Blank canvas syndrome, lack of inspiration
- **Premium Likelihood**: Low (20%)
- **Key Features**: AI idea generation, quick spin, favorites

#### 2. Couple Coordinator (Mark & Sarah)
- **Demographics**: 28-40, relationship-focused
- **Jar Type**: ROMANTIC (default for dating topics)
- **Primary Goal**: Fair and fun decision-making for date nights
- **Pain Points**: "I don't know, what do you want?" loops
- **Premium Likelihood**: Medium (45%)
- **Key Features**: Shared jar, surprise me, date night planner

#### 3. Group Admin (Jake)
- **Demographics**: 30-45, social organizer
- **Jar Type**: SOCIAL (GROUP)
- **Primary Goal**: Democratic decision-making for friend groups
- **Pain Points**: Coordinating schedules, getting everyone's input
- **Premium Likelihood**: High (65%)
- **Key Features**: Voting system, member management, task allocation

#### 4. Community Leader (Amanda)
- **Demographics**: 35-50, community builder
- **Jar Type**: COMMUNITY (Premium-only)
- **Primary Goal**: Curate and share ideas with community
- **Pain Points**: Moderation overhead, scaling engagement
- **Premium Likelihood**: Very High (85%)
- **Key Features**: Public jars, moderation tools, discovery

---

## Signup & Onboarding Journeys

### Journey 1A: Direct Signup (Solo User)

**Entry Point**: Landing page → "Get Started" CTA

#### Step-by-Step Flow:

1. **Landing Page**
   - User arrives via: organic search, social media, referral
   - Views hero section with value proposition
   - Clicks "Get Started" button

2. **Signup Form** (`/signup`)
   - **Required Fields**:
     - Name (e.g., "Lisa Chen")
     - Email (auto-lowercased and trimmed)
     - Password (min 8 characters, bcrypt hashed)
   
   - **Optional Advanced Setup** (collapsible section):
     - Location (e.g., "New York, NY") - powers AI recommendations
     - Jar Topic (Activities, Dates, Food, Movies, etc.)
     - Play Mode (Random Spin, Voting Session, Task Allocation)
     - Selection Mode (defaults to RANDOM)

3. **Account Creation** (Backend: `/api/auth/signup`)
   - Email uniqueness validation
   - Password hashing (bcrypt, 10 rounds)
   - Verification token generation (32-byte crypto)
   - User record created in database
   - Automatic jar creation if topic specified:
     - Jar name: "{Name}'s {Topic} Jar" (e.g., "Lisa's Activities Jar")
     - Reference code: 6-character alphanumeric (e.g., "AB3K9P")
     - User assigned as ADMIN role
     - Jar linked as activeJarId
   - Auto-enrollment in feedback jars (BUGRPT, FEATREQ)

4. **Email Verification**
   - Verification email sent to user
   - User clicks link in email
   - Email verified in database
   - Redirect to `/dashboard`

5. **First Dashboard Experience**
   - **Onboarding Tour Activation** (automatic for new users):
     - Checks localStorage for `onboarding_completed` flag
     - If NOT found AND user data loaded → triggers tour after 1 second delay
     - OnboardingTour component renders with ONBOARDING_STEPS:
       1. Welcome message (center modal)
       2. Add idea button highlight (`[data-tour="add-idea-button"]`)
       3. AI "Surprise Me" feature (`[data-tour="surprise-me-button"]`)
       4. Jar visual explanation (`[data-tour="jar-visual"]`)
       5. Spin button tutorial (`[data-tour="spin-button-desktop"]`)
       6. Browse ideas tab (`[data-tour="list-tab"]`)
       7. Explore menu (`[data-tour="explore-tab"]`)
       8. Vault/memories (`[data-tour="vault-tab"]` or `[data-tour="vault-button"]`)
       9. Gamification (`[data-tour="trophy-case"]`)
       10. Multi-jar management (`[data-tour="jar-selector"]`)
       11. Completion message (center modal)
   
   - **Tour Completion**:
     - User clicks "Complete" → Sets `onboarding_completed = true` in localStorage
     - User clicks "Skip" → Also sets `onboarding_completed = true`
     - Analytics event tracked: `onboarding_completed` or `onboarding_skipped`
     - Tour can be restarted from Settings menu via "Restart Tour" option
   
   - **If Jar is Empty** (parallel to tour):
     - EnhancedEmptyState component shown with CTAs:
       - "Add your first idea!" (manual entry)
       - "Try AI Surprise Me" (AI generation)
       - "Browse templates" (template import)
     - JarQuickStartModal may appear (if not dismissed for this jarId)

6. **First Idea Added**
   - User adds idea via:
     - Manual form (AddIdeaModal)
     - Smart input bar (text/link/image)
     - AI generation (SurpriseMeModal)
     - Template browser
   - **Gamification trigger**: +15 XP
   - Possible level up animation
   - Idea appears in jar visual

7. **First Spin**
   - User clicks "Spin the Jar"
   - Optional filters applied (duration, cost, etc.)
   - 3D jar animation with haptic feedback
   - Idea revealed in DateRevealModal
   - **Gamification trigger**: +5 XP
   - Options:
     - "Go Tonight" (marks as selected)
     - "Plan for Later" (date picker)
     - "Not Feeling It" (return to jar)

**Success Metrics**:
- Time to first idea: <2 minutes
- Email verification rate: >60%
- Ideas added in first session: >3
- First spin within: <5 minutes

---

### Journey 1B: Social Login Signup (Google/Facebook)

**Entry Point**: Landing page → Social login button

#### Step-by-Step Flow:

1. **Landing Page**
   - User clicks "Continue with Google" or "Continue with Facebook"
   - Social loading state triggered

2. **OAuth Flow**
   - Redirect to OAuth provider (Google/Facebook)
   - User grants permissions
   - OAuth callback received with account data

3. **Account Creation** (NextAuth.js callbacks)
   - Automatic user creation if new
   - Profile data (name, email, image) pre-populated
   - No password required (OAuth-only account)
   - Email automatically verified (trusted provider)
   - **NO jar created automatically** (requires manual setup)

4. **First Login Redirect**
   - Redirect to `/dashboard`
   - Check for `isNewUser` flag
   - If new: show "Create Your First Jar" modal

5. **Quick Jar Setup**
   - Modal prompts for:
     - Jar name
     - Topic selection
     - Location (optional)
   - Creates jar with user as ADMIN
   - Sets as activeJarId

6. **Onboarding Tour**
   - Same tutorial as direct signup
   - Customized messaging: "Welcome back via Google!"

**Success Metrics**:
- OAuth completion rate: >75%
- Jar creation after social login: >50%
- Time to first jar creation: <1 minute

---

### Journey 1C: Invite Link Signup (Joining Existing Jar)

**Entry Point**: Invite link shared by existing user (e.g., `/signup?code=AB3K9P`)

#### Step-by-Step Flow:

1. **Invite Link Clicked**
   - URL contains invite code: `?code=ABC123`
   - Optional premium token: `?code=ABC123&pt=PREMIUM_TOKEN`
   - Redirect to `/signup` with code pre-filled

2. **Code Validation** (Frontend)
   - Automatic validation via `/api/jars/validate-invite`
   - Checks:
     - Code exists
     - Jar is not full (if member limit exists)
     - Code is not expired
   - If invalid: show error modal with CTA to create own jar
   - If valid: show jar preview (name, member count, topic)

3. **Signup Form** (Pre-contextualized)
   - Header changes to "Join {Jar Name}"
   - Tagline: "You've been invited to join a jar!"
   - PWA install banner shown (if invite code present)
   - Same fields as standard signup:
     - Name
     - Email
     - Password
     - Location (optional)

4. **Account Creation** (Backend: `/api/auth/signup`)
   - User created with:
     - Basic profile info
     - `activeJarId` set to invited jar
     - Membership created with role: MEMBER
   - **Premium Token Handling**:
     - If valid token from authorized inviter: `isLifetimePro = true`
     - Else: normal free account
   - NO new jar created (joins existing)

5. **Auto-Join on Dashboard**
   - Email verification sent
   - After verification, redirect to `/dashboard?code=ABC123`
   - Dashboard `useEffect` detects code parameter
   - Auto-calls `/api/jars/join` with code
   - Success toast: "Successfully joined the jar!"
   - URL cleaned (parameters removed)

6. **Joined Jar Experience**
   - Dashboard shows shared jar with existing ideas
   - Onboarding tour adapted:
     - Highlights collaborative features
     - Shows voting system (if applicable)
     - Member management explained
   - User sees ideas from other members
   - Can add own ideas immediately

**Success Metrics**:
- Invite link conversion rate: >40%
- Time from invite click to signup: <2 minutes
- Ideas added by invited users within 24h: >2

---

### Journey 1D: Demo Mode to Signup

**Entry Point**: Landing page → "Try Demo" button

#### Step-by-Step Flow:

1. **Demo Page** (`/demo`)
   - Pre-populated jar with 10-15 sample ideas
   - All features unlocked (temporary)
   - Read-only mode: can view and spin, cannot edit
   - AI tools available with quota limits

2. **Demo Interaction**
   - User spins jar (animations work)
   - User views ideas
   - User tries AI tools (e.g., Date Night Planner)
   - After 3-5 interactions: quota limit hit

3. **Upgrade Prompt** (DemoUpgradePrompt modal)
   - "Want to save your preferences and create real jars?"
   - Benefits list:
     - Save unlimited ideas
     - Invite friends
     - Unlock AI tools
   - CTA: "Sign Up for Full Access"

4. **Signup Flow**
   - Redirect to `/signup`
   - Optional: migrate demo preferences to account
   - Standard signup process continues

5. **Post-Signup**
   - Empty jar created (demo data NOT migrated by default)
   - Onboarding tour skipped (user already familiar)
   - CTA: "Import demo ideas?" (optional feature)

**Success Metrics**:
- Demo-to-signup conversion: >25%
- Demo session duration: >3 minutes
- AI tool trials in demo: >1

---

## Core Usage Journeys

### Journey 2A: Adding Ideas (Manual Entry)

**Trigger**: User needs to add a new idea to jar

#### Step-by-Step Flow:

1. **Dashboard**
   - Click "Add Idea" button (+ icon)
   - OR: Use Smart Input Bar

2. **AddIdeaModal Opens**
   - **Wizard Mode** (for new users):
     - Step 1: Description (required)
     - Step 2: Attributes (duration, cost, energy, setting)
     - Step 3: Category selection
   - **Expert Mode** (toggle available):
     - All fields shown at once
     - Details field (optional notes)
     - Photo URL (optional)
     - Location (optional)
     - Time of day preference
     - Weather consideration

3. **Form Submission**
   - Validation checks:
     - Description not empty
     - Valid category
     - Valid enum values
   - API call: `createIdea()` server action
   - Database insert with:
     - `createdById`: current user
     - `jarId`: active jar
     - `status`: APPROVED (auto-approved for non-community jars)

4. **Success State**
   - **Gamification**: +15 XP awarded
   - Level up check (if threshold crossed)
   - Idea appears in jar visual immediately
   - Success toast: "Idea added to jar!"
   - Modal auto-closes

5. **Post-Add Experience**
   - Jar count increments
   - Jar fill animation updates
   - Idea available for next spin

**Frequency**: 2-5 times per week (active users)
**Success Rate**: >95%

---

### Journey 2B: AI-Assisted Idea Generation

**Trigger**: User wants inspiration, clicks "Surprise Me" (✨)

#### Step-by-Step Flow:

1. **Dashboard**
   - Click Sparkles icon (✨) OR
   - Click "Surprise Me" button in Smart Input Bar

2. **SurpriseMeModal Opens**
   - Category selector (optional filter):
     - All Categories
     - Activities
     - Meals
     - Events
     - Custom
   - User location context shown
   - "Generate" button

3. **AI Generation**
   - Loading state: "Crafting your surprise..."
   - API call: `/api/magic-idea`
   - AI considers:
     - User location (`userData.location`)
     - Selected category
     - Existing ideas (to avoid duplicates)
     - Current season/weather
   - Response: structured idea object

4. **Review Generated Idea**
   - Preview card shown:
     - Description
     - Suggested attributes (duration, cost, etc.)
     - Category
     - "Hidden surprise" tag (details stay secret until spin)
   - Actions:
     - "Save" (accept as-is)
     - "Edit" (modify before saving)
     - "Regenerate" (try again)

5. **Save to Jar**
   - If edited: user tweaks in inline form
   - Click "Save"
   - Same process as manual idea creation
   - **Special flag**: `isSurprise: true`
   - **Gamification**: +15 XP

6. **Post-Generation**
   - Modal closes
   - Success toast
   - Idea added to jar (details hidden in list view)

**Frequency**: 1-3 times per week (engaged users)
**Premium Gate**: Free tier = 5 AI generations/month, Pro = unlimited

---

### Journey 2C: Spinning the Jar (Core Loop)

**Trigger**: User ready to decide on an activity

#### Step-by-Step Flow:

1. **Dashboard**
   - Click main "Spin the Jar" button (mobile or desktop)
   - OR: Use quick spin (if no filters)

2. **SpinFiltersModal Opens**
   - **Filter Options**:
     - Max Duration (15min, 30min, 1h, 2h, 4h, All Day)
     - Max Cost (Free, $, $$, $$$, $$$$)
     - Activity Level (Low, Medium, High, Any)
     - Time of Day (Morning, Afternoon, Evening, Any)
     - Category (specific or Any)
     - Weather (Indoor, Outdoor, Any)
     - Local Only (toggle)
   - "Skip Filters & Spin" quick option
   - "Apply Filters & Spin" button

3. **Spin Animation**
   - Loading state: 2-3 seconds
   - 3D jar rotation animation
   - Random ticking sounds (audio feedback)
   - Haptic feedback on mobile (vibration patterns)
   - Server-side random selection:
     - Filter ideas by criteria
     - Exclude already selected ideas (unless "include completed" toggled)
     - Random pick from matches

4. **No Matches Scenario**
   - Error modal: "No matching ideas found"
   - Suggestions:
     - Relax filters
     - Add more ideas
     - Use AI to generate matching idea

5. **Reveal Animation**
   - DateRevealModal opens
   - Card flip animation
   - Confetti burst (on first spin)
   - **Gamification**: +5 XP awarded

6. **Reveal Screen** (DateRevealModal)
   - **Displays**:
     - Idea description
     - Full details (unless surprise)
     - Location (if specified)
     - Duration, cost, energy level icons
     - Photo (if uploaded)
   
   - **Action Buttons**:
     - **"Go Tonight"**:
       - Sets `selectedAt = now()`
       - Moves idea to Memories/Vault
       - Email notification to jar members
       - Optional: prompt to add photos later
     
     - **"Plan for Later"**:
       - Date picker opens
       - Sets `selectedDate` to chosen date
       - Idea stays in jar until date
       - Calendar reminder option
     
     - **"Not Feeling It"**:
       - Returns idea to jar (`selectedAt = null`)
       - Can spin again immediately
       - No XP penalty
     
     - **"Share"**:
       - Native share sheet
       - Generates shareable text/link
     
     - **"Find Places"** (for generic ideas):
       - Opens Google Maps integration
       - Searches for relevant venues nearby
       - Can save venue as new specific idea

7. **Post-Spin**
   - Modal closes
   - Dashboard updates (idea removed if selected)
   - Next spin ready

**Frequency**: 3-7 times per week (active users)
**Success Rate**: >80% (user accepts or reschedules idea)

---

### Journey 2D: Rating a Completed Activity

**Trigger**: User completes an activity from jar

#### Step-by-Step Flow:

1. **Memories Page** (`/memories`)
   - Navigate via bottom nav "Vault" tab
   - Shows list of completed ideas (selectedAt !== null)
   - Sorted by completion date (newest first)

2. **Click Completed Idea**
   - ViewMemoryModal opens
   - Shows original idea details
   - Current rating (if already rated)

3. **"Rate This Date" Button**
   - RateDateModal opens
   - **Rating Options**:
     - 1-5 stars (large tap targets)
     - Optional text notes
     - Optional activity date (if not set)
     - Photo upload (up to 3)

4. **Photo Upload Options**:
   - **Google Photos Integration** (Premium):
     - OAuth flow to Google Photos
     - Picker modal
     - Select up to 3 photos
     - Uploaded to Cloudinary
     - URLs stored in `idea.photoUrls[]`
   
   - **Device Upload** (Free):
     - Standard file picker
     - Max 3 images
     - Compressed before upload

5. **Submit Rating**
   - API call: `updateIdea()` with rating data
   - **Gamification**:
     - 5 stars: +100 XP
     - 4 stars: +75 XP
     - 3 stars: +50 XP
     - 1-2 stars: +25 XP
   - Level up check

6. **Post-Rating**
   - Success toast: "Memory saved!"
   - Modal closes
   - Memory card updates with rating stars
   - Photo thumbnails visible

**Frequency**: 60% of completed activities get rated
**Photo Upload Rate**: 30% (higher for Premium users)

---

## Collaboration Journeys

### Journey 3A: Creating a Group Jar

**Trigger**: User wants to create shared jar for friends/family

#### Step-by-Step Flow:

1. **Dashboard**
   - Click jar name in header (Jar Switcher)
   - Dropdown shows current jars
   - Click "+ New Jar"

2. **CreateJarModal Opens**
   - **Fields**:
     - Jar Name (e.g., "Friday Night Crew")
     - Topic (Activities, Movies, Restaurants, etc.)
     - Type:
       - Personal (solo)
       - Romantic (couple, 2 people)
       - Social (group, private)
       - Community (public, Premium-only)
     - Selection Mode:
       - Random Spin (default)
       - Voting Session
       - Task Allocation
     - Custom Categories (optional, advanced)

3. **Jar Creation**
   - API call: `/api/jars/create`
   - Database record:
     - Unique `referenceCode` generated (6 chars)
     - User assigned as ADMIN role
     - Default settings applied

4. **Post-Creation**
   - Switched to new jar (activeJarId updated)
   - Empty jar state shown
   - **Prominent CTA**: "Invite Members"
   - **Secondary CTA**: "Add Ideas"

5. **Invite Flow Triggered**
   - See Journey 3B

**Frequency**: Power users create 2-3 jars (average: 1.5 jars/user)
**Free Tier Limit**: 3 jars max
**Premium Limit**: 50 jars max

---

### Journey 3B: Inviting Members to Jar

**Trigger**: Jar admin wants to add collaborators

#### Step-by-Step Flow:

1. **Invite Button**
   - Dashboard "Invite Members" widget OR
   - Settings Modal → Members tab OR
   - JarManagerModal → Invite action

2. **Invite Modal/Panel**
   - **Displays**:
     - Jar name and topic
     - Current member count
     - Invite code (referenceCode): **ABC123**
     - Generated invite link: `app.com/signup?code=ABC123`
   
   - **Share Options**:
     - "Copy Link" button
     - Native share sheet (WhatsApp, Messages, Email)
     - QR code (for in-person sharing)
     - Email invite (future feature)

3. **Recipient Experience**
   - See **Journey 1C** (Invite Link Signup)

4. **Member Joins**
   - Admin receives notification (future: push notification)
   - Member count increments
   - Member name appears in Members list
   - Member can immediately view and add ideas

5. **Member Management** (Admin Actions)
   - **View Members**:
     - SettingsModal → Members tab
     - Shows all members with roles
   
   - **Promote/Demote**:
     - Toggle ADMIN/MEMBER role
     - Cannot demote last admin
     - Instant permission changes
   
   - **Remove Member**:
     - Confirmation modal
     - Member removed from jar
     - Member loses access to ideas
     - Ideas created by removed member stay (orphaned or reassigned)

**Average Members per Jar**:
- Romantic: 2 (fixed)
- Social: 3-8
- Community: 10-500+

---

### Journey 3C: Voting System (Group Decision)

**Trigger**: Group wants democratic selection, admin starts vote

#### Admin Flow: Starting a Vote

1. **Dashboard** (Group Jar with selectionMode: VOTE)
   - Admin sees "Start Vote" button
   - Click to initiate

2. **Start Vote Configuration**
   - **Options**:
     - Time Limit:
       - 1 hour (quick decisions)
       - 3 hours
       - 24 hours
       - 48 hours
       - 3 days
       - 1 week
       - No limit
     - Tie-Breaker Mode:
       - Random Pick (system decides)
       - Re-Vote (run-off vote)
     - Eligible Ideas:
       - All ideas
       - Specific category
       - Manual selection (future)

3. **Vote Session Creation**
   - API call: `startVote()` server action
   - Database:
     - VoteSession record created
     - Status: ACTIVE
     - `expiresAt` timestamp (if time limit)
     - All members notified (email + push)

4. **Active Vote State**
   - Dashboard UI changes for all members:
     - Regular spin button hidden
     - VotingManager component shown
     - Vote progress indicator

#### Member Flow: Casting Vote

1. **Dashboard** (Active Vote)
   - VotingManager displays:
     - Session timer (if applicable)
     - Eligible ideas (cards with details)
     - Vote progress: "3/5 votes cast"

2. **Idea Selection**
   - Member reviews idea cards
   - Clicks on preferred idea
   - Confirmation: "Vote for '{idea}'?"

3. **Vote Submission**
   - API call: `castVote()` server action
   - **Validations**:
     - User hasn't already voted in this session
     - User cannot vote for own idea (if configured)
     - Session is still active
   - Vote record created

4. **Post-Vote State**
   - UI updates to "Waiting for others..."
   - Shows who has/hasn't voted (if enabled)
   - Cannot change vote (unless admin allows)

#### Resolution Flow: Vote Completes

**Triggers**:
- All members voted
- Time limit expired
- Admin manually resolves

1. **Vote Counting**
   - System tallies votes
   - **Single Winner**:
     - Idea with most votes selected
     - marked as winning idea
   
   - **Tie Scenario**:
     - **Random Tiebreaker**:
       - System randomly picks from tied ideas
     - **Re-Vote Tiebreaker**:
       - New vote session created
       - Only tied ideas eligible
       - Shorter time limit

2. **Winner Reveal**
   - All members see DateRevealModal simultaneously
   - Winning idea displayed
   - Vote breakdown shown (who voted for what)
   - **Gamification**: +5 XP for all voters

3. **Post-Vote Actions**
   - Same options as normal spin:
     - Go Tonight
     - Plan for Later
     - Reject (rare in voting, but allowed)

**Usage**:
- 30% of group jars use voting
- Average votes per jar: 2-4 per month
- Participation rate: >70%

---

## Premium Conversion Journeys

### Journey 4A: Free User Hits Limit

**Triggers**:
- AI generation quota exceeded (5/month)
- Attempts to create Community jar
- Reaches 3 jar limit
- AI tool usage blocked

#### Step-by-Step Flow:

1. **Feature Attempt**
   - User tries premium action
   - Feature blocked immediately

2. **PremiumBlockerModal Opens**
   - **Header**: "Upgrade to Pro"
   - **Explains Limitation**:
     - "You've used 5/5 AI generations this month"
     - OR "Community jars require Premium"
     - OR "You've reached the 3 jar limit"
   
   - **Benefits Highlight**:
     - Unlimited AI generations
     - Up to 50 jars
     - Community jar creation
     - Google Photos integration
     - Priority support
     - No ads
   
   - **Pricing Display**:
     - Monthly: $X/month
     - Annual: $Y/year (save 20%)
   
   - **CTAs**:
     - "Start 7-Day Free Trial" (primary)
     - "Learn More" (secondary)
     - "Maybe Later" (dismiss)

3. **Trial/Upgrade Decision**
   - Click "Start Trial"
   - Redirect to Stripe Checkout

4. **Stripe Checkout Flow**
   - See **Journey 4B**

**Conversion Rate**:
- AI limit hit → Trial: 18%
- Jar limit hit → Trial: 12%
- Community jar interest → Trial: 35%

---

### Journey 4B: Subscription Checkout

**Trigger**: User clicks "Start Trial" or "Upgrade to Pro"

#### Step-by-Step Flow:

1. **Checkout Redirect**
   - API call: `/api/stripe/create-checkout`
   - Session created with:
     - Customer email pre-filled
     - Trial period: 7 days
     - Plan: Monthly or Annual
     - Success URL: `/dashboard?success=true&session_id={ID}`
     - Cancel URL: `/dashboard`

2. **Stripe Checkout Page**
   - **Fields**:
     - Email (pre-filled)
     - Card details
     - Billing address
   - **Trial Details**:
     - "Try free for 7 days"
     - "Cancel anytime"
     - "After trial: ${price}/month"

3. **Payment Submission**
   - Stripe processes payment method
   - Subscription created in Stripe
   - Webhook sent to app

4. **Webhook Processing** (`/api/webhooks/stripe`)
   - Event: `checkout.session.completed`
   - Database update:
     - `user.stripeCustomerId`
     - `user.stripeSubscriptionId`
     - `user.subscriptionStatus = TRIALING`
     - `user.isPremium = true`
     - `user.hasUsedTrial = true`

5. **Success Redirect**
   - User redirected to `/dashboard?success=true`
   - Confetti animation triggered
   - PremiumWelcomeTip modal shown

6. **Welcome Modal**
   - **Celebration Message**: "🎉 Welcome to Decision Jar Pro!"
   - **Unlocked Features Tour**:
     - Unlimited AI generations
     - Community jars
     - Advanced planners
     - Google Photos
   - **Quick Tip**: "Pro Tip: Try the Weekend Planner!"
   - CTA: "Explore Premium Features"

7. **Post-Upgrade Experience**
   - Premium badge in header
   - All premium features unlocked
   - Premium-gated modals no longer blocked

**Trial Metrics**:
- Trial starts: 100
- Trial → Paid conversion: 45%
- Cancel during trial: 35%
- Forget to cancel: 20%

---

### Journey 4C: Trial Expiration

**Trigger**: 7 days after trial start, no payment completed

#### Step-by-Step Flow:

1. **Day 7: Trial Ends**
   - Stripe attempts first charge
   - **Success**: becomes paying subscriber (ACTIVE)
   - **Failure**: subscription status → PAST_DUE

2. **App Login** (after trial expired)
   - Middleware check: `isPremium` status
   - If subscription PAST_DUE or CANCELED:
     - TrialExpiredModal triggered

3. **TrialExpiredModal**
   - **Message**: "Your 7-day trial has ended"
   - **Options**:
     - **"Continue with Pro" (Primary)**:
       - Update payment method
       - Redirect to Stripe billing portal
     - **"Downgrade to Free" (Secondary)**:
       - Confirms downgrade
       - Reverts to free tier limits
       - Premium features locked

4. **Continue Path**
   - Redirect to Stripe Customer Portal
   - User updates payment method
   - Subscription reactivated
   - Return to app

5. **Downgrade Path**
   - Confirmation: "You'll lose access to:"
     - Unlimited AI generations
     - Extra jars (keeps first 3)
     - Community jars
     - Google Photos
   - Click "Confirm Downgrade"
   - Database update: `isPremium = false`
   - Premium features immediately locked

**Handling Excess Data**:
- Jars 4-50: hidden but not deleted (can upgrade to restore)
- AI quota: reset to free tier limits
- Existing community jars: archived, not deleted

---

## Advanced Features Journeys

### Journey 5A: AI Date Night Planner

**Trigger**: User wants structured evening plan

#### Step-by-Step Flow:

1. **Explore Tab** → "Night Out Planner" card
   - OR: Smart Tools grid on dashboard

2. **DateNightPlannerModal Opens**
   - **Wizard Steps**:
     - Step 1: Budget ($, $$, $$$, $$$$)
     - Step 2: Vibe/Style:
       - Romantic
       - Adventurous
       - Chill/Relaxed
       - Fancy/Upscale
       - Quirky/Unique
     - Step 3: Duration (2h, 3h, 4h+)
     - Step 4: Preferences:
       - Cuisine type
       - Activity style
       - Must-haves (e.g., live music, outdoor seating)

3. **Generate Itinerary**
   - Click "Plan My Evening"
   - Loading state: "Crafting your perfect night..."
   - API call: `/api/date-night-planner`
   - AI generates structured JSON plan:

   ```json
   {
     "timeline": [
       {
         "time": "6:00 PM",
         "activity": "Dinner",
         "venue": "Craft & Co",
         "address": "123 Main St",
         "description": "Farm-to-table seasonal menu",
         "cost": "$$",
         "duration": "1.5h",
         "website": "https://..."
       },
       {
         "time": "8:00 PM",
         "activity": "Live Jazz",
         "venue": "Blue Note",
         "description": "Intimate jazz lounge with craft cocktails",
         "cost": "$",
         "duration": "1.5h"
       },
       {
         "time": "10:00 PM",
         "activity": "Dessert",
         "venue": "Sweet Surrender",
         "description": "Artisan gelato bar",
         "cost": "$"
       }
     ]
   }
   ```

4. **Review Itinerary**
   - Timeline view with cards
   - Each step shows:
     - Time
     - Venue with map link
     - Description
     - Cost estimate
   
   - **Actions per Step**:
     - "Regenerate This Step"
     - "Edit Details"
     - "Remove from Plan"

5. **Save Itinerary**
   - **Options**:
     - "Go Tonight" (mark entire plan as selected)
     - "Save for Later" (adds as single idea with JSON in details)
     - "Save Individual Steps" (creates 3 separate ideas)

6. **Saved as Idea**
   - Stored in database:
     - `description`: "Night Out at {date}"
     - `category`: PLANNED_DATE
     - `details`: JSON stringified itinerary
     - `cost`: highest tier in plan
     - `duration`: total time

7. **Future Spin**
   - When spun, DateRevealModal shows:
     - Timeline view (not standard card)
     - Each step with time
     - Map view with waypoints
     - "Add to Calendar" exports all events

**Usage**:
- Premium users: 2-3 times per month
- Save rate: 75%
- "Go Tonight" conversion: 40%

---

### Journey 5B: Voting with Task Allocation

**Trigger**: Group jar in ALLOCATION mode, admin distributes tasks

#### Step-by-Step Flow:

1. **Dashboard** (Admin view, Allocation mode)
   - "Spin" button replaced with "Distribute Tasks"
   - Shows pending task pool

2. **Distribute Tasks Action**
   - Click "Distribute Tasks"
   - Configuration modal:
     - Tasks per member (1-10)
     - Assignment method:
       - Random
       - Based on skills (future)
       - Manual (admin picks)

3. **Distribution Execution**
   - API call: `distributeTasks()` server action
   - For each member:
     - Randomly selects N tasks
     - Assigns via `idea.assignedToId`
     - Email notification sent

4. **Member Experience**
   - Login to dashboard
   - "View My Tasks" button shown
   - Opens JarQuickStartModal with assigned tasks
   - Tasks shown as cards with:
     - Description
     - Deadline (if set)
     - "Mark Complete" button

5. **Complete Task**
   - Click "Mark Complete"
   - Confirmation: "Did you finish '{task}'?"
   - Updates `idea.selectedAt = now()`
   - Moves to Vault
   - **Gamification**: +5 XP per task

6. **Admin View**
   - Sees completion status:
     - "Jake: 3/5 tasks complete"
     - "Sarah: 2/5 tasks complete"
   - Can reassign incomplete tasks
   - Can add more tasks to pool

**Usage**:
- 15% of jars use Allocation mode
- Use cases: chores, event planning, work tasks
- Completion rate: 85% (high accountability)

---

### Journey 5C: Community Jar Moderation

**Trigger**: Admin of Community jar manages submissions

#### Step-by-Step Flow:

1. **Member Submits Idea**
   - Member in Community jar adds idea
   - Idea created with `status: PENDING`
   - Idea hidden from jar until approved
   - User sees: "Submitted for review"

2. **Admin Notification**
   - Dashboard badge: "3 Pending Ideas"
   - Email notification (if enabled)
   - Push notification (future)

3. **Admin Opens Moderation Panel**
   - Click "Admin Controls" OR
   - Settings → Community tab
   - CommunityAdminModal opens

4. **Pending Ideas List**
   - Shows all ideas with status: PENDING
   - For each idea:
     - Preview card:
       - Description
       - Submitter name
       - Submission date
       - Category
     - Actions:
       - ✅ Approve
       - ✏️ Edit
       - ❌ Reject

5. **Approve Action**
   - Click ✅ Approve
   - Idea status → APPROVED
   - Idea becomes visible in jar
   - Submitter notified (future)
   - Idea can now be spun

6. **Reject Action**
   - Click ❌ Reject
   - Confirmation: "Reason for rejection?" (optional)
   - Idea status → REJECTED
   - Hidden from jar
   - Submitter notified with reason (future)

7. **Edit Action**
   - Click ✏️ Edit
   - Opens idea in edit mode
   - Admin can modify:
     - Description (fix typos)
     - Category (recategorize)
     - Attributes (correct details)
   - Save → Auto-approves

8. **Bulk Actions**
   - Select multiple ideas (checkbox)
   - "Approve All" button
   - "Reject All" button
   - Processes in batch

**Moderation Volume**:
- Average: 5-10 submissions per week (active community jar)
- Approval rate: 80%
- Response time: <24 hours

---

## Retention & Re-engagement Journeys

### Journey 6A: Inactive User Re-engagement

**Trigger**: User hasn't logged in for 7 days

#### Step-by-Step Flow:

1. **Day 7 of Inactivity**
   - Automated email triggered
   - Subject: "Your jar misses you! 💜"
   - Content:
     - Reminder of pending ideas
     - Number of new ideas added by jar members
     - "Spin your jar" CTA

2. **Email Click**
   - Deep link to `/dashboard?action=spin`
   - User logs in
   - Dashboard auto-scrolls to jar
   - Spin modal auto-opens (optional)

3. **Re-engagement Incentive**
   - Welcome back banner
   - Bonus XP for first spin after return (+10 XP)
   - "What's new" highlights (if updates shipped)

4. **Day 14 of Inactivity** (if still inactive)
   - Second email: "We saved your ideas!"
   - Highlights:
     - Jar is still active
     - Members waiting for you
     - Special: Free Premium trial offer (5 extra AI generations)

5. **Day 30 of Inactivity**
   - Final email: "Is everything OK?"
   - Offers:
     - Feedback survey (why inactive?)
     - Delete account option
     - Snooze emails option

**Reactivation Rate**:
- Day 7 email: 15%
- Day 14 email: 8%
- Day 30 email: 3%

---

### Journey 6B: Gamification Milestones

**Trigger**: User reaches XP/achievement threshold

#### Achievement Examples:

1. **"Idea Machine" (Add 10 Ideas)**
   - On 10th idea creation
   - UnlockedAchievement record created
   - Achievement modal pops up:
     - Trophy icon animation
     - "Idea Machine Unlocked!"
     - Description: "Added 10 ideas to your jar"
     - Reward: +50 bonus XP
   - Trophy appears in Trophy Case

2. **"Decision Maker" (5 Spins)**
   - After 5th spin
   - Modal: "You're on a roll!"
   - Reward: +25 XP

3. **"Memory Keeper" (Rate 5 Activities)**
   - After 5th rating
   - Modal with photo collage (if photos uploaded)
   - Reward: +100 XP

4. **Level Up** (Reach new level)
   - XP threshold crossed (e.g., 1000 XP → Level 5)
   - LevelUpModal with fanfare:
     - Level badge animation
     - New rank name (e.g., "Decision Expert")
     - Next level target shown
   - Confetti burst

**Engagement Impact**:
- Users with >3 achievements: 2.5x more active
- Level progression drives 30% more idea creation

---

### Journey 6C: App Review Prompt

**Trigger**: User completes 10 activities OR reaches Level 5

#### Step-by-Step Flow:

1. **Trigger Event**
   - Milestone reached
   - Check: hasn't been prompted in last 90 days

2. **ReviewAppModal Opens**
   - **Header**: "Enjoying Decision Jar? ❤️"
   - **Body**: "Your feedback helps us improve!"
   - **Options**:
     - 😍 "Love it! (5 stars)" → App Store
     - 😐 "I have feedback" → Feedback form
     - 😴 "Ask me later" → Dismiss (snooze 30 days)

3. **Love It Path**
   - Click "Love it!"
   - Redirect to App Store (iOS) or Play Store (Android)
   - Pre-filled 5-star rating
   - User writes review
   - Return to app
   - Thank you modal: "Thanks for the love! 🎉"

4. **Feedback Path**
   - Click "I have feedback"
   - Redirect to feedback jar (FEATREQ)
   - Pre-filled idea form
   - User submits feedback as idea
   - Auto-added to feedback jar

5. **Later Path**
   - Click "Ask me later"
   - Modal dismissed
   - Snoozed for 30 days

**Review Rate**:
- Prompt shown: 100%
- App Store redirect: 25%
- Actual review posted: 12%

---

## Success Metrics Summary

### Signup Metrics
- **Direct signup completion**: >70%
- **Social login completion**: >80%
- **Invite link conversion**: >40%
- **Demo-to-signup**: >25%
- **Email verification rate**: >60%

### Activation Metrics
- **Time to first idea**: <2 minutes
- **Ideas added in first session**: >3
- **First spin within**: <5 minutes
- **Onboarding completion**: >50%

### Engagement Metrics
- **Weekly active users (WAU)**: 60% of signups
- **Ideas per user per month**: 8-12
- **Spins per user per month**: 12-20
- **Rating rate**: 60% of completed activities

### Collaboration Metrics
- **Users with 2+ jars**: 35%
- **Invite sent rate**: 40% of users
- **Invited user signup rate**: 45%
- **Voting participation**: >70%

### Premium Metrics
- **Free-to-trial conversion**: 15-35% (context-dependent)
- **Trial-to-paid conversion**: 45%
- **Monthly churn**: <7%
- **LTV**: $120 (average 12-month retention)

---

## Notes for Product Team

### Key Insights
1. **Invite links are highest-converting signup method** (40%)
   - Optimize for social sharing
   - Consider referral rewards

2. **First spin is critical activation moment** (<5 min target)
   - Pre-populate demo ideas for new users?
   - AI-generated starter pack?

3. **Voting drives group retention** (2.5x engagement)
   - Consider making voting available in free tier
   - Add voting analytics

4. **Gamification works** (users with achievements are 2.5x more active)
   - Add more achievement types
   - Social sharing of achievements

5. **Premium conversion peaks at jar limit** (35% trial rate)
   - Consider raising free tier to 4-5 jars
   - Add "per-jar" upgrade option

### Recommended Optimizations
- **Onboarding**: A/B test skippable vs mandatory tutorial
- **Signup**: Add Apple Sign-In (30% of mobile users prefer)
- **AI Quota**: Increase free tier to 10 generations/month
- **Re-engagement**: Add push notifications (much higher open rate than email)
- **Premium**: Test annual-only pricing (higher LTV)

---

**Document Maintained By**: Product Team  
**Last Updated**: January 11, 2026  
**Next Review**: Quarterly
