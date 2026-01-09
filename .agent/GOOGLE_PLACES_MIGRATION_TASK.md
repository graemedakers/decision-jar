# Google Places API Migration Task

**Date:** January 9, 2026  
**Priority:** Medium (12 months before deprecation)  
**Status:** 📋 Planned

## Overview
Google has deprecated `google.maps.places.Autocomplete` as of March 1st, 2025. We need to migrate to `google.maps.places.PlaceAutocompleteElement` (the new Web Component API).

---

## Current Implementation

### Library Used:
- `react-google-autocomplete` v2.7.3
- Uses the deprecated `google.maps.places.Autocomplete` API

### File Affected:
- `components/LocationInput.tsx`

### Current Functionality:
- Google Places autocomplete for location input
- Client-side geocoding for address standardization
- Profile location updates
- Glass-morphism styled input

---

## Google's Warning Message

```
As of March 1st, 2025, google.maps.places.Autocomplete is not available 
to new customers. Please use google.maps.places.PlaceAutocompleteElement instead.

At this time, google.maps.places.Autocomplete is not scheduled to be 
discontinued, but google.maps.places.PlaceAutocompleteElement is recommended.

While google.maps.places.Autocomplete will continue to receive bug fixes 
for any major regressions, existing bugs will not be addressed.

At least 12 months notice will be given before support is discontinued.
```

**Key Points:**
- ⚠️ Not available to NEW customers (we're existing, so still works)
- ✅ Not scheduled for discontinuation yet
- ⏰ 12 months notice will be given before deprecation
- 🐛 Bug fixes only for major regressions
- 📚 Migration guide: https://developers.google.com/maps/documentation/javascript/places-migration-overview

---

## Migration Options

### Option 1: Update react-google-autocomplete
**Check if the library has been updated to support the new API**

**Pros:**
- Minimal code changes
- Maintains current API
- Easy migration

**Cons:**
- Depends on library maintainer
- May not be available yet

**Action:**
```bash
npm outdated react-google-autocomplete
# Check for newer versions that support PlaceAutocompleteElement
```

---

### Option 2: Use Native Google Maps API
**Implement PlaceAutocompleteElement directly**

**Pros:**
- Future-proof
- No third-party dependency
- Full control

**Cons:**
- More code to write
- Need to handle loading Google Maps script
- More complex implementation

**Implementation:**
```tsx
// Load Google Maps script
useEffect(() => {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
  script.async = true;
  document.head.appendChild(script);
}, []);

// Use PlaceAutocompleteElement
<gmp-place-autocomplete
  id="location-input"
  placeholder="Enter location..."
/>
```

---

### Option 3: Use @googlemaps/extended-component-library
**Google's official React wrapper for the new API**

**Package:** `@googlemaps/extended-component-library`

**Pros:**
- Official Google library
- React-friendly
- Future-proof
- Well-maintained

**Cons:**
- New dependency
- Learning curve
- May require refactoring

**Installation:**
```bash
npm install @googlemaps/extended-component-library
```

**Usage:**
```tsx
import { APIProvider, PlaceAutocomplete } from '@googlemaps/extended-component-library/react';

<APIProvider apiKey={apiKey}>
  <PlaceAutocomplete
    onPlaceChanged={(place) => {
      // Handle place selection
    }}
  />
</APIProvider>
```

---

## Recommended Approach

### Phase 1: Research (Now)
1. ✅ Document the deprecation warning
2. ⬜ Check if `react-google-autocomplete` has updates
3. ⬜ Review Google's official migration guide
4. ⬜ Test `@googlemaps/extended-component-library`
5. ⬜ Evaluate which option best fits our needs

### Phase 2: Implementation (Q1 2026)
1. ⬜ Create feature branch
2. ⬜ Implement new API
3. ⬜ Maintain current styling (glass-morphism)
4. ⬜ Preserve all functionality:
   - Autocomplete
   - Geocoding
   - Profile updates
   - Loading states
5. ⬜ Add error handling

### Phase 3: Testing (Q1 2026)
1. ⬜ Unit tests
2. ⬜ Integration tests
3. ⬜ Manual testing across browsers
4. ⬜ Mobile testing
5. ⬜ Performance testing

### Phase 4: Deployment (Q2 2026)
1. ⬜ Deploy to staging
2. ⬜ User acceptance testing
3. ⬜ Monitor for issues
4. ⬜ Deploy to production
5. ⬜ Remove old dependency

---

## Technical Requirements

### Must Preserve:
- ✅ Autocomplete functionality
- ✅ Address standardization
- ✅ Profile location updates
- ✅ Glass-morphism styling
- ✅ Loading states
- ✅ Error handling
- ✅ Accessibility

### Must Add:
- ✅ Support for new API
- ✅ Backward compatibility during transition
- ✅ Feature flag for gradual rollout
- ✅ Monitoring/logging

---

## Migration Guide Reference

### Google's Official Guide:
https://developers.google.com/maps/documentation/javascript/places-migration-overview

### Key Changes:
1. **Web Component:** New API uses Web Components
2. **Event Handling:** Different event structure
3. **Styling:** CSS-based instead of options object
4. **Loading:** Async loading with `loading=async`

### Example Migration:

**Old (Deprecated):**
```javascript
const autocomplete = new google.maps.places.Autocomplete(input, {
  types: ['geocode', 'establishment']
});

autocomplete.addListener('place_changed', () => {
  const place = autocomplete.getPlace();
  // Handle place
});
```

**New (Recommended):**
```html
<gmp-place-autocomplete
  id="autocomplete"
  placeholder="Enter location"
></gmp-place-autocomplete>

<script>
  const autocomplete = document.getElementById('autocomplete');
  autocomplete.addEventListener('gmp-placeselect', (event) => {
    const place = event.detail.place;
    // Handle place
  });
</script>
```

---

## Timeline

### Immediate (Now):
- ✅ Document the warning
- ✅ Create migration task
- ⬜ Add to backlog

### Short-term (Q1 2026):
- ⬜ Research and choose migration path
- ⬜ Implement new API
- ⬜ Test thoroughly

### Medium-term (Q2 2026):
- ⬜ Deploy to production
- ⬜ Monitor for issues
- ⬜ Remove old code

### Long-term (Q3 2026):
- ⬜ Verify deprecation timeline
- ⬜ Ensure complete migration
- ⬜ Update documentation

---

## Risk Assessment

### Low Risk:
- ✅ 12 months notice before deprecation
- ✅ Current API still works
- ✅ Bug fixes for major issues

### Medium Risk:
- ⚠️ New customers can't use old API
- ⚠️ Minor bugs won't be fixed
- ⚠️ Library dependency may not update

### High Risk:
- ❌ None currently

---

## Testing Checklist

### Functional Testing:
- [ ] Autocomplete suggestions appear
- [ ] Place selection works
- [ ] Address standardization works
- [ ] Profile updates work
- [ ] Error handling works
- [ ] Loading states work

### UI/UX Testing:
- [ ] Styling matches current design
- [ ] Responsive on mobile
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Touch targets adequate

### Browser Testing:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

### Performance Testing:
- [ ] Script loads quickly
- [ ] No memory leaks
- [ ] Smooth autocomplete
- [ ] No blocking

---

## Resources

### Documentation:
- [Migration Guide](https://developers.google.com/maps/documentation/javascript/places-migration-overview)
- [PlaceAutocompleteElement Reference](https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-element)
- [Extended Component Library](https://github.com/googlemaps/extended-component-library)

### Examples:
- [Official Samples](https://developers.google.com/maps/documentation/javascript/examples)
- [CodePen Examples](https://codepen.io/collection/DgwjNL)

---

## Notes

### Current Status:
- The old API still works for existing customers
- No immediate action required
- We have time to plan and implement properly

### Recommendations:
1. **Don't rush** - We have at least 12 months
2. **Test thoroughly** - This is a critical user-facing feature
3. **Monitor updates** - Check for library updates regularly
4. **Plan migration** - Add to Q1 2026 roadmap

---

## Conclusion

While the deprecation warning is concerning, we have ample time to migrate properly. The recommended approach is:

1. **Research** the best migration path (Q1 2026)
2. **Implement** using official Google library (Q1 2026)
3. **Test** thoroughly before deployment (Q2 2026)
4. **Deploy** with monitoring (Q2 2026)

**Priority:** Medium  
**Deadline:** Q2 2026 (before any potential deprecation)  
**Effort:** 2-3 days development + testing  
**Risk:** Low (plenty of time to migrate)
