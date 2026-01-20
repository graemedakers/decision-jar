# Conditional Email Verification - Testing Guide

## ✅ Implementation Complete!

All features have been integrated into your local environment. Here's how to test everything:

## 📦 Files Modified

### Modified Files:
1. `lib/auth-options.ts` - Auto-verify OAuth users
2. `app/api/auth/login/route.ts` - Remove login blocking
3. `app/dashboard/page.tsx` - Add verification banner
4. `components/SettingsModal.tsx` - Gate Pro upgrade
5. `components/NotificationPreferences.tsx` - Add email notification note

### New Files Created:
1. `components/VerificationBanner.tsx` - Dismissible verification nudge
2. `components/VerifyEmailGate.tsx` - Verification gate modal
3. `app/api/auth/resend-verification/route.ts` - Resend verification email

## 🧪 Testing Checklist

### Test 1: OAuth User (Google/Facebook Sign-in)
**Expected Behavior**: Auto-verified, no friction

1. **Sign up with Google**
   ```
   → Go to /signup
   → Click "Continue with Google"
   → Complete Google OAuth flow
   ```

2. **Check Database** (Optional)
   ```sql
   SELECT email, "emailVerified", "verificationToken" 
   FROM "User" 
   WHERE email = 'your-google-email@gmail.com';
   ```
   - ✅ `emailVerified` should have a timestamp
   - ✅ `verificationToken` should be NULL

3. **Check Dashboard**
   ```
   → Login and go to /dashboard
   → Should NOT see blue verification banner
   ```

4. **Try Pro Upgrade**
   ```
   → Open Settings (gear icon)
   → Click "Upgrade to Pro"
   → Should go directly to /premium (no gate)
   ```

---

### Test 2: Email/Password User (Unverified)
**Expected Behavior**: Can use app, but gated from premium features

1. **Sign up with Email/Password**
   ```
   → Go to /signup
   → Enter name, email, password
   → Submit form
   ```

2. **Check Email**
   ```
   → Should receive verification email
   → DON'T click the link yet (testing unverified state)
   ```

3. **Login Immediately**
   ```
   → Go to /login
   → Enter credentials
   → ✅ Should login successfully (no blocking!)
   ```

4. **Check Dashboard**
   ```
   → Should see blue verification banner at top
   → Banner should show your email
   → "Resend Email" button should be present
   → Banner should be dismissible (X button)
   ```

5. **Test Core Features (Should All Work)**
   ```
   → Add an idea ✅
   → Spin the jar ✅
   → View memories ✅
   → Create a new jar ✅
   → Copy invite link ✅
   → Enable push notifications ✅
   ```

6. **Try Pro Upgrade (SHOULD BE BLOCKED)**
   ```
   → Open Settings
   → Click "Upgrade to Pro"
   → ✅ Should show verification gate modal
   → Modal should explain why verification is needed
   → Should show "Resend Email" button
   ```

7. **Check Notification Settings**
   ```
   → In Settings, scroll to "Subscription & Notifications"
   → Open "Notification Preferences"
   → ✅ Should see blue note about email verification
   → Note: "Email notifications require verified email"
   → All toggles should still work (for push notifications)
   ```

8. **Test Resend Email**
   ```
   → Click "Resend Email" in banner or modal
   → Should see success toast
   → Check email inbox for new verification link
   ```

---

### Test 3: Email Verification Flow
**Expected Behavior**: Gates disappear after verification

1. **Verify Email**
   ```
   → Open verification email
   → Click verification link
   → Should see success page
   ```

2. **Check Dashboard Again**
   ```
   → Refresh /dashboard
   → ✅ Blue verification banner should DISAPPEAR
   ```

3. **Try Pro Upgrade Again**
   ```
   → Open Settings
   → Click "Upgrade to Pro"
   → ✅ Should go directly to /premium (no gate!)
   ```

---

### Test 4: Edge Cases

#### Resend to Already Verified User
```
→ Verify email (Test 3)
→ Try clicking "Resend Email" again
→ Should see error: "Email is already verified"
```

#### Dismiss Banner
```
→ As unverified user, dismiss verification banner (X button)
→ Refresh page
→ Banner should NOT reappear (local storage)
```

#### OAuth User Shouldn't See Gate
```
→ Sign up with Google
→ Try to upgrade to Pro
→ Should NOT see verification gate
```

---

## 🎯 Success Criteria

### ✅ OAuth Users:
- [x] Auto-verified on signup
- [x] No verification banner
- [x] No gates on any features
- [x] Seamless experience

### ✅ Email/Password Users (Unverified):
- [x] Can login immediately
- [x] Can use all core features
- [x] See friendly verification banner
- [x] Banner is dismissible
- [x] Can resend verification email
- [x] Blocked from Pro upgrade with clear modal
- [x] See note on email notifications

### ✅ Email/Password Users (Verified):
- [x] Banner disappears
- [x] All gates removed
- [x] Full access to Pro upgrade
- [x] Identical experience to OAuth users

---

## 🐛 Common Issues & Solutions

### Issue: "Can't find VerificationBanner"
**Solution**: Make sure you've saved all files. The component is at:
`components/VerificationBanner.tsx`

### Issue: Verification banner shows for OAuth users
**Solution**: Check `lib/auth-options.ts` - the auto-verify logic should run on user creation

### Issue: Pro upgrade still goes through for unverified users
**Solution**: Check `components/SettingsModal.tsx` - the `isEmailVerified` check should be in the onClick handler

### Issue: Can't test locally
**Solution**: 
1. Run `npm run dev`
2. Open http://localhost:3000
3. Clear browser cache if you see old UI

---

## 📊 Database Verification (Optional)

### Check User Verification Status:
```sql
-- See all users and their verification status
SELECT 
    email, 
    "emailVerified", 
    "passwordHash" IS NULL as is_oauth,
    "verificationToken"
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 10;
```

### Manually Verify a User (For Testing):
```sql
-- Replace 'user@example.com' with actual email
UPDATE "User" 
SET "emailVerified" = NOW(), "verificationToken" = NULL
WHERE email = 'user@example.com';
```

---

## 🚀 Next Steps

### If Testing Passes:
1. Review all changes one final time
2. Test on both desktop and mobile
3. Commit changes to git
4. Deploy to production

### Recommended Commit Message:
```
feat: implement conditional email verification

- Auto-verify OAuth users (Google/Facebook)
- Remove login blocking for unverified users  
- Add friendly verification banner on dashboard
- Gate Pro upgrades behind email verification
- Add note about email notifications requiring verification
- Add resend verification email endpoint

Users can now use the app immediately after signup.
OAuth users are auto-verified. Email/password users
are gently encouraged to verify with UI nudges, but
verification is only required for Pro upgrade and email
notifications.
```

---

## 💡 Pro Tips

1. **Clear Browser Cache**: Between tests, clear cache to see fresh UI
2. **Use Incognito**: Test different user types in separate incognito windows
3. **Check Console**: Open DevTools console to see debug logs
4. **Test Mobile**: Verification is especially important on mobile devices
5. **Real Email**: Use a real email address to test the actual verification flow

---

## ❓ Questions to Consider

Before deploying to production:

1. **Email Sending**: Is your email service (SendGrid, etc.) properly configured?
2. **Verification Link**: Does the verification link work in production domain?
3. **Monitoring**: Do you have error tracking (Sentry, etc.) set up?
4. **Analytics**: Do you want to track verification rates?
5. **A/B Testing**: Want to test this with a subset of users first?

---

Ready to test! Let me know if you find any issues. 🎉
