# ⚠️ API Endpoint Status: `/api/user/update`

## Status: ❌ Does NOT Exist

The `/api/user/update` (PATCH) endpoint referenced in the Phase 1 fixes **does not currently exist** in the codebase.

---

## ✅ Solution: Use Direct Prisma Update (No New Endpoint Needed!)

After reviewing the codebase, I found that **other endpoints** (like `/api/jar/join`) update `activeJarId` directly using Prisma:

```typescript
await prisma.user.update({
    where: { id: user.id },
    data: { activeJarId: jarId }
});
```

---

## 🔧 Update Required in `hooks/useConciergeActions.ts`

### Current Code (Lines 132-137):
```typescript
// Set as active (assumes /api/user/update exists or we just update user)
await fetch('/api/user/update', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activeJarId: firstJar.id })
});
```

### ✅ FIXED Code (Use `/api/jar/switch`):
```typescript
// Set jar as active using jar switch endpoint
await fetch(`/api/jar/${firstJar.id}/switch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
});
```

---

## 📋 Two Options to Fix

### **Option A: Create `/api/jar/[id]/switch` Endpoint** (Recommended)

Create a simple endpoint to switch active jar:

**File**: `app/api/jar/[id]/switch/route.ts`

```typescript
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: jarId } = await params;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                memberships: {
                    where: { jarId }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user is a member of this jar
        if (user.memberships.length === 0) {
            return NextResponse.json({ error: "You are not a member of this jar" }, { status: 403 });
        }

        // Update active jar
        await prisma.user.update({
            where: { id: user.id },
            data: { activeJarId: jarId }
        });

        return NextResponse.json({ success: true, jarId });

    } catch (error: any) {
        console.error("Switch jar error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}
```

---

### **Option B: Update Code to Use Existing Pattern**

Instead of creating a new endpoint, modify `useConciergeActions.ts` to use the same pattern as `/api/jar/join`:

```typescript
// In the existing jar check flow (line ~132)
// Instead of calling API, just retry adding the idea
// The /api/ideas endpoint will use the first membership if activeJarId is null

// Simplified version - just retry the add
const retryRes = await fetch('/api/ideas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        description: rec.name,
        details: rec.details || `${rec.description}\n\nAddress: ${rec.address || 'N/A'}\nPrice: ${rec.price || 'N/A'}\nWebsite: ${rec.website || 'N/A'}`,
        indoor: true,
        duration: "2.0",
        activityLevel: "LOW",
        cost: (rec.price && rec.price.length > 2) ? "$$$" : (rec.price && rec.price.length > 1) ? "$$" : "$",
        timeOfDay: "EVENING",
        category: category,
        isPrivate: isPrivate,
        forceJarId: firstJar.id // Pass jarId directly
    }),
});
```

**Then update `/app/api/ideas/route.ts`** to accept `forceJarId`:

```typescript
const { forceJarId, ...ideaData } = await request.json();
const currentJarId = forceJarId || user.activeJarId || user.memberships?.[0]?.jarId || user.coupleId;
```

---

## 🎯 Recommended Approach

**Use Option A** - Create `/api/jar/[id]/switch`

**Why**:
- ✅ Clean separation of concerns
- ✅ Reusable for other features (like JarSwitcher)
- ✅ Follows REST conventions
- ✅ Simple, focused endpoint
- ✅ Easy to test

**When**:
- ⏰ 10 minutes to create
- ✅ Add before merging PR
- ✅ Include in commit with Phase 1 fixes

---

## 📝 Updated Implementation Checklist

- [x] Fix 1: Debouncing ✅
- [x] Fix 2: Check existing jars ✅  
- [x] Fix 3: Jar limit handling ✅
- [x] Fix 4: Analytics tracking ✅
- [ ] **NEW**: Create `/api/jar/[id]/switch` endpoint
- [ ] Update `useConciergeActions.ts` line 132-137
- [ ] Test jar switching works
- [ ] Ready for PR!

---

## 🚀 Quick Fix Command

Want me to create the `/api/jar/[id]/switch` endpoint now?

**Time**: 5 minutes  
**Impact**: Makes Phase 1 complete and production-ready  
**Risk**: Low - simple endpoint, well-tested pattern

---

**Status**: Waiting for decision  
**Next Step**: Create switch endpoint or use Option B
