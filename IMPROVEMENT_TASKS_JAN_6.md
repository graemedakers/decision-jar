# Decision Jar Improvement Tasks - January 6, 2026

## Task List

### 1. ✅ Add Social Sharing to Weekend Planner
**Goal**: Add a "Share to Social Media" button that allows users to share their weekend plan as an image or text.

**Implementation**:
- Add a Share button in `WeekendPlannerModal.tsx`
- Create shareable content (formatted text or image generation)
- Use Web Share API for native mobile sharing
- Track sharing events in analytics

---

### 2. 🚧 Add Menu Planner to Dashboard
**Goal**: Create a "Menu Planner" / "Meal Planner" concierge tool and add it to the Executive Decision Suite on the dashboard.

**Implementation**:
- Create `MenuPlannerModal.tsx` component
- Add API route `/api/menu-planner/route.ts` 
- Integrate with dashboard in the Executive Decision Suite grid
- Allow users to plan weekly meals with AI suggestions

---

### 3. 🚧 Remove Map Link from Online Games
**Goal**: When the Game Concierge returns online/digital games, hide the map/address link (since there's no physical location).

**Implementation**:
- Update `GameConciergeModal.tsx` or `ConciergeResultCard.tsx`
- Conditionally hide address/map for online games
- Check if `rec.address` contains "Online" or is null

---

### 4. 🚧 Enable Moving Ideas Between Jars
**Goal**: Provide UI for users to transfer/move ideas from one jar to another.

**Implementation**:
- Add "Move to..." action in idea context menu (in `/app/jar/page.tsx`)
- Create API endpoint `/api/ideas/[id]/move/route.ts`
- Show jar selection modal when "Move" is clicked
- Update `coupleId`/`jarId` for the idea in database

---

### 5. 📋 Community Jars Strategy
**Goal**: Boost usage and benefit of Community Jars feature.

**Strategy Document**:
- Create public jar discovery page
- Add social sharing for community jars
- Implement "Copy this Jar" functionality
- Add curator profiles/leaderboards
- Monetization: Premium curators or featured jars

---

## Status Legend
- ✅ Complete
- 🚧 In Progress
- 📋 Planning/Strategy

---

## Implementation Order
1. Weekend Planner Social Sharing (Quick Win)
2. Remove Map Link from Online Games (Quick Win)
3. Add Menu Planner to Dashboard (Medium Task)
4. Enable Moving Ideas Between Jars (Medium Task)
5. Community Jars Strategy (Strategic Planning)
