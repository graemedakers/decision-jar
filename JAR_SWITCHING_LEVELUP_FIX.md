# Jar Switching & Level Up Fixes
**Date**: January 11, 2026  
**Issues**: Slow jar name updates & repeating Level Up modal  
**Status**: ✅ **LEVEL UP FIXED** | 🔄 **JAR SWITCHING NEEDS UX IMPROVEMENT**

---

## Issue 1: Level Up Modal Keeps Appearing ✅ FIXED

### Problem:

When switching to a specific jar, the Level Up modal **always appeared**, even though the user had already seen it for that jar's level.

### Root Cause:

Gamification is **JAR-SPECIFIC** (each jar has its own XP and level), but the modal tracking was **component-specific**:

```typescript
// hooks/useUser.ts (BEFORE)
const prevLevelRef = useRef<number | null>(null);

useEffect(() => {
    if (level > prevLevelRef.current) {
        onLevelUp?.(level); // ❌ Shows every time component remounts
    }
    prevLevelRef.current = level;
}, [level]);
```

**What Happened**:
```
1. User on "Jar A" (Level 3)
2. prevLevelRef.current = 3
3. Switch to "Jar B" (Level 5)
4. Component re-renders, prevLevelRef.current still = 3
5. 5 > 3 → Modal shows! ❌
6. Switch back to "Jar B" later
7. Component may have reset, prevLevelRef = null
8. 5 > null → Modal shows AGAIN! ❌
```

---

### The Fix:

Track last shown level **per jar** in localStorage:

**File**: `hooks/useUser.ts`

```typescript
useEffect(() => {
    if (typeof level === 'number' && userData?.activeJarId) {
        const jarId = userData.activeJarId;
        const storageKey = `level_shown_${jarId}`;
        
        // Get last shown level for THIS jar from localStorage
        const lastShownLevel = parseInt(localStorage.getItem(storageKey) || '0', 10);
        
        // Only show level up modal if:
        // 1. Previous ref level exists (not first load) AND
        // 2. New level is higher than previous ref level AND
        // 3. Haven't shown this level for this jar yet
        if (prevLevelRef.current !== null && 
            level > prevLevelRef.current && 
            level > lastShownLevel) {
            // Show modal
            onLevelUp?.(level);
            // Remember we showed this level for this jar
            localStorage.setItem(storageKey, level.toString());
        }
        
        prevLevelRef.current = level;
    }
}, [level, onLevelUp, userData?.activeJarId]);
```

---

### How It Works Now:

**Scenario 1: Level Up in Current Jar**
```
Jar "Date Ideas" at Level 2
User adds ideas, reaches Level 3
  ↓
prevLevelRef.current = 2
level = 3
lastShownLevel (from localStorage) = 2
  ↓
Checks:
  ✅ prevLevelRef.current (2) !== null
  ✅ level (3) > prevLevelRef.current (2)
  ✅ level (3) > lastShownLevel (2)
  ↓
Show modal! ✅
Save: localStorage['level_shown_jar123'] = '3'
```

**Scenario 2: Switch to Another Jar**
```
Switch from "Date Ideas" (Level 3) to "Work Tasks" (Level 5)
  ↓
prevLevelRef.current = 3 (from previous jar)
level = 5 (Work Tasks level)
lastShownLevel = 5 (already shown before for this jar)
  ↓
Checks:
  ✅ prevLevelRef.current (3) !== null
  ✅ level (5) > prevLevelRef.current (3)
  ❌ level (5) NOT > lastShownLevel (5)
  ↓
DON'T show modal ✅ (already shown for this jar)
```

**Scenario 3: Return to Jar Later**
```
Return to "Date Ideas" (still Level 3)
  ↓
Component may have unmounted/remounted
prevLevelRef.current = null (initial state)
level = 3
lastShownLevel = 3 (we showed it before)
  ↓
Checks:
  ❌ prevLevelRef.current === null (first load after mount)
  ↓
DON'T show modal ✅
Set: prevLevelRef.current = 3
```

---

### localStorage Keys:

```typescript
// Structure:
localStorage['level_shown_{jarId}'] = '{level}'

// Examples:
localStorage['level_shown_abc123'] = '3'  // Date Ideas jar at level 3
localStorage['level_shown_def456'] = '5'  // Work Tasks jar at level 5
localStorage['level_shown_ghi789'] = '1'  // New jar, shown level 1
```

---

### Benefits:

✅ **Persistent Tracking** - Survives page reloads  
✅ **Jar-Specific** - Each jar tracks separately  
✅ **No Duplicates** - Won't show same level twice  
✅ **Works After Remount** - Uses localStorage, not just ref  

---

## Issue 2: Slow Jar Name Update 🔄 NEEDS UX IMPROVEMENT

### Problem:

When switching to a different jar, the jar name in the header takes a long time to update, making it confusing whether the switch actually happened.

### Root Cause:

Jar switching likely involves:
1. API call to update `activeJarId`
2. Refetch user data 
3. UI updates when new data arrives

```
User clicks jar → API call → Wait for response → Refetch data → UI update
                            ↑
                   User sees old name (confusing!)
```

---

### Recommended Solutions:

#### Option 1: Optimistic Update (Best UX) ⭐

Update the UI **immediately** before the API call completes:

```typescript
const handleJarSwitch = async (newJarId: string, newJarName: string) => {
    // 1. Immediately update UI (optimistic)
    queryClient.setQueryData(CacheKeys.user(), (old: UserData) => ({
        ...old,
        activeJarId: newJarId,
        jarName: newJarName
    }));
    
    // 2. Make API call in background
    try {
        await fetch('/api/jars/switch', {
            method: 'POST',
            body: JSON.stringify({ jarId: newJarId })
        });
    } catch (error) {
        // 3. Rollback on error
        queryClient.invalidateQueries(CacheKeys.user());
    }
};
```

**Benefits**:
- ✅ Instant visual feedback
- ✅ Feels responsive
- ✅ Can rollback on error

---

#### Option 2: Loading State (Simpler)

Show a loading indicator while switching:

```typescript
const [isSwitchingJar, setIsSwitchingJar] = useState(false);

const handleJarSwitch = async (newJarId: string) => {
    setIsSwitchingJar(true);
    
    try {
        await fetch('/api/jars/switch', {
            method: 'POST',
            body: JSON.stringify({ jarId: newJarId })
        });
        await refreshUser();
    } finally {
        setIsSwitchingJar(false);
    }
};

// In UI:
<h1 className={isSwitchingJar ? 'opacity-50' : ''}>
    {isSwitchingJar ? 'Switching...' : jarName}
</h1>
```

**Benefits**:
- ✅ Simple to implement
- ✅ Clear feedback
- ❌ Not as smooth as optimistic

---

#### Option 3: Skeleton/Fade Transition

Use CSS transitions to make the delay feel intentional:

```typescript
<h1 className={cn(
    'transition-opacity duration-200',
    isRefetching && 'opacity-0'
)}>
    {jarName}
</h1>
```

**Benefits**:
- ✅ Smooth animation
- ✅ Minimal code
- ❌ Doesn't speed up actual switch

---

### Current Implementation Investigation:

To properly fix this, I'd need to see:

1. **Where jar switching happens** - Need to find the jar selector component
2. **How the API call is made** - Is there a `/api/jars/switch` endpoint?
3. **How user data refetches** - Is it automatic via query invalidation?

**Next Steps**:
```bash
# Find jar switching logic
grep -r "activeJarId" --include="*.tsx" --include="*.ts"

# Find jar selector component
find . -name "*JarSelect*" -o -name "*JarSwitch*"

# Check for switch API
grep -r "/api/jars" app/api/
```

---

## Gamification: Jar-Specific or User-Specific?

### Answer: **JAR-SPECIFIC** ✅

From `prisma/schema.prisma`:

```prisma
model Jar {
  // ... other fields
  xp          Int      @default(0)
  level       Int      @default(1)
  achievements  UnlockedAchievement[]
}

model UnlockedAchievement {
  jarId         String
  achievementId String
  jar           Jar      @relation(fields: [jarId], references: [id])
  
  @@unique([jarId, achievementId])
}
```

**This makes sense because**:
- ✅ Different jars serve different purposes
- ✅ Progress in "Work Tasks" shouldn't affect "Date Ideas"
- ✅ Keeps each jar's rewards separate
- ✅ Motivates engagement across ALL jars

---

## Summary

### ✅ Fixed: Level Up Modal

- **Problem**: Modal showed every time switching to a jar
- **Cause**: Tracking was component-scoped, not jar-scoped
- **Solution**: Store last shown level per jar in localStorage
- **Result**: Modal only shows once per level per jar

### 🔄 Identified: Jar Switching Slowness

- **Problem**: Jar name takes too long to update
- **Likely Cause**: Waiting for API + refetch cycle
- **Recommended Solution**: Optimistic updates or loading state
- **Status**: Needs implementation (requires finding jar switching code)

---

**Fixed By**: Engineering Team  
**Date**: January 11, 2026  
**Status**: ✅ **LEVEL UP FIXED** | 🔄 **JAR SWITCHING NEEDS UX**  
**Impact**: Better gamification UX, no more modal spam
