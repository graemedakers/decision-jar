# UI Constants Guide

## Overview

All UI text strings are centralized in `lib/ui-constants.ts` to ensure consistency, make changes easier, and prepare for future internationalization.

## Quick Start

```typescript
import { ACTION_LABELS } from "@/lib/ui-constants";

// ✅ GOOD - Use constants
<Button>{ACTION_LABELS.DO_THIS}</Button>

// ❌ BAD - Don't hardcode strings
<Button>I'll do this!</Button>
```

## Available Constants

### ACTION_LABELS

Common button and action labels:

```typescript
ACTION_LABELS.DO_THIS          // "I'll do this!"
ACTION_LABELS.JAR              // "Jar"
ACTION_LABELS.ADDING           // "Adding..."
ACTION_LABELS.ADDED            // "Added"
ACTION_LABELS.SHARE            // "Share"
ACTION_LABELS.CANCEL           // "Cancel"
ACTION_LABELS.SAVE             // "Save"
ACTION_LABELS.DELETE           // "Delete"
// ... and more (see lib/ui-constants.ts)
```

### MODAL_TITLES

Standard modal titles:

```typescript
MODAL_TITLES.ADD_IDEA          // "Add New Idea"
MODAL_TITLES.AI_CONCIERGE      // "AI Concierge"
MODAL_TITLES.TEMPLATE_BROWSER  // "Browse Templates"
// ... and more
```

### MESSAGES

Success and error messages:

```typescript
MESSAGES.SUCCESS.IDEA_ADDED    // "Idea added to your jar!"
MESSAGES.ERROR.GENERIC         // "Something went wrong. Please try again."
// ... and more
```

## Examples

### Button States

```typescript
import { ACTION_LABELS } from "@/lib/ui-constants";

<Button disabled={isLoading}>
  {isLoading ? ACTION_LABELS.ADDING : ACTION_LABELS.JAR}
</Button>
```

### Ternary with Multiple States

```typescript
{isAddingToJar ? (
  <><Loader2 className="animate-spin" /> {ACTION_LABELS.ADDING}</>
) : rec.isAdded ? (
  <><Check /> {ACTION_LABELS.ADDED}</>
) : (
  <><Plus /> {ACTION_LABELS.JAR}</>
)}
```

### Modal Titles

```typescript
import { MODAL_TITLES } from "@/lib/ui-constants";

<Dialog>
  <DialogTitle>{MODAL_TITLES.ADD_IDEA}</DialogTitle>
  {/* ... */}
</Dialog>
```

## Benefits

1. **Single Source of Truth**: Change wording in one place
   - Want to change "I'll do this!" to "Let's go!"? 
   - Update `ACTION_LABELS.DO_THIS` and it changes everywhere!

2. **Consistency**: No more variations like:
   - ❌ "I'll do this!" vs "I'll Do This!" vs "I will do this!"
   - ✅ All use `ACTION_LABELS.DO_THIS`

3. **Type Safety**: TypeScript autocomplete and error checking
   ```typescript
   ACTION_LABELS.DO_THIS  // ✅ Autocompletes
   ACTION_LABELS.DOTHIS   // ❌ TypeScript error
   ```

4. **i18n Ready**: Easy to add translations later
   ```typescript
   // Future: Could become
   const ACTION_LABELS = locale === 'es' 
     ? SPANISH_LABELS 
     : ENGLISH_LABELS;
   ```

5. **Searchability**: Find all usages with "Find All References"

## When to Add New Constants

Add a new constant when:
- ✅ Text appears in **2+ places**
- ✅ Text is a **standard UI element** (button, label, message)
- ✅ Text might need to **change in the future**
- ✅ Text should be **consistent** across the app

Don't add a constant when:
- ❌ Text is **unique** to a single component
- ❌ Text is **dynamic** or user-generated
- ❌ Text is **page-specific content** (not a UI element)

## Refactoring Checklist

When refactoring hardcoded strings:

1. [ ] Check if the string already exists in `ui-constants.ts`
2. [ ] If not, add it to the appropriate section
3. [ ] Import the constant: `import { ACTION_LABELS } from "@/lib/ui-constants"`
4. [ ] Replace the hardcoded string with the constant
5. [ ] Run linter: `npm run lint`
6. [ ] Test the UI to ensure it looks correct
7. [ ] Commit with a clear message

## Migration Status

### ✅ Completed
- All "I'll do this!" buttons (21 instances → `ACTION_LABELS.DO_THIS`)
- Jar button states: "Adding...", "Added", "Jar"
- Files updated:
  - `lib/concierge-configs.ts`
  - `components/GenericConciergeModal.tsx`
  - `components/ConciergeResultCard.tsx`
  - `app/jar/page.tsx`

### 🚧 Future Improvements
- Modal titles (300+ instances)
- Common button labels: "Cancel", "Close", "Save" (200+ instances)
- Form placeholders and labels
- Error/success toast messages
- Loading states across components

## Questions?

See the full constants file: `lib/ui-constants.ts`

Or check existing usage in:
- `components/ConciergeResultCard.tsx` (good example)
- `lib/concierge-configs.ts` (18 tools using constants)
