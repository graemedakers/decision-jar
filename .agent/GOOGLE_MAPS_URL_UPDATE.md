# AI Prompt Update: Full Google Maps URLs

**Date:** January 9, 2026  
**Status:** ✅ Complete

## Overview
Updated the Holiday Planner AI prompt to generate full Google Maps URLs instead of deprecated short URLs (maps.app.goo.gl).

---

## Problem

### Deprecated Short URLs:
Google deprecated Firebase Dynamic Links (maps.app.goo.gl) in August 2025, causing many short URLs to fail with "Dynamic Link Not Found" errors.

**Example of broken URL:**
```
https://maps.app.goo.gl/U99Xk3q7fN29i9XWA
                      ↑ Often expired/invalid
```

---

## Solution

### Updated AI Prompt Instructions:

**Before:**
```
*Include accurate Google Maps links for every specific venue.*
```

**After:**
```
*IMPORTANT: For map links, use FULL Google Maps URLs in this format:*
*https://www.google.com/maps/search/?api=1&query=[Place+Name]+[Address]*
*DO NOT use short URLs (maps.app.goo.gl) as they are deprecated and often expired.*
*Example: https://www.google.com/maps/search/?api=1&query=Eiffel+Tower+Paris*
```

---

## URL Format Comparison

### ❌ Old Format (Short URL):
```
https://maps.app.goo.gl/U99Xk3q7fN29i9XWA
```

**Problems:**
- Deprecated service
- Often expired
- No context in URL
- Unreliable

### ✅ New Format (Full URL):
```
https://www.google.com/maps/search/?api=1&query=Eiffel+Tower+Paris
```

**Benefits:**
- ✅ Official Google Maps API
- ✅ Never expires
- ✅ Human-readable
- ✅ More reliable
- ✅ Works everywhere
- ✅ Can include place names and addresses

---

## Examples

### Example 1: Restaurant
**Old:**
```
**Lunch:** Epicurean Red Hill (Map: https://maps.app.goo.gl/qLw63TIDk8dULc5b7)
```

**New:**
```
**Lunch:** Epicurean Red Hill (Map: https://www.google.com/maps/search/?api=1&query=Epicurean+Red+Hill+Mornington+Peninsula)
```

---

### Example 2: Tourist Attraction
**Old:**
```
**Morning:** Eiffel Tower (Map: https://maps.app.goo.gl/abc123)
```

**New:**
```
**Morning:** Eiffel Tower (Map: https://www.google.com/maps/search/?api=1&query=Eiffel+Tower+Paris+France)
```

---

### Example 3: Activity Location
**Old:**
```
**Afternoon:** Arthur's Seat (Map: https://maps.app.goo.gl/xyz789)
```

**New:**
```
**Afternoon:** Arthur's Seat (Map: https://www.google.com/maps/search/?api=1&query=Arthurs+Seat+Eagle+Mornington+Peninsula)
```

---

## Google Maps Search API Format

### URL Structure:
```
https://www.google.com/maps/search/?api=1&query=SEARCH_QUERY
```

### Parameters:
- `api=1` - Required for Google Maps URLs API
- `query` - The search query (place name + address)

### Query Format:
- Use `+` for spaces
- Include place name
- Include address/location
- Be specific for better results

### Examples:
```
query=Restaurant+Name+City
query=Eiffel+Tower+Paris
query=Central+Park+New+York
query=Sydney+Opera+House+Australia
```

---

## Benefits of Full URLs

### 1. Reliability
- ✅ Never expires
- ✅ Official Google service
- ✅ Always works

### 2. Transparency
- ✅ Human-readable
- ✅ Shows what you're searching for
- ✅ Easy to verify

### 3. Flexibility
- ✅ Can include multiple search terms
- ✅ Works with place names
- ✅ Works with addresses
- ✅ Works with coordinates

### 4. Compatibility
- ✅ Works on all devices
- ✅ Works in all browsers
- ✅ Works in apps
- ✅ No special handling needed

---

## File Modified

**File:** `lib/concierge-prompts.ts`

**Location:** Holiday Planner prompt (case 'HOLIDAY')

**Lines Changed:** 574-577

**Change Type:** AI prompt instruction update

---

## Testing

### How to Test:
1. Generate a new holiday itinerary
2. Check the map links in the details
3. Verify they use the new format
4. Click the links to ensure they work

### Expected Result:
```
**Morning:** Visit the Louvre Museum - Explore world-famous art 
(Map: https://www.google.com/maps/search/?api=1&query=Louvre+Museum+Paris)
```

### Verification:
- ✅ URL starts with `https://www.google.com/maps/search/`
- ✅ Contains `api=1` parameter
- ✅ Contains `query=` with place name
- ✅ Link opens Google Maps
- ✅ Shows correct location

---

## Impact

### Immediate:
- ✅ New itineraries will have working map links
- ✅ No more "Dynamic Link Not Found" errors
- ✅ Better user experience

### Long-term:
- ✅ Future-proof solution
- ✅ More maintainable
- ✅ Better reliability

---

## Rollout

### Existing Itineraries:
- ⚠️ Old itineraries with short URLs will still have broken links
- Users can regenerate itineraries to get new URLs
- Consider adding a note in the UI about regenerating old plans

### New Itineraries:
- ✅ All new itineraries will use full URLs
- ✅ Links will be reliable
- ✅ No action needed from users

---

## Additional Improvements

### Other Concierge Tools:
Consider updating other tools that might use map links:
- Date Night Planner (already uses timeline format)
- Bar Crawl Planner (uses stops format)
- Dining Concierge (uses address field)
- Other location-based tools

### Future Enhancements:
1. **Coordinates:** Could include lat/long for precision
   ```
   query=48.8606,2.3376
   ```

2. **Place IDs:** Could use Google Place IDs for exact matches
   ```
   query=place_id:ChIJD7fiBh9u5kcRYJSMaMOCCwQ
   ```

3. **Directions:** Could generate direction links
   ```
   https://www.google.com/maps/dir/?api=1&destination=Place+Name
   ```

---

## Documentation

### For AI:
The prompt now explicitly instructs:
- Use full URLs
- Don't use short URLs
- Provides format example
- Explains why (deprecated)

### For Developers:
- URL format is standardized
- Easy to parse and validate
- Can be tested programmatically

### For Users:
- Links just work
- No confusing errors
- Reliable navigation

---

## Monitoring

### Metrics to Track:
- Map link click-through rate
- Error rate (should be near 0%)
- User feedback on navigation
- Itinerary regeneration requests

### Success Criteria:
- ✅ 0% "Dynamic Link Not Found" errors
- ✅ 100% working map links
- ✅ Positive user feedback
- ✅ No support tickets about broken maps

---

## Conclusion

Successfully updated the Holiday Planner AI prompt to generate reliable, full Google Maps URLs instead of deprecated short URLs.

**Impact:**
- ✅ All new itineraries will have working map links
- ✅ Better user experience
- ✅ Future-proof solution
- ✅ No more Firebase Dynamic Link errors

**Next Steps:**
1. Monitor new itineraries for correct URL format
2. Consider updating other concierge tools
3. Add UI note about regenerating old itineraries
4. Track user feedback

**File Modified:** `lib/concierge-prompts.ts`  
**Lines Changed:** 4 lines  
**Breaking Changes:** None  
**User Impact:** Positive (better reliability)
