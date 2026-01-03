# 🔄 Applying Concierge Trial to All Remaining Modals

## ✅ **Completed:**
1. DiningConciergeModal ✓
2. BarConciergeModal ✓

## 📋 **Remaining (9 modals):**
3. NightClubConciergeModal
4. MovieConciergeModal
5. FitnessConciergeModal
6. GameConciergeModal
7. SportsConciergeModal
8. Escape RoomConciergeModal
9. HotelConciergeModal
10. WellnessConciergeModal
11. TheatreConciergeModal

---

## 🛠️ **Exact Pattern to Apply**

For each remaining modal, apply these 4 changes:

### **Change 1: Add Imports (after existing imports)**
```typescript
import { useDemoConcierge } from "@/lib/use-demo-concierge";
import { DemoUpgradePrompt } from "./DemoUpgradePrompt";
```

### **Change 2: Add Hook & State (at start of component function)**
```typescript
const demoConcierge = useDemoConcierge();
const [showTrialUsedPrompt, setShowTrialUsedPrompt] = useState(false);
```

### **Change 3: Mark Usage (in handleGetRecommendations, BEFORE setIsLoading)**
```typescript
if (demoConcierge && !demoConcierge.hasUsedTrial) {
    demoConcierge.onUse();
}
```

### **Change 4: Show Prompt After Success (in handleGetRecommendations, after setRecommendations)**
```typescript
if (demoConcierge && demoConcierge.triesRemaining === 0) {
    setTimeout(() => {
        setShowTrialUsedPrompt(true);
    }, 3000);
}
```

### **Change 5: Display Prompt (before closing </div> of main content)**
```typescript
{showTrialUsedPrompt && demoConcierge && demoConcierge.triesRemaining === 0 && (
    <div className="mt-6">
        <DemoUpgradePrompt 
            reason="premium"
            message="Loved the [NAME] Concierge? Sign up for unlimited access to ALL 11 premium concierge tools!"
        />
    </div>
)}
```

---

## 📝 **Modal-Specific Messages**

Replace `[NAME]` with:
- NightClub: "Night Club"
- Movie: "Movie"
- Fitness: "Fitness"
- Game: "Game Night"
- Sports: "Sports Event"
- EscapeRoom: "Escape Room"
- Hotel: "Hotel"
- Wellness: "Wellness"
- Theatre: "Theatre"

---

## ⚡ **Quick Commands**

To apply all at once via find/replace or script:

1. Open each remaining modal
2. Add imports at top
3. Add hook/state after function declaration
4. Find `handleGetRecommendations` → add usage tracking
5. Find `setRecommendations(data.recommendations)` → add timeout
6. Find closing `</div>` before `</motion.div>` → add prompt

---

## 🧪 **Testing Each Modal**

After updating, test:
1. Visit `/demo`
2. Open concierge tool
3. Complete search
4. Verify results show
5. After 3 seconds, upgrade prompt appears
6. Check localStorage: `demo_concierge_count` = "1"
7. Try again → should show signup immediately

---

## 📊 **Expected Result**

All 11 concierge tools will:
- ✅ Allow 1 free trial for demo users
- ✅ Track usage in localStorage
- ✅ Show upgrade prompt after trial
- ✅ Drive demo-to-premium conversions
- ✅ Provide consistent UX across all tools

---

## 💡 **Automation Tip**

Create a script to batch update:
```bash
# Find all *ConciergeModal.tsx files
# Apply same sed/awk pattern to each
# Test and commit
```

Or manually update each (15 minutes total for all 9).

---

**Once complete, you'll have full concierge trial coverage across all premium tools!** 🎉
