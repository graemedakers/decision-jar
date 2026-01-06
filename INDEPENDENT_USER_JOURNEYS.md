# Comprehensive User Journeys Analysis
**Date**: January 7, 2026  
**Analysis Type**: Complete User Flow Mapping

## Executive Summary
This document maps all identifiable user journeys through the Decision Jar application, based on systematic analysis of the interface, modals, and event handlers.

---

## USER PERSONAS

Based on the application structure, we can identify these primary personas:

### Persona 1: Solo Organizer (Lisa)
- Uses PERSONAL jar
- Main goal: Overcome decision paralysis for activities
- Pain points: Blank canvas syndrome, lack of inspiration
- Premium likelihood: Low (free tier sufficient)

### Persona 2: Couple Coordinator (Mark & Sarah)
- Uses COUPLE jar (legacy default)
- Main goal: Fair, fun decision-making for date nights
- Pain points: "I don't know, what do you want?" loops
- Premium likelihood: Medium (AI tools attractive)

### Persona 3: Group Admin (Jake)
- Uses GROUP jar (friend group/family)
- Main goal: Democratic decision-making, activity coordination
- Pain points: Coordinating schedules, everyone's input
- Premium likelihood: High (voting system critical)

### Persona 4: Community Leader (Amanda)
- Uses COMMUNITY jar (public/semi-public)
- Main goal: Curate ideas, engage community
- Pain points: Moderation overhead, scaling engagement
- Premium likelihood: Very High (premium-gated feature)

---

## JOURNEY 1: NEW USER ONBOARDING

### Entry Points
1. **Landing Page** → Signup
2. **Invite Link** → Signup with jar context
3. **Demo Mode** → Experience → Signup

### Flow A: Standard Signup
```
Landing Page
  ↓ Click "Get Started"
Signup Form (/signup)
  ↓ Submit (email, password, name)
Email Verification (if implemented)
  ↓ Confirm
Auto-create PERSONAL Jar
  ↓ Redirect
Dashboard (Empty State)
  ↓ See EmptyJarMessage
  ← "Add your first idea!" prompt
  ↓ Click "Add Idea"
AddIdeaModal (Wizard Mode)
  ↓ Step 1: Description
  ↓ Step 2: Attributes (duration, cost, etc.)
  ↓ Step 3: Category
  ↓ Submit
First Idea Created! 🎉
  ↓ Gamification Trigger
+15 XP, Possible Level Up
  ↓ Return to Dashboard
  ← See idea in jar
  ← Onboarding tooltip? (If implemented)
  ↓ Next action prompt
  ← "Add more or Spin!"
```

### Flow B: Invite Link Signup
```
Click Invite Link (e.g., /join?code=ABC123)
  ↓ If not logged in
Signup Form (with code pre-filled)
  ↓ Submit
Auto-join target Jar
  ↓ Redirect
Dashboard (with existing ideas)
  ↓ See jar content immediately
  ← Onboarding for shared jar dynamics
  ↓ Prompt to add own ideas
```

### Flow C: Demo Mode Trial
```
Landing Page
  ↓ Click "Try Demo"
Demo Page (/demo)
  ↓ Interact with pre-populated jar
  ← Can spin, view ideas (read-only)
  ↓ Try AI tools (limited)
  ← Hit quota limit
DemoUpgradePrompt Modal
  ↓ Click "Sign Up for Full Access"
Signup Flow
  ↓ Submit
  ← Migrate demo preferences? (Or start fresh)
  ↓ Redirect
Dashboard (First-run experience)
```

### Critical Onboarding Moments
- **Aha Moment**: First successful spin + reveal
- **Value Delivery**: See AI-generated ideas (if used early)
- **Social Proof**: Invite prompt after first activity completed
- **Friction Points**:
  - Empty jar (need quick idea import)
  - Complex idea form (wizard helps)
  - AI tool discovery (not obvious without tutorial)

---

## JOURNEY 2: DAILY IDEA MANAGEMENT

### 2A: Adding Ideas Manually

```
Dashboard
  ↓ Click "Add Idea" button
AddIdeaModal Opens
  ↓ Choose Mode
  Option A: Manual Form
    ↓ Fill Description
    ↓ Set Attributes (IdeaWizard guides)
    ↓ Categorize
    ↓ Submit
  Option B: Surprise Me
    ↓ Click "Surprise Me" button
    ↓ Modal shows AI generation
    ↓ Generate random idea
    ↓ Review, edit, save
  ↓ Success
Idea Added to Jar
  ↓ +15 XP
  ↓ Return to Dashboard
  ← Idea appears in list
```

### 2B: AI-Assisted Idea Generation

#### Via Surprise Me Modal
```
Dashboard
  ↓ Click "Surprise Me"
SurpriseMeModal Opens
  ↓ Select Category (optional)
  ↓ Click "Generate"
  ← Calls /api/magic-idea
  ↓ AI generates idea
  ← Displays result
  ↓ Review generated idea
  Option A: Save as-is
  Option B: Edit before save
  Option C: Regenerate
  ↓ Save
  ← Same flow as Add Idea (redirect, XP, etc.)
```

#### Via Specialized Planners
```
Dashboard
  ↓ Click Smart Tools Grid icon
  ← e.g., "Weekend Planner"
WeekendPlannerModal Opens
  ↓ Fill Preferences (budget, style, etc.)
  ↓ Click "Plan My Weekend"
  ← Calls /api/weekend-planner
  ↓ AI generates 3-5 ideas
  ← Displays structured itinerary
  ↓ For each idea:
    Option A: "Go Tonight" (save + mark selected)
    Option B: "Save for Later" (save to jar)
    Option C: "Skip"
  ↓ Save selected ideas
  ← Batch create in jar
  ↓ +15 XP per idea
  ↓ Return to Dashboard
```

### 2C: Editing Existing Ideas

```
Dashboard or Jar Page
  ↓ Click Idea Card
AddIdeaModal Opens (Edit Mode)
  ↓ Pre-filled form
  ↓ Modify fields
  ↓ Submit
  ← Calls updateIdea() Server Action
  ↓ Success
Idea Updated
  ↓ Return to list
  ← Changes reflected immediately
```

### 2D: Organizing Ideas

#### Moving Ideas Between Jars
```
Jar Page (Multi-jar user)
  ↓ Click "Move" icon on idea
MoveIdeaModal Opens
  ↓ Select destination jar
  ↓ Confirm move
  ← API call to transfer
  ↓ Success
  ← Idea removed from current view
  ← Added to target jar
```

#### Favoriting Ideas
```
Any idea card
  ↓ Click heart icon
  ← Toggle favorite status
  ↓ API call
  ← State updates
  ↓ Filter favorites
Dashboard
  ↓ Click "Favorites" button
FavoritesModal Opens
  ← Shows all favorited ideas
  ↓ Click idea → Edit or Spin directly
```

---

## JOURNEY 3: THE CORE LOOP (Spinning the Jar)

This is the primary value proposition of the app.

### 3A: Quick Spin (No Filters)

```
Dashboard
  ↓ Click "Spin the Jar" (mobile or desktop)
SpinFiltersModal Opens
  ↓ Skip filters, click "Spin"
  ← Calls spinJar() Server Action
  ↓ Animation sequence:
    - Jar 3D animation
    - Tick sounds (haptic feedback)
    - Loading state (2-3s)
  ↓ Idea selected!
DateRevealModal Opens
  ↓ Displays selected idea
  ← Shows: description, details, location
  ← Action buttons:
    - "Go Tonight" (mark as selected date: today)
    - "Plan for Later" (set custom date)
    - "Not Feeling It" (return to jar)
    - "Share" (native share)
  ↓ User decision:
  
  Option A: Go Tonight
    ↓ Click "Go Tonight"
    ← Updates idea.selectedAt = now
    ← Moves to Memories
    ↓ +5 XP for spinning
    ↓ Email notification to jar members
    ↓ Modal closes
    ↓ Return to Dashboard
    ← Idea removed from active jar
    
  Option B: Plan for Later
    ↓ Click "Plan for Later"
    ↓ Date picker opens
    ↓ Select future date
    ← Updates idea.selectedDate
    ← Stays in jar until date
    ↓ Modal closes
    
  Option C: Not Feeling It
    ↓ Click "Not Feeling It"
    ← Returns idea to jar (selectedAt = null)
    ↓ Modal closes
    ↓ Can spin again immediately
```

### 3B: Filtered Spin

```
Dashboard
  ↓ Click "Spin the Jar"
SpinFiltersModal Opens
  ↓ Set Filters:
    - Max Duration (1h, 2h, 4h, all day)
    - Max Cost ($, $$, $$$, $$$$)
    - Activity Level (Low, Medium, High)
    - Time of Day (Morning, Afternoon, Evening, ANY)
    - Category (specific or ANY)
    - Weather (Indoor, Outdoor, ANY)
    - Local Only (toggle)
  ↓ Click "Apply Filters & Spin"
  ← Calls spinJar(filters)
  ← Server-side filtering + random selection
  ↓ If no matches:
    ← Error: "No matching ideas found"
    ← Prompt to relax filters or add ideas
  ↓ If match found:
    ← Same reveal flow as above
```

---

## JOURNEY 4: POST-ACTIVITY (Memories & Feedback)

### 4A: Viewing Completed Activities

```
Bottom Nav / Dashboard
  ↓ Click "Memories"
Memories Page (/memories)
  ↓ See list of completed ideas
  ← Filtered: selectedAt !== null
  ← Sorted: most recent first
  ↓ Click card
ViewMemoryModal Opens
  ↓ Displays full details
  ↓ Shows: photos, notes, rating
  ← Action buttons:
    - "Rate This Date"
    - "Add Photos" (Google Photos integration)
    - "Add to Calendar" (retrospective or future)
    - "Duplicate" (create new idea)
    - "Delete"
    - "Favorite"
```

### 4B: Rating Experiences

```
ViewMemoryModal or Direct Prompt
  ↓ Click "Rate This Date"
RateDateModal Opens
  ↓ Rate experience (1-5 stars)
  ↓ Add notes (optional)
  ↓ Upload photos (optional)
  ↓ Submit
  ← Updates idea.rating, notes, photoUrls
  ↓ Gamification:
    ← Award XP based on rating (e.g., 5 stars = +20 XP)
  ↓ Success
  ← Returns to Memories
```

### 4C: Adding Photos

```
ViewMemoryModal
  ↓ Click "Add Photos"
GooglePhotosPicker Opens (Premium Feature)
  ↓ Authenticate Google Photos
  ↓ Select photos
  ↓ Confirm
  ← Uploads to Cloudinary
  ← Updates idea.photoUrls[]
  ↓ Photos appear in memory
```

### 4D: Calendar Integration

```
ViewMemoryModal or DateRevealModal
  ↓ Click "Add to Calendar"
  ↓ Dropdown appears:
    - Google Calendar
    - Apple Calendar (.ics)
    - Outlook
  ↓ Click preferred option
  ← Generates calendar link
  ← Prefills: title, location, time
  ↓ Opens calendar app
  ← User confirms
```

---

## JOURNEY 5: COLLABORATIVE FEATURES (Groups)

### 5A: Creating a Group Jar

```
Dashboard
  ↓ Click Jar Switcher
  ↓ Click "+ New Jar"
CreateJarModal Opens
  ↓ Enter jar name
  ↓ Select topic (Dating, Friends, Family, etc.)
  ↓ Choose type:
    - Personal (solo)
    - Couple (2 people)
    - Group (private, multi-user)
    - Community (public, premium-only)
  ↓ Customize categories (optional)
  ↓ Submit
  ← Creates jar
  ← User becomes ADMIN
  ↓ Generate invite code
  ↓ Redirect to new jar dashboard
  ← Empty state
  ↓ Prompt to add ideas or invite members
```

### 5B: Inviting Members

```
Settings Modal or Dashboard Invite Widget
  ↓ Click "Invite Members"
  ↓ Display invite code
  ↓ Options:
    - Copy code
    - Share via native share (link)
    - Email invite (future?)
  ↓ Member receives invite
  ← Opens app/link
  ↓ If logged in:
    ← Auto-join jar
  ↓ If not logged in:
    ← Signup → Auto-join
```

### 5C: Voting System

#### Starting a Vote (Admin)
```
Dashboard (Group Jar)
  ↓ Admin sees "Start Vote" button
VotingManager UI
  ↓ Click "Start Voting Session"
Start Vote Config Modal
  ↓ Set time limit:
    - 1 hour, 3 hours, 24 hours, 48 hours, 3 days, 1 week, No limit
  ↓ Set tie-breaker:
    - Random Pick (system decides)
    - Run-off Vote (vote again on winners)
  ↓ Click "Start Vote"
  ← Calls startVote() Server Action
  ↓ Vote session created
  ← All members see voting UI
```

#### Casting a Vote (Member)
```
Dashboard (Active Vote)
  ↓ VotingManager displays eligible ideas
  ↓ Member selects idea
  ↓ Click "Submit Vote"
  ← Calls castVote() Server Action
  ← Validation: no double voting, no self-voting
  ↓ Vote recorded
  ← UI updates to "waiting" state
  ← Shows progress: "3/5 votes cast"
```

#### Resolving a Vote (Auto or Admin)
```
Scenario A: Time Expires
  ↓ Vote deadline reached
  ← System auto-resolves via polling or webhook
  
Scenario B: All Voted
  ↓ Last member votes
  ← Admin can click "Resolve Now"
  
Scenario C: Manual Resolve
  ↓ Admin clicks "Resolve"
  
Process:
  ↓ Count votes
  ↓ If single winner:
    ← Mark idea as selected
    ← Display in DateRevealModal
    ← +5 XP for jar
  ↓ If tie + Random tiebreaker:
    ← System picks winner
  ↓ If tie + Re-vote tiebreaker:
    ← Start new round with tied ideas only
    ← Members vote again
```

---

## JOURNEY 6: COMMUNITY JAR MANAGEMENT (Premium)

### 6A: Creating a Community Jar

```
Dashboard (Premium User)
  ↓ Click "+ New Jar"
CreateJarModal
  ↓ Select "Community" type
  ↓ Name jar (public-facing)
  ↓ Set topic + custom categories
  ↓ Toggle public discovery (Explore page)
  ↓ Submit
  ← Creates community jar
  ← User = ADMIN
  ↓ Redirect to jar
  ↓ Prompt to add initial ideas (seed content)
```

### 6B: Member Submits Idea (Non-Admin)

```
Member Dashboard (Community Jar)
  ↓ Click "Add Idea"
AddIdeaModal
  ↓ Fill form
  ↓ Submit
  ← Idea created with status: PENDING
  ↓ Notification to admins (future?)
  ← Idea hidden from jar until approved
  ↓ User sees: "Submitted for review"
```

### 6C: Admin Moderates Ideas

```
Community Jar Dashboard (Admin)
  ↓ See "3 Pending Ideas" badge
  ↓ Click "Admin Controls"
AdminControlsModal Opens
  OR
CommunityAdminModal Opens
  ↓ See list of pending ideas
  ↓ For each idea:
    - Preview description
    - See submitter
    - Actions: Approve, Reject, Edit
  ↓ Bulk Actions:
    - Select multiple
    - Approve all / Reject all
  ↓ Approve idea:
    ← Updates status: APPROVED
    ← Moves to active jar
    ← Submitter notified (future?)
  ↓ Reject idea:
    ← Updates status: REJECTED
    ← Removed from visibility
```

### 6D: Discovering Community Jars

```
Landing Page or App
  ↓ Click "Explore"
Explore Page (/explore)
  ↓ Browse public community jars
  ← Filtered by topic
  ↓ Click jar card
  ← Preview jar (read-only)
  ↓ Click "Join"
  ← Become member (if allowed)
  ↓ Redirect to Dashboard
  ← Jar appears in switcher
```

---

## JOURNEY 7: PREMIUM CONVERSION

### 7A: Free User Hits Limit

```
Dashboard (Free User)
  ↓ Tries to use premium feature:
    - Create community jar
    - Use AI tool (beyond quota)
    - Add 11th idea (if limit exists)
  ↓ Blocked by PremiumBlockerModal
  ← Shows feature benefits
  ← "Upgrade to Pro" CTA
  ↓ Click "Upgrade"
```

### 7B: Subscription Flow

```
PremiumModal Opens
  ↓ See pricing ($X/month, $Y/year)
  ↓ Benefits list:
    - Unlimited ideas
    - AI planning tools
    - Community jars
    - No ads
    - Priority support
  ↓ Click "Start 7-Day Free Trial"
  ← Calls /api/stripe/create-checkout
  ↓ Redirect to Stripe Checkout
  ↓ Enter payment info
  ↓ Submit
  ← Stripe webhook confirms
  ← Updates user.isPremium = true
  ↓ Redirect to Dashboard
PremiumWelcomeTip Modal
  ↓ "Welcome to Pro!" celebration
  ↓ Feature tour (optional)
  ↓ Close
  ← Premium features unlocked
```

### 7C: Trial Expiration

```
Day 7 of Trial
  ↓ User opens app
TrialExpiredModal (if still free tier)
  ↓ "Your trial has ended"
  ↓ Options:
    - Upgrade now (continue premium)
    - Downgrade (lose premium features)
  ↓ Click "Upgrade"
  ← Same Stripe flow
  OR
  ↓ Click "Maybe Later"
  ← Reverts to free tier
  ← Premium features locked
```

---

## JOURNEY 8: ADVANCED AI TOOLS

### 8A: Date Night Planner

```
Dashboard
  ↓ Click "Date Night Planner" (Smart Tools)
DateNightPlannerModal Opens
  ↓ Wizard interface:
    Step 1: Budget
    Step 2: Vibe/Style (romantic, adventurous, etc.)
    Step 3: Duration
    Step 4: Preferences (cuisine, activities, etc.)
  ↓ Click "Generate Itinerary"
  ← Calls /api/date-night-planner
  ← AI generates structured plan:
    - 6:00 PM: Dinner at [Restaurant]
    - 8:00 PM: Activity at [Venue]
    - 10:00 PM: Dessert/Drinks at [Spot]
  ↓ Review itinerary
  ↓ For each item:
    - "Go Tonight" (save as selected)
    - "Save for Later"
    - "Regenerate This Step"
  ↓ Save final itinerary
  ← Creates PLANNED_DATE category idea
  ← Stores JSON in idea.details
  ↓ Return to Dashboard
  ← Idea viewable in jar
  ← Spin reveals itinerary view
```

### 8B: Generic Concierge (Reusable Pattern)

```
Dashboard
  ↓ Click any concierge tool (Dining, Hotel, Book, etc.)
GenericConciergeModal Opens
  ↓ Loads config for selected tool
  ↓ Renders dynamic sections:
    - Budget slider
    - Preference checkboxes
    - Location input
    - Custom fields per tool
  ↓ Click "Find Recommendations"
  ← Calls /api/{tool}-concierge
  ← AI returns structured results
  ↓ Displays results as cards
  ↓ For each result:
    - Title, description
    - Rating, price
    - Link/URL (if applicable)
    - "Go Tonight" button
  ↓ Click "Go Tonight" on result
  ← Converts to idea
  ← Saves to jar with metadata
  ↓ Return to Dashboard
```

---

## JOURNEY 9: SETTINGS & CUSTOMIZATION

### 9A: Profile Update

```
Dashboard
  ↓ Click Settings icon
SettingsModal Opens
  ↓ Tab: Profile
  ↓ Edit:
    - Name
    - Email
    -Location (for AI context)
    - Photo (upload)
  ↓ Click "Save"
  ← Updates user record
  ↓ Success message
```

### 9B: Jar Configuration

```
SettingsModal
  ↓ Tab: Jar Settings
  ↓ Edit jar name
  ↓ Change topic
  ↓ Manage custom categories
  ↓ Toggle community features
  ↓ Delete jar (confirmation required)
  ↓ Save changes
```

### 9C: Membership Management

```
SettingsModal
  ↓ Tab: Members (Group jars only)
  ↓ See member list
  ↓ For each member:
    - Change role (promote to admin)
    - Remove member (admin only)
  ↓ Generate new invite code
  ↓ Save
```

### 9D: Subscription Management

```
SettingsModal
  ↓ Tab: Billing (Premium users)
  ↓ See current plan
  ↓ Click "Manage Subscription"
  ← Calls /api/stripe/create-portal
  ↓ Redirect to Stripe portal
  ↓ Options:
    - Update payment method
    - Cancel subscription
    - Download invoices
  ↓ Make changes
  ↓ Return to app
  ← Webhook updates user status
```

---

## JOURNEY 10: HELP & SUPPORT

### 10A: In-App Help

```
Dashboard or Any Page
  ↓ Click "?" icon
HelpModal Opens
  ↓ Sections:
    - Getting Started
    - Adding Ideas
    - Spinning the Jar
    - Group Features
    - AI Tools
    - Premium Features
    - FAQ
  ↓ Click section
  ↓ Read content
  ↓ Click examples/screenshots (if included)
  ↓ Close modal
```

### 10B: App Review Prompt

```
After 10 completed activities (example threshold)
  ↓ ReviewAppModal appears
  ↓ "Enjoying Decision Jar?"
  ↓ Options:
    - "Yes! Love it" → App store redirect
    - "I have feedback" → Email/form
    - "Ask me later" → Dismiss
```

---

## EDGE CASES & ERROR FLOWS

### EC1: Empty Jar State

```
Dashboard (0 ideas)
  ↓ EmptyJarMessage shows
  ← "Your jar is empty!"
  ↓ CTAs:
    - Add Idea (manual)
    - Surprise Me (AI)
    - Browse Templates
  ↓ If user tries to spin:
    ← Error: "Add ideas first"
```

### EC2: All Ideas Selected

```
Dashboard (All ideas have selectedAt)
  ↓ Try to spin
  ← Error: "All ideas used! Add more or reset"
  ↓ Option to:
    - Add new ideas
    - "Reset Jar" (clear selectedAt on all)
```

### EC3: Network Failure

```
Any server action
  ↓ Network timeout
  ← Catch error in try-catch
  ↓ Alert: "Connection failed. Try again."
  ← State unchanged (no partial mutations)
```

### EC4: Active Vote Blocks Ideas

```
Try to add idea during vote
  ← Server validation fails
  ↓ Error: "Cannot add ideas during active vote"
  ← Prompt to wait or cancel vote (admin)
```

### EC5: AI Quota Exceeded

```
Try to use AI tool
  ← API returns quota error
  ↓ PremiumBlockerModal:
    "Daily quota reached. Upgrade for unlimited."
  ↓ Options:
    - Upgrade to Premium
    - Wait for reset (timestamp shown)
```

---

## GAMIFICATION TOUCHPOINTS (Throughout Journeys)

### Level-Up Triggers
```
Any XP-earning action
  ↓ Check if levelThreshold exceeded
  ↓ If yes:
    ← LevelUpModal appears
    ← Confetti animation
    ← Display new level + rewards
    ↓ Close modal
    ← Trophy case updated
```

### Achievement Unlocks
```
Milestone reached (e.g., "10 ideas created")
  ↓ checkAndUnlockAchievements()
  ← Badge/trophy unlocked
  ↓ Notification (toast or modal)
  ↓ Badge appears in trophy case
```

---

## CRITICAL SUCCESS METRICS PER JOURNEY

### New User Onboarding
- **Success**: 3+ ideas added in first session
- **Failure**: Bounces after signup (empty jar confusion)

### Core Loop (Spinning)
- **Success**: Spin → Go Tonight → Rated in <7 days
- **Failure**: Spin → Not Feeling It (repeatedly)

### Collaborative
- **Success**: Vote completes, winner executed
- **Failure**: Vote stalls, low participation

### Premium Conversion
- **Success**: Trial → Paid after seeing value
- **Failure**: Trial ends, no conversion (didn't use AI tools)

---

**End of User Journeys Analysis**
