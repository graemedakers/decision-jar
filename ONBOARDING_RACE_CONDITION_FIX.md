# Onboarding Tour Race Condition Fix
**Date**: January 11, 2026  
**Issue**: Tour starts while empty jar modal still open  
**Status**: ✅ **FIXED (Properly This Time)**

---

## Problem (Again!)

Even after adding the `activeModal` check, the tour was **still** starting while the empty jar prompt modal was open.

### Why the Previous Fix Didn't Work:

**Previous Code** (Incorrect):
```typescript
if (!activeModal) {
    setTimeout(() => setShowOnboarding(true), 1500); // ❌ Doesn't re-check!
}
```

**Race Condition**:
```
Time 0ms:    Dashboard loads, activeModal = null ✅
Time 0ms:    Check passes, setTimeout scheduled ✅
Time 200ms:  Empty jar modal opens, activeModal = 'JAR_QUICKSTART' 
Time 1500ms: Timer fires, tour starts ❌ (too late to check)
```

The check only happened **once** when setting up the timer, not when the timer **fired** 1.5 seconds later.

---

## The Real Problem: Stale Closures

Even when we tried re-checking inside the setTimeout:

```typescript
setTimeout(() => {
    if (!activeModal) { // ❌ Uses STALE value from when timeout was created
        setShowOnboarding(true);
    }
}, 1500);
```

JavaScript closures capture the **value at creation time**, not the **current value**. So `activeModal` inside the setTimeout is the old value from 1.5 seconds ago!

---

## Solution: useRef for Current Value

Use `useRef` to track the **current** state of `activeModal`:

### Implementation:

**File**: `hooks/features/useOnboarding.ts`

#### 1. Import useRef
```typescript
import { useState, useEffect, useRef } from "react";
```

#### 2. Create Ref
```typescript
const activeModalRef = useRef(activeModal); // Track current value
```

#### 3. Keep Ref Synced
```typescript
// Update ref whenever activeModal changes
useEffect(() => {
    activeModalRef.current = activeModal;
}, [activeModal]);
```

#### 4. Check Current Value in Timeout
```typescript
if (!hasCompletedOnboarding && !isLoadingUser && userData && hasPersonalJar && !activeModal) {
    setTimeout(() => {
        // ✅ Check CURRENT value via ref
        if (!activeModalRef.current) {
            setShowOnboarding(true);
        }
    }, 1500);
}
```

---

## How It Works Now

### Scenario: Modal Opens During Delay

```
Time 0ms:    Dashboard loads
             activeModal = null
             activeModalRef.current = null

Time 0ms:    Initial check passes (no modal)
             setTimeout scheduled for 1500ms

Time 200ms:  Empty jar modal opens
             activeModal = 'JAR_QUICKSTART'
             activeModalRef.current = 'JAR_QUICKSTART' (via sync useEffect)

Time 1500ms: setTimeout fires
             Checks: activeModalRef.current !== null
             ✅ SKIPS tour (modal is open)
```

### Scenario: No Modal Interrupts

```
Time 0ms:    Dashboard loads
             activeModal = null
             activeModalRef.current = null

Time 0ms:    Initial check passes
             setTimeout scheduled

Time 1500ms: setTimeout fires
             Checks: activeModalRef.current === null
             ✅ STARTS tour (no modal)
```

---

## Why useRef Instead of State?

### Option 1: Check activeModal Directly ❌
```typescript
setTimeout(() => {
    if (!activeModal) { // Stale value!
        setShowOnboarding(true);
    }
}, 1500);
```
**Problem**: Closures capture value at creation time

### Option 2: Use State and Re-render ❌
```typescript
// Would need to cancel/reschedule timeout every time activeModal changes
// Very complex and error-prone
```

### Option 3: **useRef** ✅
```typescript
setTimeout(() => {
    if (!activeModalRef.current) { // Always current!
        setShowOnboarding(true);
    }
}, 1500);
```
**Benefits**:
- Always gets current value
- No extra re-renders
- Simple and reliable

---

## How useRef Works

### Key Concept:

```typescript
const myRef = useRef(initialValue);

// myRef.current is MUTABLE
// Reading myRef.current always gets the latest value
// Writing to myRef.current doesn't trigger re-renders
```

### In Our Case:

```typescript
const activeModalRef = useRef(activeModal);

// Sync effect keeps ref updated
useEffect(() => {
    activeModalRef.current = activeModal; // Update ref when state changes
}, [activeModal]);

// setTimeout can access current value
setTimeout(() => {
    console.log(activeModalRef.current); // Latest value, not stale
}, 1500);
```

---

## Timeline Comparison

### Before Fix (Broken):

```
0ms:     activeModal = null → setTimeout starts
200ms:   activeModal = 'JAR_QUICKSTART' (modal opens)
1500ms:  ❌ Tour starts (checks stale value: null)
         ❌ Modal and tour overlap!
```

### After Fix (Working):

```
0ms:     activeModal = null
         activeModalRef.current = null
         setTimeout starts

200ms:   activeModal = 'JAR_QUICKSTART'
         activeModalRef.current = 'JAR_QUICKSTART' (synced)

1500ms:  Check: activeModalRef.current = 'JAR_QUICKSTART'
         ✅ Tour SKIPPED (checks current value)
         
User dismisses modal:
         activeModal = null
         activeModalRef.current = null
         
Next render cycle:
         ✅ Tour triggers (no modal blocking)
```

---

## Edge Cases Handled

### 1. **Modal Opens During Delay**
- ✅ Ref updated immediately
- ✅ Tour skipped when timeout fires

### 2. **Modal Closes Before Delay**
- ✅ Ref reflects null
- ✅ Tour starts normally

### 3. **Multiple Modals in Sequence**
- ✅ Tour waits for ALL modals to close
- ✅ Only starts when activeModalRef.current === null

### 4. **User Clicks Dashboard Rapidly**
- ✅ useEffect may run multiple times
- ✅ Each setTimeout checks current ref value
- ✅ Only one tour instance triggers

---

## Testing

### Test Scenario 1: Modal Opens Quickly

**Steps**:
1. Sign up, create jar
2. Dashboard loads with empty jar
3. Modal appears within 500ms

**Expected**:
- ✅ Modal displays
- ✅ User sees "Add ideas" prompt
- ✅ Tour does NOT start
- ✅ User dismisses modal
- ✅ After 1.5s more, tour starts

### Test Scenario 2: No Modal Interruption

**Steps**:
1. Sign up, create jar, add 1 idea immediately
2. No empty modal shown
3. Dashboard fully loaded

**Expected**:
- ✅ No modal
- ✅ After 1.5s, tour starts
- ✅ All UI elements visible

---

## Code Patterns to Remember

### ❌ DON'T: Use Props/State in setTimeout
```typescript
const [value, setValue] = useState(0);

setTimeout(() => {
    console.log(value); // ❌ Stale!
}, 1000);
```

### ✅ DO: Use Ref for Async Callbacks
```typescript
const [value, setValue] = useState(0);
const valueRef = useRef(value);

useEffect(() => {
    valueRef.current = value; // Keep synced
}, [value]);

setTimeout(() => {
    console.log(valueRef.current); // ✅ Current!
}, 1000);
```

---

## Related Fixes

This is the **second** timing fix we've made:

1. **First Fix**: Added `!activeModal` check to initial condition
   - Prevented scheduling timeout if modal already open
   
2. **Second Fix** (This One): Added `activeModalRef.current` check in timeout callback
   - Prevents executing timeout if modal opened during delay

Both are needed for complete protection!

---

## Summary

**Problem**: Tour started while modal was open (race condition during 1.5s delay)

**Root Cause**: Closure captured stale `activeModal` value

**Solution**: Used `useRef` to track current `activeModal` state

**Result**: Tour waits for modals to close, no matter when they open ✅

---

**Fixed By**: Engineering Team  
**Date**: January 11, 2026  
**Status**: ✅ **DEPLOYED - PROPERLY FIXED**  
**Lesson Learned**: Always use refs for async callbacks that need current state
