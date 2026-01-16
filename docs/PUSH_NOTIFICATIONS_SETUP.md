# Push Notifications Setup Guide

## Overview

This app uses **Web Push Notifications** to notify users about ideas, votes, and jar updates. The notifications are powered by the Web Push API and require VAPID keys for authentication.

## What are VAPID Keys?

VAPID (Voluntary Application Server Identification) keys are used to identify your application to push services. They consist of:

- **Public Key**: Shared with the client (browser) - safe to expose
- **Private Key**: Kept secret on the server - never expose or commit to git

## Setup Instructions

### 1. Generate VAPID Keys (Already Done!)

```bash
node scripts/generate-vapid-keys.js
```

This generates:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BB_JUrEZJKEhReL0bIp1t77GSyXWRgyv-6ZCFBUNBG_me6DaX8H7hJ9TvpHnd7RhSJs4GJciRtYs95kZdFBnXtw
VAPID_PRIVATE_KEY=UeGjZKcfXh5-HJEFrRE1y0TdjxseGcUq3b4D6utJhSw
VAPID_SUBJECT=mailto:graeme@spinthejar.com
```

### 2. Add to Local Environment Files

The VAPID keys have been added to:
- ✅ `dev.env` (for local development)
- ✅ `prod.env` (reference for production values)

### 3. Add to Vercel Environment Variables

**CRITICAL**: You must add these to your Vercel project for notifications to work in production.

#### Steps:

1. **Go to Vercel Dashboard**:
   - Visit: https://vercel.com/your-username/decision-jar
   - Or: Click "Settings" in your project

2. **Navigate to Environment Variables**:
   - Settings → Environment Variables

3. **Add the following 3 variables**:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - Value: `BB_JUrEZJKEhReL0bIp1t77GSyXWRgyv-6ZCFBUNBG_me6DaX8H7hJ9TvpHnd7RhSJs4GJciRtYs95kZdFBnXtw`
   - Environments: ☑ Production ☑ Preview ☑ Development

   **Variable 2:**
   - Name: `VAPID_PRIVATE_KEY`
   - Value: `UeGjZKcfXh5-HJEFrRE1y0TdjxseGcUq3b4D6utJhSw`
   - Environments: ☑ Production ☑ Preview ☑ Development
   - ⚠️ **SENSITIVE**: Check "Sensitive" to encrypt this value

   **Variable 3:**
   - Name: `VAPID_SUBJECT`
   - Value: `mailto:graeme@spinthejar.com`
   - Environments: ☑ Production ☑ Preview ☑ Development

4. **Redeploy**:
   - Vercel will prompt you to redeploy
   - Or: Go to Deployments → Click "..." → Redeploy

### 4. Verify It Works

After redeployment:

1. Open your app on mobile
2. Go to Settings → My Preferences
3. Click "Enable Notifications"
4. You should see: **"Notifications enabled! You'll stay updated."** ✅
5. Instead of: ~~"Server Configuration Error"~~ ❌

## How It Works

### Client Side (`hooks/useNotifications.ts`)
1. Checks if browser supports push notifications
2. Requests permission from user
3. Fetches public VAPID key from `/api/notifications/vapid-key`
4. Subscribes to push manager
5. Sends subscription to server at `/api/notifications/subscribe`

### Server Side (`lib/notifications.ts`)
1. Receives subscription from client
2. Stores in database (`PushSubscription` table)
3. Uses VAPID keys to authenticate with push services
4. Sends notifications using `web-push` library

## API Endpoints

- `GET /api/notifications/vapid-key` - Returns public VAPID key
- `POST /api/notifications/subscribe` - Saves user's push subscription
- `POST /api/notifications/unsubscribe` - Removes user's subscription
- `POST /api/notifications/send` - Sends a push notification (internal)

## Database Schema

```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String
  p256dh    String
  auth      String
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, endpoint])
}
```

## Security Notes

- ✅ **Public Key**: Safe to expose (included in client bundle)
- ❌ **Private Key**: NEVER commit to git or expose publicly
- ✅ Both keys are in `.gitignore` via `*.env` pattern
- ✅ Vercel encrypts environment variables

## Troubleshooting

### "Server Configuration Error"
- **Cause**: VAPID keys not set in Vercel
- **Fix**: Follow "Add to Vercel Environment Variables" above

### "Notifications blocked"
- **Cause**: User denied permission or blocked in browser settings
- **Fix**: User must enable in browser settings

### "Service worker not ready"
- **Cause**: Service worker not registered or still loading
- **Fix**: Refresh page and try again

### Notifications not arriving
- **Cause**: Subscription expired or invalid
- **Fix**: Re-enable notifications (auto-cleans expired subscriptions)

## Testing

### Local Development
```bash
# 1. Copy dev.env to .env
cp dev.env .env

# 2. Start dev server
npm run dev

# 3. Open in browser (must be localhost or HTTPS)
# 4. Go to Settings → Enable Notifications
```

### Production
- Notifications only work on **HTTPS** (except localhost)
- Test on your live site: https://spinthejar.com

## References

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
- [web-push npm package](https://www.npmjs.com/package/web-push)
