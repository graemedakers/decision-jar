# OAuth Accidental Signup Bug Fix

## Date
January 17, 2026

## Issue Report
User reported signing up with email/password, but OAuth (Google) signup was triggered instead, resulting in:
- No password stored in database
- Google profile picture saved
- OAuth Account record created
- "My First Jar" created via NextAuth's `createUser` event

## Root Cause Analysis

### Investigation Process
1. **Database Evidence**: 
   - `passwordHash` was NULL
   - `verificationToken` was NULL
   - User had Google profile image URL
   - `Account` table showed Google OAuth record

2. **Code Review** of `SignupForm.tsx`:
   - Social login buttons (Google/Facebook) positioned ABOVE the email/password form
   - **CRITICAL BUG**: OAuth buttons missing `type="button"` attribute
   - Default button type in forms is `type="submit"`

### The Bug

**Lines 374-399** in `components/auth/SignupForm.tsx`:

```tsx
<Button
    variant="secondary"
    onClick={() => handleSocialLogin('google')}
    // ❌ MISSING: type="button"
    className="..."
>
```

**How it caused the problem**:
1. User filled out name, email, and password fields
2. User pressed **Enter** to submit the form
3. Browser looked for the first submit button in the form
4. Found Google OAuth button (which lacked `type="button"`)
5. Triggered `handleSocialLogin('google')` instead of form submission
6. User was redirected to Google OAuth flow

### Why This Is a Critical UX Bug

- **HTML Standard**: Buttons inside `<form>` elements default to `type="submit"` if not specified
- **Enter Key Behavior**: Pressing Enter in a form field triggers the first submit-type button
- **Visual Layout**: OAuth buttons appeared first, making them the default submit target
- **No Confirmation**: OAuth redirects happened instantly without user awareness

## Solution Implemented

### Fix 1: Added Explicit `type="button"` to OAuth Buttons

**Files Modified**:
- `components/auth/SignupForm.tsx` (Lines 375 & 387)
- `components/auth/LoginForm.tsx` (Lines 115 & 127)

```tsx
<Button
    type="button"  // ✅ FIXED: Explicitly mark as non-submit button
    variant="secondary"
    onClick={() => handleSocialLogin('google')}
    className="..."
>
```

**Effect**: OAuth buttons now explicitly marked as `type="button"`, preventing them from being treated as submit buttons. Pressing Enter in form fields will now correctly trigger the "Create Account" / "Sign In" button instead.

## Testing Verification

### Before Fix
1. Fill out name, email, password
2. Press Enter in password field
3. ❌ **BUG**: Google OAuth triggered instead of form submission

### After Fix
1. Fill out name, email, password
2. Press Enter in password field
3. ✅ **CORRECT**: Form submits to `/api/auth/signup`

## Additional Recommendations (Future Improvements)

1. **Move OAuth Buttons Below Form**
   - Place social login options after the email/password form
   - Add clearer visual separation

2. **Add Confirmation Before OAuth**
   - Show modal: "You're about to sign up with Google. Continue?"
   - Prevents accidental OAuth signups

3. **Show Signup Method in Profile**
   - Display "Signed up with: Google" or "Signed up with: Email"
   - Allow users to add password to OAuth accounts

4. **Improve Button Styling**
   - Make OAuth buttons less prominent
   - Make primary signup button more prominent

## Files Changed

1. `components/auth/SignupForm.tsx` - Added `type="button"` to Google and Facebook buttons
2. `components/auth/LoginForm.tsx` - Added `type="button"` to Google and Facebook buttons
3. `OAUTH_ACCIDENTAL_SIGNUP_FIX.md` - This documentation

## Commit

```
fix: prevent accidental OAuth signup when pressing Enter in auth forms

- Add explicit type="button" to OAuth social login buttons
- Prevents Enter key from triggering OAuth instead of form submission
- Affects both SignupForm and LoginForm components
```

## Deployment Checklist

- [x] Fix implemented and tested locally
- [x] Commit created
- [ ] Push to GitHub
- [ ] Deploy to production
- [ ] Test form submission with Enter key
- [ ] Test OAuth buttons still work on click
- [ ] Monitor for any signup issues

## Lessons Learned

1. **Always specify button type**: Never rely on browser defaults for buttons in forms
2. **Test keyboard navigation**: Enter key behavior is critical for form UX
3. **Database forensics works**: OAuth Account records revealed the true signup method
4. **User reports matter**: Even confident users can be affected by UX bugs

## Success Criteria

✅ Pressing Enter in any signup form field submits the email/password form
✅ OAuth buttons only trigger when explicitly clicked
✅ No accidental OAuth signups
✅ Both signup methods work independently
