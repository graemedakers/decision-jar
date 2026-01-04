# Demo Mode UX Improvements

## Changes Made

### 1. Demo Mode - "Add to Jar" Functionality Fixed ✅

**Problem:** When in demo mode, clicking "Add to Jar" from concierge search results gave an unfriendly error message because it was trying to call the authenticated API endpoint.

**Solution:** Modified `useConciergeActions.ts` to detect demo mode and use localStorage-based demo storage instead of the API:
- Detects if user is in demo mode using `isDemoMode()`
- Uses `addDemoIdea()` function to store ideas in localStorage
- Shows a friendly success message: "✅ Added to your Jar! (Demo Mode: This idea will appear in your jar and can be spun!)"
- Ideas added from concierge searches now appear in the demo jar and can be spun

**Files Modified:**
- `hooks/useConciergeActions.ts` - Added demo mode detection and localStorage handling

### 2. Movie Scout - Map Link Hidden for Streaming Platforms ✅

**Problem:** The "Map" button was showing for streaming services (Netflix, Disney+, etc.) where there's no physical location to map.

**Solution:** Modified `ConciergeResultCard.tsx` to conditionally render the Map button:
- Map button now only shows when `rec.address` exists
- Streaming platforms without addresses won't show the Map button
- Physical cinemas still show the Map button as expected

**Files Modified:**
- `components/ConciergeResultCard.tsx` - Added conditional rendering for Map button

### 3. Streaming Service Web Links (Noted for Future Work) 📝

**Issue:** Web links for streaming services sometimes give 404 errors or don't properly open the streaming app on mobile.

**Current Status:** The web link button already has conditional rendering (`{rec.website && ...}`), so it only appears when a website URL is provided by the AI.

**Recommendation for Future:** 
- The AI prompts in `/api/movie-concierge/route.ts` should be updated to return proper deep links for streaming platforms (e.g., `netflix://title/123456` for Netflix apps)
- Alternatively, the AI could return the web URL to the title page rather than trying to direct link to playback
- This would require changes to the AI prompt to specify the format of URLs to return

## Testing Checklist

- [x] In demo mode, search for restaurants using Dining Concierge
- [x] Click "Add to Jar" on a search result
- [x] Verify the idea appears in the demo jar
- [x] Verify you can spin the jar and get the added idea
- [x] Search for movies using Movie Scout with streaming platforms selected
- [x]  Verify Map button does NOT appear for streaming results
- [x] Search for movies with "Cinemas (Local)" selected
- [x] Verify Map button DOES appear for cinema results

## User Experience Improvements

1. **Demo users can now fully experience the concierge features** - adding ideas to their jar and spinning them
2. **Clearer feedback** - Friendly message explains demo mode status
3. **Less confusion** - Map button only appears when relevant
4. **Better mobile experience** - No more confusing Map buttons for streaming services
