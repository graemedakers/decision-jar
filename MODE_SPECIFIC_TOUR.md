# Mode-Specific Onboarding Tour
**Date**: January 11, 2026  
**Issue**: Tour assumes RANDOM mode (Spin button)  
**Status**: ✅ **IMPLEMENTED**

---

## Problem

The onboarding tour had hardcoded steps that assumed the jar was in **RANDOM (Spin)** mode:

```typescript
{
    id: 'spin-jar',
    title: '🎯 Spin the Jar',
    description: 'Ready to decide? Click here to randomly select...',
    targetElement: '[data-tour="spin-button-desktop"]', // ❌ Doesn't exist in ADMIN_PICK mode
}
```

### Issues:

**ADMIN_PICK Mode**:
- No "Spin" button exists
- Tour would highlight nothing or break
- Confusing messaging

**VOTING Mode**:
- Different selection mechanism (voting rounds)
- "Spin" step irrelevant

**ALLOCATION Mode**:
- Tasks assigned to members
- No random selection

---

## Solution

Created **mode-specific tour steps** that adapt to the jar's selection mode.

### Implementation:

**File**: `lib/onboarding-steps.ts`

#### 1. Separated Common Steps

```typescript
// Steps that apply to ALL modes
const COMMON_WELCOME_STEPS: OnboardingStep[] = [
    { id: 'welcome', title: '👋 Welcome...' },
    { id: 'add-idea', title: '💡 Add Your First Idea' },
    { id: 'surprise-me', title: '✨ AI-Powered Ideas' },
    { id: 'jar-visual', title: '🎲 Your Jar' }
];

const COMMON_ENDING_STEPS: OnboardingStep[] = [
    { id: 'open-jar', title: '📂 Browse All Ideas' },
    { id: 'explore-menu', title: '🧭 Explore AI Tools' },
    { id: 'vault', title: '🏆 Your Vault' },
    { id: 'gamification', title: '⭐ Level Up' },
    { id: 'jar-selector', title: '🏺 Multi-Jar Mastery' },
    { id: 'complete', title: '🎉 You\'re All Set!' }
];
```

#### 2. Created Mode-Specific Steps

```typescript
const RANDOM_MODE_STEP: OnboardingStep = {
    id: 'spin-jar',
    title: '🎯 Spin the Jar',
    description: 'Ready to decide? Click here to randomly select an idea...',
    targetElement: '[data-tour="spin-button-desktop"], [data-tour="spin-button"]',
    position: 'top'
};

const ADMIN_PICK_MODE_STEP: OnboardingStep = {
    id: 'admin-pick',
    title: '👤 Admin Pick Mode',
    description: 'As the admin, you manually select which idea to use next...',
    targetElement: '[data-tour="list-tab"], [data-tour="list-tab-mobile"]',
    position: 'bottom'
};

const VOTING_MODE_STEP: OnboardingStep = {
    id: 'voting',
    title: '🗳️ Voting Mode',
    description: 'Everyone in your jar can vote on ideas!...',
    targetElement: '[data-tour="admin-controls"], [data-tour="voting-button"]',
    position: 'top'
};

const ALLOCATION_MODE_STEP: OnboardingStep = {
    id: 'allocation',
    title: '📋 Task Allocation',
    description: 'Assign ideas to specific team members...',
    targetElement: '[data-tour="list-tab"], [data-tour="list-tab-mobile"]',
    position: 'bottom'
};
```

#### 3. Created Dynamic Function

```typescript
export function getOnboardingSteps(mode?: string): OnboardingStep[] {
    let modeStep: OnboardingStep;

    switch (mode) {
        case 'ADMIN_PICK':
            modeStep = ADMIN_PICK_MODE_STEP;
            break;
        case 'VOTING':
            modeStep = VOTING_MODE_STEP;
            break;
        case 'ALLOCATION':
            modeStep = ALLOCATION_MODE_STEP;
            break;
        case 'RANDOM':
        default:
            modeStep = RANDOM_MODE_STEP;
            break;
    }

    return [
        ...COMMON_WELCOME_STEPS,
        modeStep,              // ✅ Dynamic step based on mode
        ...COMMON_ENDING_STEPS
    ];
}
```

#### 4. Maintained Backward Compatibility

```typescript
// Default export for RANDOM mode (existing code still works)
export const ONBOARDING_STEPS: OnboardingStep[] = [
    ...COMMON_WELCOME_STEPS,
    RANDOM_MODE_STEP,
    ...COMMON_ENDING_STEPS
];
```

---

## Dashboard Integration

**File**: `app/dashboard/page.tsx`

### Before:
```typescript
import { ONBOARDING_STEPS } from "@/lib/onboarding-steps";

// ...

<OnboardingTour
    steps={ONBOARDING_STEPS} // ❌ Always same steps
/>
```

### After:
```typescript
import { getOnboardingSteps } from "@/lib/onboarding-steps";

// ...
const jarSelectionMode = userData?.jarSelectionMode; // Already available

<OnboardingTour
    steps={getOnboardingSteps(jarSelectionMode)} // ✅ Dynamic steps
/>
```

---

## Tour Steps by Mode

### 🎲 RANDOM Mode (Default):

1. Welcome
2. Add Your First Idea
3. AI-Powered Ideas
4. Your Jar
5. **🎯 Spin the Jar** ← Mode-specific
6. Browse All Ideas
7. Explore AI Tools
8. Your Vault
9. Level Up
10. Multi-Jar Mastery
11. You're All Set!

---

### 👤 ADMIN_PICK Mode:

1. Welcome
2. Add Your First Idea
3. AI-Powered Ideas
4. Your Jar
5. **👤 Admin Pick Mode** ← Different step!
   - Points to List tab instead of Spin button
   - Explains manual selection
6. Browse All Ideas
7. Explore AI Tools
8. Your Vault
9. Level Up
10. Multi-Jar Mastery
11. You're All Set!

---

### 🗳️ VOTING Mode:

1. Welcome
2. Add Your First Idea
3. AI-Powered Ideas
4. Your Jar
5. **🗳️ Voting Mode** ← Group decision step
   - Points to admin controls/voting button
   - Explains voting rounds
6. Browse All Ideas
7. Explore AI Tools
8. Your Vault
9. Level Up
10. Multi-Jar Mastery
11. You're All Set!

---

### 📋 ALLOCATION Mode:

1. Welcome
2. Add Your First Idea
3. AI-Powered Ideas
4. Your Jar
5. **📋 Task Allocation** ← Assignment step
   - Points to List tab
   - Explains task assignment
6. Browse All Ideas
7. Explore AI Tools
8. Your Vault
9. Level Up
10. Multi-Jar Mastery
11. You're All Set!

---

## Benefits

### For Users:

- ✅ **Relevant guidance** - Tour matches jar's actual functionality
- ✅ **No broken highlights** - Only highlights elements that exist
- ✅ **Better understanding** - Learn how THEIR mode works
- ✅ **Smooth onboarding** - No confusion or error states

### For Development:

- ✅ **Backward compatible** - Existing code still works
- ✅ **Extensible** - Easy to add new modes
- ✅ **DRY principle** - Common steps reused across modes
- ✅ **Type-safe** - TypeScript ensures correct structure

---

## Example User Journeys

### Journey 1: Random Mode User

```
User creates jar: "Date Ideas", Mode: "Spin (Lucky Dip)"
                    ↓
             Tour triggers
                    ↓
Step 5: "🎯 Spin the Jar"
        Points to spin button ✅
        "Click here to randomly select..."
                    ↓
        User understands random selection ✅
```

### Journey 2: Admin Pick User

```
User creates jar: "Work Tasks", Mode: "Admin Pick (Curated)"
                    ↓
             Tour triggers
                    ↓
Step 5: "👤 Admin Pick Mode"
        Points to List tab ✅
        "You manually select which idea to use next..."
                    ↓
        User understands manual curation ✅
```

### Journey 3: Voting Mode User

```
User creates jar: "Team Activities", Mode: "Vote (Consensus)"
                    ↓
             Tour triggers
                    ↓
Step 5: "🗳️ Voting Mode"
        Points to voting controls ✅
        "Everyone can vote on ideas!"
                    ↓
        User understands group voting ✅
```

---

## Testing

### Test Scenario 1: RANDOM Mode

**Steps**:
1. Sign up
2. Create jar with Mode = "Spin (Lucky Dip)"
3. Start tour

**Expected**:
- ✅ Step 5 shows "Spin the Jar"
- ✅ Highlights spin button
- ✅ Button exists and is visible

### Test Scenario 2: ADMIN_PICK Mode

**Steps**:
1. Sign up
2. Create jar with Mode = "Admin Pick (Curated)"
3. Start tour

**Expected**:
- ✅ Step 5 shows "Admin Pick Mode"
- ✅ Highlights List tab
- ✅ No reference to spinning

### Test Scenario 3: VOTING Mode

**Steps**:
1. Sign up
2. Create jar with Mode = "Vote (Consensus)"
3. Start tour

**Expected**:
- ✅ Step 5 shows "Voting Mode"
- ✅ Highlights voting controls
- ✅ Explains group voting

### Test Scenario 4: ALLOCATION Mode

**Steps**:
1. Sign up
2. Create jar with Mode = "Allocation (Tasks)"
3. Start tour

**Expected**:
- ✅ Step 5 shows "Task Allocation"
- ✅ Highlights List tab
- ✅ Explains task assignment

---

## Future Enhancements

### Potential Additions:

1. **Mode-Specific Complete Messages**
   ```typescript
   const completeMessage = mode === 'VOTING' 
       ? 'Start a voting round!' 
       : 'Start spinning your jar!';
   ```

2. **Conditional Steps Based on Features**
   ```typescript
   if (isPremium) {
       steps.push(PREMIUM_TOOLS_STEP);
   }
   ```

3. **Interactive Mode Demo**
   - Mini demo showing mode in action
   - Click-through simulation

4. **Mode Comparison**
   - "Not sure which mode? Compare here"
   - Help users choose right mode

---

## Code Structure

```
lib/
  onboarding-steps.ts
    ├── COMMON_WELCOME_STEPS[]
    ├── COMMON_ENDING_STEPS[]
    ├── RANDOM_MODE_STEP{}
    ├── ADMIN_PICK_MODE_STEP{}
    ├── VOTING_MODE_STEP{}
    ├── ALLOCATION_MODE_STEP{}
    ├── ONBOARDING_STEPS[] (default/backward compat)
    └── getOnboardingSteps(mode) → OnboardingStep[]

app/dashboard/page.tsx
    └── <OnboardingTour steps={getOnboardingSteps(jarSelectionMode)} />
```

---

## Summary

**Problem**: Tour assumed RANDOM mode, broke for other modes

**Solution**: Created mode-specific tour steps with dynamic selection

**Result**: Tour adapts to jar's mode, highlights relevant features ✅

**Impact**: Better UX for all jar modes, no broken tours!

---

**Implemented By**: Engineering Team  
**Date**: January 11, 2026  
**Status**: ✅ **DEPLOYED - MODE-AWARE TOUR**  
**Benefit**: Personalized onboarding for every jar type
