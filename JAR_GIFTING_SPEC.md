# 🎁 Jar Gifting Feature Specification

**Status:** Proposed  
**Priority:** High (Top 3)  
**Timeline:** 4-6 weeks for MVP, 3-6 months for full rollout  
**Last Updated:** January 20, 2026  
**Owner:** Product Team  

---

## Executive Summary

**The Opportunity:**  
Transform Decision Jar from a personal productivity tool into a viral, gift-able experience platform. Enable users to curate and share full jars of ideas with friends, family, or followers through a simple shareable link.

**The Vision:**  
Make Decision Jar the de facto way people gift curated experiences. "Moving to a new city? Here's a jar of my favorite spots." "Happy Anniversary! Here's 52 date ideas for our next year together."

**Expected Impact:**
- **30-50% reduction in empty jar problem** (recipients start with full jars)
- **0.3+ viral coefficient** (every 3 users gift to at least 1 new user)
- **40-60% gift acceptance rate**
- **1.5x higher retention** for gifted users vs. organic signups
- **1.3x higher conversion to paid** for gifted users

**Business Model:**  
Free to gift, free to receive. Monetize through Pro features (unlimited gifting, premium gift customization, analytics).

---

## Table of Contents

1. [Product Strategy](#product-strategy)
2. [User Research & Market Analysis](#user-research--market-analysis)
3. [User Stories & Flows](#user-stories--flows)
4. [Technical Specification](#technical-specification)
5. [UX/UI Requirements](#uxui-requirements)
6. [Implementation Plan](#implementation-plan)
7. [Analytics & Success Metrics](#analytics--success-metrics)
8. [Go-to-Market Strategy](#go-to-market-strategy)
9. [Risk Mitigation](#risk-mitigation)
10. [Future Enhancements](#future-enhancements)

---

## Product Strategy

### Problem Statement

**Current State:**
- New users face "empty jar syndrome" - blank slate is intimidating
- User acquisition relies on cold signups with no social proof
- No built-in viral loop or sharing mechanism
- Limited differentiation from collaborative planning tools

**Opportunity:**
- Gifting taps into universal human behavior (giving experiences)
- Pre-populated jars provide immediate value and inspiration
- Warm introductions convert better than cold signups
- Creates emotional connection to the product

### Core Value Propositions

#### For Gifters:
- **Thoughtful & Effortless:** Share curated experiences with a single link
- **Personal & Meaningful:** More thoughtful than a gift card, easier than planning everything yourself
- **Shows Expertise:** Showcase your taste, knowledge, and thoughtfulness
- **Stays Connected:** Help loved ones even when physically apart

#### For Recipients:
- **Instant Value:** Receive a full jar of hand-picked ideas (no work required)
- **Personal Touch:** Friend/loved one vouches for every suggestion
- **Removes Decision Fatigue:** Don't need to research or curate
- **Emotional Connection:** Tangible reminder of someone who cares

#### For Decision Jar (Business):
- **Viral Growth:** Every gift = warm lead with minimal CAC
- **Faster Onboarding:** Recipients skip empty state, see value immediately
- **Higher Quality Signups:** Pre-qualified through friend's recommendation
- **Brand Positioning:** "The app for thoughtful experience gifts"
- **Multiple Revenue Streams:** Pro upgrades, corporate gifting, influencer partnerships

### Competitive Analysis

**Competitors:**
| Platform | Sharing Capability | Our Advantage |
|----------|-------------------|---------------|
| Google Keep/Notes | Share for editing | We give a **copy**, not shared editing (less confusion) |
| Notion/Airtable | Complex templates | One-click gifting, mobile-first, experience-focused |
| Pinterest | Pin boards | Actionable ideas with details (address, cost, duration) |
| Bucket List Apps | Individual items | Contextual jars (date nights, family activities, city guide) |

**Unique Positioning:**  
Decision Jar is the only platform that combines:
1. Experience-focused curation
2. One-click gifting
3. Beautiful, personal presentation
4. Recipient gets their own copy (ownership, not collaboration)

---

## User Research & Market Analysis

### Target User Segments

#### Primary Gifters:
1. **The Thoughtful Friend** (25-45, Female-skewed)
   - Loves giving meaningful gifts
   - Active on Pinterest, Instagram
   - Values experiences over things
   - **Use Case:** Birthday, housewarming, "thinking of you"

2. **The Local Expert** (25-55, Any gender)
   - Knows their city inside-out
   - Friends always ask for recommendations
   - Tired of repeating the same suggestions
   - **Use Case:** "Welcome to [City]" jar for newcomers

3. **The Romantic Partner** (20-40, Any gender)
   - Wants to keep relationship fresh
   - Plans dates, surprises
   - Values quality time
   - **Use Case:** Anniversary, "rediscover us" after having kids

4. **The Long-Distance Loved One** (Any age)
   - Parent, sibling, friend in different city
   - Wants to stay connected
   - **Use Case:** "Things to do when I visit" or "My favorite spots to share"

#### Secondary Gifters (Future):
5. **Content Creators / Influencers**
   - Food bloggers, travel vloggers
   - Wants to monetize audience
   - **Use Case:** "Download my Top 50 NYC Restaurants jar"

6. **Corporate HR / Wellness Teams**
   - Budget for employee engagement
   - Needs scalable team-building ideas
   - **Use Case:** New hire welcome jars, team retreat ideas

### Use Case Validation

**Real-World Scenarios (High Appeal):**
1. ✅ Friend moving to new city → "Here are my 30 favorite spots"
2. ✅ Anniversary/Valentine's → "52 date ideas for year ahead"
3. ✅ New parents → "Baby-friendly activities near you"
4. ✅ College graduation → "Post-grad adventures in [city]"
5. ✅ Wedding gift → "Date night ideas to keep the spark alive"
6. ✅ Corporate onboarding → "Team building ideas for your first quarter"
7. ✅ Travel companion → "Things to do before I visit you"
8. ✅ Wellness coach → "30-day self-care challenge ideas"

**Validation Methods:**
- [ ] User interviews (10-15 target users)
- [ ] Landing page test (measure interest/signups)
- [ ] Survey existing users on gifting intent
- [ ] A/B test "Gift This Jar" button visibility

---

## User Stories & Flows

### Core User Stories

#### As a Gifter:
```
GIVEN I have curated a jar with 10+ ideas of my favorite restaurants
WHEN I click "Gift This Jar" 
THEN I can generate a unique shareable link and optional personal message
AND I can preview what the recipient will see
AND I can copy the link or share directly via messaging apps
```

#### As a Recipient:
```
GIVEN I receive a jar gift link from my friend
WHEN I click the link
THEN I see a beautiful landing page showing the jar preview and my friend's message
AND I can accept the gift (which clones the jar to my account)
OR I can decline/ignore the gift
AND if I accept, I see the jar in "My Jars" with full ownership
```

#### Edge Cases:
```
GIVEN I try to gift an empty jar
THEN I see a message "Add at least 5 ideas to enable gifting"

GIVEN I am a free user and have already sent 2 gifts this month
THEN I see "Upgrade to Pro for unlimited gifting"

GIVEN I receive a jar gift but don't have an account
THEN I see a signup flow that preserves the gift
AND after signup, the jar appears in my account

GIVEN I receive a jar but already have 2 jars (free plan limit)
THEN I see options to (a) upgrade or (b) replace an existing jar

GIVEN the gifted jar contains ideas marked as "private" by the gifter
THEN those ideas are cloned as "public" to the recipient (or optionally excluded)
```

### User Flow Diagrams

#### Flow 1: Gifting a Jar (Gifter)
```
1. User opens jar they want to gift (Dashboard or Jar page)
2. Clicks "Gift This Jar" button (top-right, near settings)
3. Modal opens:
   - Preview of jar (name, icon, idea count)
   - "Add a personal message" (optional textarea)
   - "Generate Gift Link" button
4. Click "Generate Gift Link"
   - Shows unique URL (https://decisionjar.app/gift/abc123)
   - Copy button + Share buttons (WhatsApp, SMS, Email, More)
   - "Preview gift page" link
5. Copy/share link
6. Modal shows "Gift sent! 🎁" confirmation
```

#### Flow 2: Receiving a Jar (Recipient - New User)
```
1. Recipient clicks gift link (e.g., https://decisionjar.app/gift/abc123)
2. Lands on beautiful gift landing page:
   - Hero: "🎁 [Friend Name] sent you a gift!"
   - Jar name and description
   - Personal message from gifter (if any)
   - Blurred preview of 3-5 ideas
   - "X ideas inside"
   - LARGE "Accept Gift & Sign Up" CTA
3. Clicks CTA → Signup flow (Google/Email)
   - Gift token preserved in URL params
4. After signup → Onboarding shortened (skip jar creation)
5. Redirected to Dashboard with new gifted jar already present
6. Celebration animation: "🎉 [Jar Name] added to your jars!"
```

#### Flow 3: Receiving a Jar (Recipient - Existing User)
```
1. Clicks gift link → Lands on gift page (same as above)
2. "Accept Gift & Log In" CTA
3. After login → Jar cloning process
4. Redirected to Dashboard with new jar present
5. Toast: "✅ Gift accepted! [Jar Name] is now yours."
```

---

## Technical Specification

### Database Schema Changes

#### New Models

**GiftToken**
```prisma
model GiftToken {
  id           String   @id @default(uuid())
  token        String   @unique // Short, shareable (e.g., "abc123xyz")
  
  // Source
  sourceJarId  String
  sourceJar    Jar      @relation("GiftedJar", fields: [sourceJarId], references: [id])
  giftedById   String
  giftedBy     User     @relation("GiftCreator", fields: [giftedById], references: [id])
  
  // Metadata
  personalMessage String?  @db.Text
  createdAt    DateTime @default(now())
  expiresAt    DateTime? // Optional: gifts expire after 90 days
  
  // Usage Tracking
  viewCount    Int      @default(0)
  acceptCount  Int      @default(0) // Should be 0 or 1
  acceptedById String?
  acceptedBy   User?    @relation("GiftRecipient", fields: [acceptedById], references: [id])
  acceptedAt   DateTime?
  
  // Status
  isActive     Boolean  @default(true) // Can be deactivated by gifter
  
  @@index([token])
  @@index([sourceJarId])
  @@index([giftedById])
}
```

**User Model Updates**
```prisma
model User {
  // ... existing fields ...
  
  // Gifting relationships
  giftsSent      GiftToken[] @relation("GiftCreator")
  giftsReceived  GiftToken[] @relation("GiftRecipient")
  
  // Rate limiting
  giftsThisMonth Int         @default(0) // Reset monthly for free users
  lastGiftSentAt DateTime?
}
```

**Jar Model Updates**
```prisma
model Jar {
  // ... existing fields ...
  
  sourceGiftId   String?       // If this jar was received as a gift
  sourceGift     GiftToken?    @relation("ClonedFromGift", fields: [sourceGiftId], references: [id])
  giftsCreated   GiftToken[]   @relation("GiftedJar")
  
  isGiftable     Boolean       @default(true) // Owner can disable gifting
}
```

### API Endpoints

#### POST `/api/jars/[id]/gift`
**Purpose:** Create a gift token for a jar

**Request:**
```typescript
{
  personalMessage?: string;
  expiresInDays?: number; // Default 90, max 365
}
```

**Response:**
```typescript
{
  success: true;
  giftToken: {
    token: "abc123xyz";
    url: "https://decisionjar.app/gift/abc123xyz";
    gifterName: "Jane Doe";
    jarName: "NYC Hidden Gems";
    ideaCount: 23;
    expiresAt: "2026-04-20T00:00:00Z";
  }
}
```

**Validation:**
- User must be jar owner or have ADMIN role
- Jar must have >= 5 ideas (configurable)
- Free users: max 2 gifts/month
- Pro users: unlimited

**Rate Limiting:**
- Free: 2/month (resets 1st of each month)
- Pro: 50/day (abuse prevention)

#### GET `/api/gift/[token]`
**Purpose:** Fetch gift details for preview page

**Response:**
```typescript
{
  gift: {
    token: "abc123xyz";
    gifterName: "Jane Doe";
    gifterAvatar?: string;
    personalMessage?: string;
    jar: {
      name: "NYC Hidden Gems";
      description: "My favorite spots in the city";
      topic: "Dining";
      ideaCount: 23;
      previewIdeas: [ // First 3 public ideas, blurred
        { description: "Authentic ramen in East Village" },
        { description: "Rooftop bar with skyline views" },
        { description: "Hidden speakeasy in Chelsea" }
      ];
    };
    createdAt: "2026-01-15T10:30:00Z";
    expiresAt?: "2026-04-15T10:30:00Z";
    isExpired: false;
    alreadyAccepted: false;
  }
}
```

**Error States:**
- 404: Token not found or expired
- 410: Gift already accepted
- 403: Gift deactivated by sender

#### POST `/api/gift/[token]/accept`
**Purpose:** Clone jar to recipient's account

**Request:**
```typescript
{
  newJarName?: string; // Optional: rename jar on receipt
}
```

**Process:**
1. Validate token (active, not expired, not already accepted)
2. Check user's jar limit (upgrade prompt if needed)
3. Clone jar:
   - Copy all ideas (convert private → public, or exclude private)
   - Copy jar settings (name, topic, selection mode)
   - Set `sourceGiftId` for tracking
4. Update gift token (acceptedById, acceptedAt, acceptCount++)
5. Track analytics event
6. Return cloned jar

**Response:**
```typescript
{
  success: true;
  jar: {
    id: "new-jar-uuid";
    name: "NYC Hidden Gems";
    ideaCount: 23;
  };
  message: "Gift accepted! Enjoy your new jar.";
}
```

#### GET `/api/user/gifts/sent`
**Purpose:** List gifts sent by current user

**Response:**
```typescript
{
  gifts: [
    {
      token: "abc123xyz";
      url: "https://decisionjar.app/gift/abc123xyz";
      jarName: "NYC Hidden Gems";
      recipientName?: "John Smith"; // If accepted
      status: "accepted" | "pending" | "expired";
      viewCount: 5;
      createdAt: "2026-01-15T10:30:00Z";
      acceptedAt?: "2026-01-16T14:20:00Z";
    }
  ];
  monthlyLimit: 2; // For free users
  giftsThisMonth: 1;
  canSendMore: true;
}
```

#### DELETE `/api/gift/[token]`
**Purpose:** Deactivate a gift (only if not yet accepted)

**Auth:** Must be gift creator

---

### Jar Cloning Logic

**Function:** `cloneJarForGift(sourceJar, recipientUser, giftToken)`

**Steps:**
1. **Validate Recipient Capacity**
   - Check jar limit (free: 2, pro: unlimited)
   - If at limit: Throw error with upgrade prompt

2. **Clone Jar Metadata**
   ```typescript
   const clonedJar = await prisma.jar.create({
     data: {
       name: sourceJar.name,
       type: sourceJar.type,
       topic: sourceJar.topic,
       selectionMode: sourceJar.selectionMode,
       defaultIdeaPrivate: false, // Reset to default
       sourceGiftId: giftToken.id,
       members: {
         create: {
           userId: recipientUser.id,
           role: 'OWNER',
           status: 'ACTIVE'
         }
       }
     }
   });
   ```

3. **Clone Ideas**
   - **Option A (Recommended):** Clone all ideas, convert private → public
   - **Option B:** Exclude private ideas (may confuse if idea count doesn't match)
   - Clone structure:
     ```typescript
     const ideas = await prisma.idea.findMany({
       where: { jarId: sourceJar.id }
     });
     
     await prisma.idea.createMany({
       data: ideas.map(idea => ({
         ...idea,
         id: undefined, // Generate new UUID
         jarId: clonedJar.id,
         createdById: recipientUser.id,
         isPrivate: false, // Override
         selectedAt: null, // Reset history
         notes: null,
         rating: null,
         createdAt: new Date(),
       }))
     });
     ```

4. **Update Analytics**
   ```typescript
   trackEvent('jar_gift_accepted', {
     giftToken: giftToken.token,
     gifter_id: giftToken.giftedById,
     recipient_id: recipientUser.id,
     jar_topic: sourceJar.topic,
     idea_count: ideas.length
   });
   ```

5. **Set as Active Jar**
   ```typescript
   await prisma.user.update({
     where: { id: recipientUser.id },
     data: { activeJarId: clonedJar.id }
   });
   ```

6. **Return Cloned Jar**

**Error Handling:**
- Jar limit exceeded → Return upgrade prompt
- Source jar deleted → Gift token invalid
- Database transaction failure → Rollback, show error

---

### Token Generation

**Requirements:**
- Short (8-12 characters for clean sharing)
- URL-safe
- Collision-resistant
- Readable (avoid ambiguous characters: 0/O, 1/l/I)

**Implementation:**
```typescript
import { customAlphabet } from 'nanoid';

const alphabet = '23456789abcdefghjkmnpqrstuvwxyz'; // No 0, 1, o, i, l
const generateGiftToken = customAlphabet(alphabet, 10);

const token = generateGiftToken(); // e.g., "7x3k2m9pqz"
```

**URL Structure:**
```
https://decisionjar.app/gift/7x3k2m9pqz
```

---

## UX/UI Requirements

### Gift Creation Modal (Gifter Side)

**Trigger:** "Gift This Jar" button
- Location: Jar page toolbar (next to Settings)
- Icon: Gift box 🎁
- Label: "Gift This Jar"

**Modal Content:**
```
┌─────────────────────────────────────────┐
│  🎁 Gift This Jar                    ✕  │
├─────────────────────────────────────────┤
│                                         │
│  [Jar Icon] NYC Hidden Gems             │
│  23 Ideas • Dining                      │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ Add a personal message (optional)  │ │
│  │                                    │ │
│  │ [Textarea: 200 char limit]         │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
│                                         │
│  [Button: Generate Gift Link]           │
│                                         │
│  ─── OR ───                             │
│                                         │
│  Share directly:                        │
│  [WhatsApp] [SMS] [Email] [Copy Link]  │
│                                         │
│  [Link: Preview gift page ↗]            │
│                                         │
└─────────────────────────────────────────┘
```

**After Generation:**
```
┌─────────────────────────────────────────┐
│  🎁 Gift Link Created!               ✕  │
├─────────────────────────────────────────┤
│                                         │
│  ✅ Your gift is ready to share!        │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ decisionjar.app/gift/7x3k2m9pqz    │ │
│  │                       [Copy] [✓]   │ │
│  └────────────────────────────────────┘ │
│                                         │
│  Share via:                             │
│  [WhatsApp] [SMS] [Email] [More...]    │
│                                         │
│  [Link: View all sent gifts →]         │
│                                         │
└─────────────────────────────────────────┘
```

**Validation States:**
- Disabled if jar has < 5 ideas (show tooltip)
- Free users at monthly limit: Show upgrade prompt
- Loading state while generating token

### Gift Landing Page (Recipient Side)

**URL:** `https://decisionjar.app/gift/[token]`

**Page Structure:**
```
┌─────────────────────────────────────────┐
│  [Logo]                    [Log In]     │
├─────────────────────────────────────────┤
│                                         │
│  🎁                                     │
│  Jane Doe sent you a gift!              │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │  [Jar Icon]                        │ │
│  │  NYC Hidden Gems                   │ │
│  │  A curated collection of my        │ │
│  │  favorite spots in the city        │ │
│  │                                    │ │
│  │  [Blurred preview of 3 ideas]      │ │
│  │  • Authentic ramen in...           │ │
│  │  • Rooftop bar with...             │ │
│  │  • Hidden speakeasy...             │ │
│  │                                    │ │
│  │  + 20 more ideas inside            │ │
│  └────────────────────────────────────┘ │
│                                         │
│  "I hope you love these spots as much  │
│   as I do! Can't wait to hear which    │
│   ones you try first. 💙"              │
│   — Jane                                │
│                                         │
│  [Button: Accept Gift & Sign Up Free]  │
│  Already have an account? Log in       │
│                                         │
└─────────────────────────────────────────┘
```

**Design Specs:**
- Hero section with large gift emoji or animation
- Gifter's name and avatar (if available)
- Jar preview card (glassmorphism style)
- Personal message displayed prominently
- Blurred/teaser idea list
- Strong CTA ("Accept Gift & Sign Up Free")
- Trust signals ("23 ideas", topic badge, gifter's name)

**Mobile Optimization:**
- Full-height hero section
- Swipe-able idea previews
- Sticky CTA at bottom

**Error States:**
- Expired: "This gift has expired. Contact [gifter] to send a new one."
- Already accepted: "You've already added this jar to your account. View it here →"
- Invalid token: "Gift not found. Check your link and try again."

### Dashboard Integration

**"My Gifts" Section (New Tab/Page)**

Show sent and received gifts:

```
Gifts Sent (3)
┌──────────────────────────────────────┐
│ NYC Hidden Gems                      │
│ Sent to: John Smith                  │
│ Status: ✅ Accepted • Jan 16         │
│ [View] [Copy Link]                   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Date Night Ideas                     │
│ Sent: Jan 10 • Views: 5              │
│ Status: ⏳ Pending                   │
│ [Copy Link] [Deactivate]             │
└──────────────────────────────────────┘

Gifts Received (1)
┌──────────────────────────────────────┐
│ 🎁 Tokyo Food Guide                  │
│ From: Sarah Chen • Accepted Jan 5    │
│ [Open Jar →]                         │
└──────────────────────────────────────┘
```

**Gifted Jar Badge**

On jar cards that were received as gifts:
```
┌────────────────────────────┐
│ 🎁 Tokyo Food Guide        │
│ Gift from Sarah Chen       │
│ 18 ideas                   │
└────────────────────────────┘
```

### Settings Page Updates

**Under "Jar Settings" tab:**

```
Gift Settings
┌────────────────────────────────────┐
│ ☐ Allow this jar to be gifted     │
│                                    │
│ Gift link: [Generate] or [abc123] │
│ [Deactivate current gift link]    │
└────────────────────────────────────┘
```

**Under "Account" tab (Free users):**

```
Gifting Limits
┌────────────────────────────────────┐
│ You've sent 1 of 2 gifts this      │
│ month (resets Feb 1)               │
│                                    │
│ [Upgrade to Pro for unlimited      │
│  gifting + premium features]       │
└────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 0: Pre-Development (Week 0)

**Goals:**
- Validate demand
- Finalize specs
- Prepare team

**Tasks:**
- [ ] User interviews (10-15 users) on gifting appeal
- [ ] Competitive analysis deep-dive
- [ ] Create high-fidelity mockups (Figma)
- [ ] Technical spike: Token generation, jar cloning
- [ ] Finalize copy/messaging
- [ ] Set up analytics events
- [ ] Create QA test plan

**Deliverables:**
- User research summary
- Finalized Figma designs
- Technical architecture doc
- Go/no-go decision

### Phase 1: MVP (Weeks 1-4)

**Goal:** Ship core gifting flow to beta users

**Sprint 1 (Week 1-2): Backend Foundation**
- [ ] Database schema updates (GiftToken model, User/Jar relations)
- [ ] Run Prisma migration (dev + production)
- [ ] API endpoint: `POST /api/jars/[id]/gift` (create gift)
- [ ] API endpoint: `GET /api/gift/[token]` (fetch gift details)
- [ ] API endpoint: `POST /api/gift/[token]/accept` (clone jar)
- [ ] Jar cloning logic (include tests)
- [ ] Rate limiting for free users (2 gifts/month)
- [ ] Token generation utility
- [ ] Unit tests for cloning logic

**Sprint 2 (Week 3-4): Frontend & UX**
- [ ] Gift creation modal (Gifter side)
  - [ ] "Gift This Jar" button on jar page
  - [ ] Modal UI (message input, link generation)
  - [ ] Copy link + share buttons
  - [ ] Preview link
- [ ] Gift landing page (Recipient side)
  - [ ] New route: `/gift/[token]`
  - [ ] Fetch gift details from API
  - [ ] Hero section with gifter info
  - [ ] Jar preview card (blurred ideas)
  - [ ] Personal message display
  - [ ] "Accept Gift" CTA
  - [ ] Error states (expired, invalid, already accepted)
- [ ] Signup flow preservation (save token through auth)
- [ ] Dashboard: Show gifted jar badge
- [ ] Settings: "Allow gifting" toggle
- [ ] Analytics integration (track all gift events)

**QA & Testing (End of Week 4)**
- [ ] Test all user flows (gifter, new recipient, existing recipient)
- [ ] Test error cases (expired, invalid, limit reached)
- [ ] Mobile responsiveness check
- [ ] Cross-browser testing
- [ ] Load testing (100 concurrent gift accepts)

**Launch Prep:**
- [ ] Beta user group selection (20-30 users)
- [ ] Email announcement to beta users
- [ ] Feature flag setup (enable for beta group only)
- [ ] Monitoring & alerts setup

**Success Criteria (Phase 1):**
- ✅ 50% of beta users create 1+ gift
- ✅ 40%+ gift acceptance rate
- ✅ Zero critical bugs
- ✅ < 2s gift page load time

### Phase 2: Enhancement (Weeks 5-12)

**Goal:** Polish UX, add premium features, gather learnings

**Sprint 3 (Week 5-6): Analytics & Insights**
- [ ] "My Gifts" dashboard page
  - [ ] Sent gifts list (status, views, recipient)
  - [ ] Received gifts list
  - [ ] Monthly gifting stats
- [ ] Email notifications
  - [ ] Gifter: "Your gift was accepted!"
  - [ ] Recipient: "You received a gift from [Name]"
- [ ] Analytics dashboard (internal)
  - [ ] Gifts sent/accepted (daily/weekly/monthly)
  - [ ] Viral coefficient calculation
  - [ ] Conversion funnel visualization
- [ ] A/B testing framework for gift landing page

**Sprint 4 (Week 7-8): Premium Gift Features**
- [ ] Custom landing page themes (Pro only)
- [ ] Gift scheduling ("Send on [date]")
- [ ] Mystery mode (reveal 1 idea/day)
- [ ] Video message attachment (Pro only)
- [ ] Gift analytics for sender (Pro only)
  - [ ] "Recipient opened jar 3 times"
  - [ ] "They tried 5 ideas so far"

**Sprint 5 (Week 9-10): Social Sharing**
- [ ] OG image generation for gift links
  - [ ] Dynamic image with jar name, gifter name, idea count
  - [ ] Beautiful branded template
- [ ] Social share optimizations
  - [ ] WhatsApp deep link with pre-filled message
  - [ ] SMS compose with gift message template
  - [ ] Email template with rich preview
- [ ] "Share your received gift" CTA (virality boost)
  - [ ] After accepting: "Share on social that you received this!"

**Sprint 6 (Week 11-12): Onboarding Optimization**
- [ ] Gifted user onboarding flow
  - [ ] Skip jar creation step
  - [ ] Shortened tutorial (focus on using vs. creating)
  - [ ] Prompt to explore gifted jar immediately
- [ ] Retention emails for gifted users
  - [ ] Day 1: "Have you tried an idea yet?"
  - [ ] Day 7: "Create your own jar and gift it back!"
  - [ ] Day 30: "You've built a great collection!"

**Launch to All Users (End of Week 12)**
- [ ] Remove feature flag
- [ ] Blog post announcement
- [ ] Email to entire user base
- [ ] Social media campaign
- [ ] Press outreach (Product Hunt, TechCrunch, etc.)

**Success Criteria (Phase 2):**
- ✅ 15% of active users send 1+ gift
- ✅ 50%+ gift acceptance rate
- ✅ 1.5x higher 30-day retention for gifted users
- ✅ 300+ gifts accepted in first month

### Phase 3: Optimization & Growth (Months 4-6)

**Goal:** Scale, monetize, expand use cases

**Month 4: Conversion Optimization**
- [ ] A/B test gift landing page variants
  - [ ] Hero messaging
  - [ ] CTA copy
  - [ ] Preview style (blurred vs. limited)
- [ ] Optimize signup flow for gifted users
- [ ] Reduce friction in gift acceptance
- [ ] Experiment with gift expiration (90 days vs. no expiration)

**Month 5: Corporate Gifting**
- [ ] Bulk gifting API
- [ ] Corporate dashboard (track team gifts)
- [ ] Invoice & billing for companies
- [ ] Case studies (HR, wellness programs)
- [ ] Sales deck for B2B

**Month 6: Influencer Partnerships**
- [ ] Verified creator badges
- [ ] Stripe Connect integration (monetize gift jars)
  - [ ] Creators charge $5 for premium jar access
  - [ ] Decision Jar takes 15% platform fee
- [ ] Influencer discovery page
  - [ ] Browse gift jars by topic/creator
- [ ] Affiliate program for top gifters

**Month 6: Seasonal Campaigns**
- [ ] Valentine's Day templates
- [ ] Mother's/Father's Day templates
- [ ] Graduation season templates
- [ ] Holiday/New Year templates

**Success Criteria (Phase 3):**
- ✅ 0.3+ viral coefficient sustained
- ✅ 5-10 corporate clients signed
- ✅ $5K+ MRR from gifting-related upgrades
- ✅ Featured in 3+ major publications

---

## Analytics & Success Metrics

### Key Metrics to Track

#### Funnel Metrics
| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Gift Creation Rate** | 15-20% of active users | `gifts_created / active_users` |
| **Gift View Rate** | 80%+ of sent gifts | `gift_page_views / gifts_created` |
| **Gift Acceptance Rate** | 40-60% | `gifts_accepted / gifts_viewed` |
| **Viral Coefficient** | 0.3+ | `new_users_from_gifts / total_users` |
| **Gifted User Retention (D30)** | 1.5x baseline | `gifted_users_active_d30 / baseline_d30` |
| **Gifted User → Paid Conversion** | 1.3x baseline | `gifted_users_converted / baseline_conversion` |

#### Engagement Metrics
- Gifts sent per gifter (target: 3/year)
- Ideas per gifted jar (target: 15+)
- Time from gift receipt → first idea tried (target: < 7 days)
- Share rate after accepting gift (target: 10%+)

#### Business Metrics
- CAC for gifted users (target: $0)
- LTV of gifted users vs. organic (hypothesis: 1.5x)
- Free → Pro conversion rate for gifters (hypothesis: 2x)
- Revenue attributable to gifting feature (target: 20% of MRR by Month 12)

### Analytics Events

**Event:** `gift_created`
```javascript
{
  event: 'gift_created',
  properties: {
    gift_token: 'abc123xyz',
    jar_id: 'jar-uuid',
    jar_name: 'NYC Hidden Gems',
    jar_topic: 'Dining',
    idea_count: 23,
    has_personal_message: true,
    user_plan: 'free' | 'pro',
    gifts_sent_this_month: 1,
  }
}
```

**Event:** `gift_page_viewed`
```javascript
{
  event: 'gift_page_viewed',
  properties: {
    gift_token: 'abc123xyz',
    referrer: 'whatsapp' | 'sms' | 'email' | 'direct',
    is_logged_in: false,
    user_id?: 'user-uuid', // If logged in
  }
}
```

**Event:** `gift_accepted`
```javascript
{
  event: 'gift_accepted',
  properties: {
    gift_token: 'abc123xyz',
    gifter_id: 'gifter-uuid',
    recipient_id: 'recipient-uuid',
    jar_topic: 'Dining',
    idea_count: 23,
    is_new_user: true, // Signed up via gift
    time_to_accept_hours: 2.5, // From link click to accept
  }
}
```

**Event:** `gift_limit_reached`
```javascript
{
  event: 'gift_limit_reached',
  properties: {
    user_id: 'user-uuid',
    gifts_sent_this_month: 2,
    plan: 'free',
    showed_upgrade_prompt: true,
  }
}
```

**Event:** `gifted_user_first_idea_tried`
```javascript
{
  event: 'gifted_user_first_idea_tried',
  properties: {
    user_id: 'recipient-uuid',
    gift_token: 'abc123xyz',
    days_since_receipt: 3,
    gifted_jar_id: 'jar-uuid',
  }
}
```

### Dashboard Visualizations (Internal)

**Gifting Funnel:**
```
Gifts Created → Viewed → Accepted → Ideas Tried
   1000     →   800   →    480    →     192
  (100%)   →  (80%)  →   (60%)   →    (40%)
```

**Viral Loop:**
```
Month 1: 1000 users → 150 gifts → 90 new users (0.09 viral coefficient)
Month 6: 5000 users → 1000 gifts → 600 new users (0.12 viral coefficient)
Month 12: 20K users → 4000 gifts → 2400 new users (0.12 viral coefficient)
```

**Retention Cohort:**
```
              D7    D30   D90
Organic:      40%   25%   15%
Gifted:       60%   38%   23%  (1.5x improvement)
```

---

## Go-to-Market Strategy

### Launch Messaging

**Tagline:** *"Give the gift of experiences"*

**Value Props:**
- For Gifters: "Share your favorite spots with one link"
- For Recipients: "Get instant inspiration from someone who knows"
- For Decision Jar: "The thoughtful way to gift experiences"

### Pre-Launch (2 weeks before)

**Beta User Recruitment:**
- Email top 100 active users
- Criteria: Active in last 30 days, 2+ jars with 10+ ideas each
- Offer: Early access + "Founding Gifter" badge

**Content Preparation:**
- Blog post: "Introducing Jar Gifting"
- Video tutorial (60s)
- Social media graphics (Instagram, Twitter, LinkedIn)
- Email templates (announcement, tutorial, success stories)
- Press kit (screenshots, use cases, founder quote)

### Launch Day

**Channels:**
1. **Email** (send to 100% of users)
   - Subject: "🎁 New: Gift your favorite jars to friends"
   - Body: Feature overview, use cases, CTA to try it
   
2. **In-App Announcement**
   - Modal on dashboard: "New Feature: Jar Gifting!"
   - Tooltip on "Gift This Jar" button for first 7 days

3. **Blog Post**
   - SEO-optimized: "How to Gift Curated Experiences with Decision Jar"
   - Include real examples from beta users
   
4. **Social Media**
   - Twitter thread with use cases + demo video
   - Instagram carousel: "5 Ways to Use Jar Gifting"
   - LinkedIn post (focus on corporate use cases)

5. **Product Hunt**
   - Launch as "Product of the Day"
   - Maker comment explaining the vision
   - Engage with comments throughout the day

6. **Press Outreach**
   - TechCrunch, The Verge, Lifehacker
   - Angle: "This app wants to replace gift cards with curated experiences"

### Post-Launch (Weeks 2-4)

**User Education:**
- Week 2: Email tutorial ("How to create the perfect gift jar")
- Week 3: Blog post ("10 jar gift ideas for any occasion")
- Week 4: User spotlight ("How Jane sent 50 NYC jars to friends")

**Seasonal Campaigns:**
- Valentine's Day (Feb): "Gift 14 date ideas this Valentine's"
- Mother's Day (May): "Curated self-care for Mom"
- Graduation (Jun): "Adventures for your next chapter"

**Partnerships:**
- Local experience brands (ClassPass, Airbnb Experiences)
- Wedding registries (Zola, The Knot)
- Corporate wellness platforms (Wellable, Virgin Pulse)

### Content Marketing

**Blog Topics:**
1. "How to Create the Perfect 'Welcome to [City]' Jar for Friends"
2. "52 Date Ideas: The Ultimate Anniversary Gift"
3. "10 Unexpected Ways to Use Jar Gifting"
4. "Why Experience Gifts Are Better Than Gift Cards (Science-Backed)"
5. "How to Curate a Thoughtful Jar in 15 Minutes"

**SEO Keywords:**
- "experience gift ideas"
- "curated date ideas"
- "thoughtful gifts for [occasion]"
- "what to do in [city]"
- "personalized gift app"

---

## Risk Mitigation

### Identified Risks & Mitigation Strategies

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| **Low adoption** (users don't gift) | High | Medium | Beta test, messaging A/B tests, prominent UI placement |
| **Low acceptance rate** (<30%) | High | Low | Beautiful landing page, strong social proof, easy signup |
| **Abuse** (spam gifts) | Medium | Medium | Rate limiting, report feature, manual review for outliers |
| **User confusion** (think it's shared, not copied) | High | High | VERY clear messaging: "This is YOUR copy" |
| **Jar limit frustration** (free users can't accept) | Medium | Medium | Smart prompting: upgrade or replace existing jar |
| **Privacy concerns** (sharing private ideas) | Medium | Low | Convert private → public on clone, or exclude private ideas |
| **Technical issues** (cloning bugs) | High | Low | Extensive testing, rollback plan, monitoring |
| **Cannibalization** (fewer new jars created) | Low | Low | Track "jars created" metric; gifted jars inspire creation |

### Rollback Plan

If critical issues arise within first 2 weeks:
1. **Disable gift creation** (feature flag off)
2. **Existing gift links still work** (honor commitments)
3. **Fix issue in staging**
4. **Re-enable with monitoring**

---

## Future Enhancements

### Phase 4+ (6-12 months out)

**Advanced Gifting:**
- [ ] Collaborative gift jars (multiple people contribute ideas)
- [ ] Subscription gifts (new idea added monthly)
- [ ] Mystery reveal mode (advent calendar style)
- [ ] Photo/video messages embedded in jar
- [ ] Physical gift cards with QR code to jar

**Monetization Expansion:**
- [ ] Premium gift templates ($2.99 each)
- [ ] Corporate bulk licensing ($500/year for 100 employees)
- [ ] Affiliate revenue (ideas link to booking platforms)
- [ ] Sponsored ideas (local businesses pay for placement)

**Platform Integrations:**
- [ ] Apple Messages app extension
- [ ] WhatsApp Bot for instant gifting
- [ ] Integration with Slack (team idea jars)
- [ ] API for third-party apps (wedding registries, etc.)

**Localization:**
- [ ] Multi-language support
- [ ] Currency conversion for pricing
- [ ] Region-specific templates

---

## Appendix

### FAQ

**Q: What happens if I delete the jar I gifted?**  
A: Recipients still keep their copy. Gifts are independent once accepted.

**Q: Can I revoke a gift after sending?**  
A: Yes, if not yet accepted. Once accepted, the recipient owns their copy.

**Q: What if the recipient already has the max number of jars?**  
A: They'll be prompted to upgrade or replace an existing jar.

**Q: Are private ideas included in gifts?**  
A: Private ideas are converted to public when gifted (or excluded, TBD).

**Q: Can I see who accepted my gift?**  
A: Yes, in "My Gifts" dashboard (if recipient is logged in).

**Q: Do gift links expire?**  
A: By default, no. You can optionally set expiration (90 days recommended).

### References

- User Research Notes: [Link to Notion doc]
- Figma Designs: [Link to Figma]
- Competitive Analysis: [Link to spreadsheet]
- Technical Spike Results: [Link to GitHub discussion]

---

**Document Version:** 1.0  
**Last Updated:** January 20, 2026  
**Next Review:** February 20, 2026  
**Maintained By:** Product Team

---

*This is a living document. As we learn from user research, testing, and launch, we'll update this spec to reflect new insights and decisions.*
