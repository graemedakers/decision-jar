# Technical Implementation Plan: `<WizardFrame>` Components
**Target Date:** Q1 2026
**Priority:** Medium (Scalability/Maintainability)

## 1. Executive Summary
The goal is to replace fragmented, high-maintenance planners (Menu Planner, Bar Crawl, Surprise Me) with a single, unified **Wizard Engine**. This engine will handle the standard AI idea-generation lifecycle: **Input Form** → **Animated Loading** → **Review Results** → **Persistence**.

## 2. Core Architecture

### 2.1 Configuration-Driven Design
New tools will be defined as static configurations, eliminating the need for custom React components for every new AI concierge.

```typescript
// Proposed Type Definition (lib/types/wizard.ts)
export interface WizardConfig {
  id: string; // 'menu-planner', 'bar-crawl', 'camping'
  title: string;
  icon: any; // Lucide icon
  apiRoute: string; // '/api/planners/menu'
  
  // Dynamic Form Definitions
  fields: Array<{
    id: string;
    label: string;
    type: 'select' | 'number' | 'text' | 'location' | 'toggle';
    options?: string[]; // For 'select'
    defaultValue: any;
    placeholder?: string;
  }>;

  // Persistance Mapping
  // How to map AI results to the Idea schema
  resultMapper: (item: any) => Partial<Idea>;
  
  // Customizations
  loadingPhrases: string[]; // "Chopping veggies...", "Setting the table..."
  layout: 'list' | 'grid' | 'timeline';
}
```

### 2.2 Shared State Machine
The `<WizardFrame>` will manage a centralized state machine:
1. `IDLE`: Showing the entry form.
2. `GENERATING`: Calling the AI and showing branded loading.
3. `REVIEWING`: Displaying AI results for user approval.
4. `SUCCESS`: Confirmation and "Add to Jar" complete.

## 3. Implementation Steps

### Step 1: Core Type Definitions & Constants ✅ COMPLETE
*   ✅ Created `lib/types/wizard.ts` with comprehensive schema for configurations.
*   ✅ Centralized planner configs (Menu, Surprise Me, Bar Crawl) into `lib/constants/planners.ts`.

**Files Created:**
- `lib/types/wizard.ts` (140 lines) - Field types, state machine types, WizardConfig interface
- `lib/constants/planners.ts` (280 lines) - 3 planner configurations with full field definitions

### Step 2: Build the `<WizardFrame>` Engine ✅ COMPLETE
*   ✅ **Location**: `components/WizardFrame/WizardFrame.tsx`
*   ✅ **Dependencies**: Framer Motion for premium transitions, Lucide for icons.
*   ✅ **Feature**: Abstract the `handleAddToJar` logic so it works generically for any result type.

**Files Created:**
- `components/WizardFrame/WizardFrame.tsx` (485 lines) - Full state machine implementation
- `components/WizardFrame/index.ts` - Clean export

**State Machine Implemented:**
- `INPUT` → Form display with dynamic field rendering
- `GENERATING` → Branded loading with rotating phrases
- `REVIEWING` → Result cards with "Add to Jar" actions
- `ERROR` → Error display with retry option

### Step 3: Standardize Inputs (`WizardInputFactory`) ✅ COMPLETE (Inline)
*   ✅ Input rendering is handled inline in `WizardFrame.tsx` via the `renderField()` function.
*   ✅ Supports: `text`, `location`, `number`, `select`, `button-group`, `multi-select`, `toggle`

### Step 4: Branded Loading Overlay ✅ COMPLETE (Inline)
*   ✅ Implemented `useRotatingPhrase` hook that cycles through loading phrases.
*   ✅ Loading UI includes animated spinner and phrase rotation.

### Step 5: Migration (The "Kill" List) 🔄 IN PROGRESS
Migrate existing logic in this order to prove the engine's versatility:
1.  ✅ **Surprise Me**: Proves the "Single hidden idea" complexity. 
    - Created `SurpriseMeWizard.tsx` (75 lines) wrapping WizardFrame
    - Updated `DashboardModals.tsx` to use new component
    - **Code reduction**: 255 → 75 lines = **-180 lines saved**
2.  ⏸️ **Menu Planner**: DEFERRED (Complex - requires WizardFrame extensions)
    - Has unique features: Shopping List modal, Per-item regeneration, Social sharing
    - Would require adding "plugin hooks" to WizardFrame (onResultAction, customResultRenderer)
    - **Recommendation**: Keep as specialized component OR extend WizardFrame in Phase 2
3.  ⏸️ **Bar Crawl**: DEFERRED (Requires timeline layout in WizardFrame)
    - Uses GenericConciergeModal currently, not a standalone modal
    - Lower priority as it already follows a config-driven pattern

---

## Implementation Progress Summary

| Step | Status | Notes |
|------|--------|-------|
| Step 1: Types & Configs | ✅ Complete | 2 files, ~420 lines |
| Step 2: WizardFrame Engine | ✅ Complete | 485-line component |
| Step 3: Input Factory | ✅ Complete | Inline in WizardFrame |
| Step 4: Loading Overlay | ✅ Complete | Inline with phrase rotation |
| Step 5: Migration | ✅ Partial | 1/3 migrated, 2/3 strategically deferred |

**Overall Progress:** 100% Foundation Complete, 33% Migration Complete

### Session Notes (Jan 17, 2026)
- **Completed**: WizardFrame foundation + Surprise Me migration
- **Code Saved**: ~180 lines from Surprise Me migration alone
- **Strategic Decision**: Menu Planner and Bar Crawl deferred due to specialized features
- **Next Steps**: Consider extending WizardFrame with plugin hooks for complex modals

---

## 4. Scalability & Future Tools
Once the `<WizardFrame>` is stable, we can add high-value AI tools with zero additional component code:
*   **Baby Shower Planner**: (Gifts, Themes, Games)
*   **Weekend Roadtrip Scout**: (Stops, Scenic routes, Packing list)
*   **Date Night Itinerary Builder**: (Dinner -> Activity -> Dessert flow)

## 5. Success Metrics
*   **Code Reduction**: Aim for -1,500 lines of redundant modal/state code. (Current: -180 lines)
*   **Time-to-Feature**: Reduce development of new AI tools from ~4-6 hours to <30 minutes.
*   **Accessibility**: Ensure all wizards inherit the same ARIA labels and keyboard navigation patterns automatically.
