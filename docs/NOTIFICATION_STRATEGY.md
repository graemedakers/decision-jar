# Notification Strategy

## Overview

This document outlines when and how users receive notifications in the Decision Jar app.

---

## Notification Types

### 🔔 Push Notifications (Real-Time)

**Delivered via:** Service Worker + Web Push API  
**Use cases:** Time-sensitive, in-app actions

| Event | Recipient | Message | When |
|-------|-----------|---------|------|
| **Idea Selected** | Other jar members | "🎯 New pick: [Idea Name]" | When someone spins the jar |
| **New Idea Added** | Other jar members | "💡 [Name] added a new idea" | When member adds idea |
| **24h Reminder** | All jar members | "How was it? Save the memory!" | 24h after selection (no rating) |
| **Vote Complete** | _(Future)_ | "✅ Voting complete! Winner: [Idea]" | When voting concludes |

**Why Push > Email for these:**
- ✅ Immediate delivery
- ✅ Less intrusive
- ✅ User controls frequency
- ✅ No inbox clutter
- ✅ Works offline (queued)

---

### 📧 Email Notifications (Important Only)

**Delivered via:** Resend API  
**Use cases:** Critical account events, things requiring action

| Event | Recipient | Subject | When |
|-------|-----------|---------|------|
| **Account Verification** | New user | "Verify your email" | On signup |
| **Password Reset** | User | "Reset your password" | On request |
| **Jar Invite** | Invitee | "You've been invited to join [Jar Name]" | When invited |
| **Subscription Change** | User | "Subscription updated" | Stripe webhook |
| **Member Joins Jar** | Jar owner | "[Name] joined your jar" | When invite accepted |

**Why Email for these:**
- 📝 Requires action (click link)
- 🔒 Security-critical
- 💼 Professional/official
- ✉️ User expects email

---

## 🚫 What We DON'T Notify About

To prevent notification fatigue, we **intentionally avoid** sending notifications for:

- ❌ Every time someone views the jar
- ❌ Daily digests (unless user opts in)
- ❌ Marketing/promotional content
- ❌ App updates or feature announcements
- ❌ Generic "come back to the app" messages

---

## User Control

### Current Settings (in app):
- ✅ Enable/Disable push notifications (global toggle)
- ✅ Browser permission control

### Future Enhancements:
- 🔮 Granular notification preferences
  - Per-event toggles
  - Quiet hours (don't notify 10pm-8am)
  - Daily digest option
  - Email vs Push preference
- 🔮 Notification frequency limits
  - Max N notifications per hour
  - Batch similar notifications

---

## Technical Implementation

### Push Notifications

**Files:**
- `lib/notifications.ts` - Core notification logic
- `hooks/useNotifications.ts` - Client-side subscription
- `components/NotificationToggle.tsx` - UI for enabling
- `public/sw.js` - Service worker for receiving

**Flow:**
1. User enables notifications in Settings
2. Browser requests permission
3. Service worker subscribes to push service
4. Subscription saved to `PushSubscription` table
5. Server sends notification via Web Push API
6. Service worker displays notification
7. User clicks → navigates to URL

### Email Notifications

**Files:**
- `lib/mailer.ts` - Email templates
- `lib/email.ts` - Resend API integration

**Flow:**
1. Event triggers email (e.g., password reset)
2. Template rendered with user data
3. Sent via Resend API
4. Delivered to user's inbox

---

## Analytics

Track notification effectiveness with PostHog:

- `notification_sent` - When notification is sent
- `notification_clicked` - When user clicks notification
- `notification_dismissed` - When user dismisses
- `notification_permission_granted` - When user enables
- `notification_permission_denied` - When user blocks

---

## Best Practices

### ✅ DO:
- Send notifications for time-sensitive events
- Keep messages short and actionable
- Include deep link to relevant content
- Batch related notifications (don't spam)
- Respect quiet hours (future)
- Test on multiple devices/browsers

### ❌ DON'T:
- Send notifications just to "engage" users
- Repeat the same notification
- Use clickbait or misleading titles
- Send during night hours (future: add quiet hours)
- Overwhelm with frequency

---

## Notification Copy Guidelines

### Format:
```
[Emoji] [Action]: "[Content]"
Body: [Context/Details]
```

### Examples:

**Good:**
- ✅ "🎯 New pick: 'Sunset Beach Walk'"
- ✅ "💡 Sarah added 'Try new ramen spot'"
- ✅ "⏰ How was 'Karaoke Night'? Save the memory!"

**Bad:**
- ❌ "Notification" (too vague)
- ❌ "Something happened in your jar!" (clickbait)
- ❌ "You have 1 new notification" (meta)

---

## Future Enhancements

### Short-Term (Next 3 months):
- [ ] Add notification preferences UI
- [ ] Implement quiet hours
- [ ] Send notification on new idea added
- [ ] Send notification when vote completes

### Medium-Term (6 months):
- [ ] Daily digest email option
- [ ] Notification frequency limits
- [ ] Rich notifications (images, actions)
- [ ] Silent notifications (badge only)

### Long-Term (12+ months):
- [ ] AI-powered notification timing
- [ ] Multi-language support
- [ ] Native mobile app notifications (iOS/Android)
- [ ] Smart batching (group similar events)

---

## Testing

### Local Development:
```bash
# 1. Enable notifications in Settings
# 2. Check browser console for SW registration
# 3. Trigger event (e.g., spin jar)
# 4. Verify notification appears
```

### Production Testing:
```bash
# Test with curl
curl -X POST https://spinthejar.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"title":"Test","message":"Hello!","url":"/dashboard"}'
```

### Cross-Browser:
- ✅ Chrome/Edge (best support)
- ✅ Firefox (good support)
- ⚠️ Safari (limited support, requires iOS 16.4+)
- ❌ IE11 (not supported)

---

## Troubleshooting

### "Notifications not arriving"
1. Check browser permission: Settings → Site Settings → Notifications
2. Verify subscription in database: `PushSubscription` table
3. Check service worker: DevTools → Application → Service Workers
4. Check VAPID keys are set in Vercel environment variables

### "Email not arriving"
1. Check spam folder
2. Verify Resend API key is valid
3. Check Resend dashboard for delivery status
4. Ensure email is verified in Resend

---

## Support

For issues or questions:
- Check `docs/PUSH_NOTIFICATIONS_SETUP.md` for setup
- Review `lib/notifications.ts` for implementation
- Test with `scripts/test-notifications.ts` (to be created)
