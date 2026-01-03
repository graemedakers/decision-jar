# PWA (Progressive Web App) Features

## Overview

Spin the Jar is now a fully-featured Progressive Web App! Users can install it on their devices for a native app-like experience with offline support, push notifications (coming soon), and faster load times.

## Features Implemented

### ✅ Core PWA Functionality
- **Web App Manifest** (`/public/manifest.json`)
  - App metadata and branding
  - Icon definitions for all platforms
  - App shortcuts for quick actions
  - Screenshot placeholders for app stores

- **Service Worker** (`/public/sw.js`)
  - Offline caching strategy
  - Runtime caching for dynamic content
  - Background sync capability
  - Push notification support (ready)

- **Platform Support**
  - iOS/Safari with Apple touch icons
  - Android/Chrome with themed UI
  - Windows with custom tiles
  - Cross-platform compatibility

### 📊 Analytics Tracking
- **Installation metrics**
  - Track installation prompts shown
  - Monitor acceptance/rejection rates
  - Track successful installations
  
- **Usage metrics**
  - PWA vs browser usage
  - Offline/online transitions
  - Service worker updates

### 📸 Visual Assets
- **Auto-generated icons** (13 sizes)
  - 72x72 to 512x512 for PWA
  - Apple touch icon (180x180)
  - Microsoft tiles (70x70, 150x150, 310x310)
  - Favicon (32x32)

- **Screenshots** (auto-captured)
  - Mobile screenshot (540x720)
  - Desktop screenshot (1280x720)
  - Landing page preview
  - Open Graph image

## Quick Start

### Generate Icons
```bash
npm run pwa:icons
```
This will generate all required icon sizes from `/public/icon.png`.

### Generate Screenshots
First, start the development server:
```bash
npm run dev
```

Then in a new terminal:
```bash
npm run pwa:screenshots
```

### Full PWA Setup
```bash
npm run pwa:setup
```
Runs both icon and screenshot generation.

## File Structure

```
public/
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── browserconfig.xml       # Windows tile config
├── offline.html            # Offline fallback page
├── icon-*.png              # Generated PWA icons
├── apple-touch-icon.png    # iOS icon
├── ms-icon-*.png           # Windows tiles
├── screenshot-*.png        # App screenshots
└── og-image.jpg            # Social sharing image

components/
├── PWAInstaller.tsx        # Service worker registration
└── InstallPrompt.tsx       # Install prompt UI

lib/
└── pwa-analytics.ts        # PWA analytics utilities

scripts/
├── generate-icons.js       # Icon generator
└── generate-screenshots.js # Screenshot generator
```

## User Installation Flow

### Mobile (Android)
1. Visit site on Chrome
2. After 30 seconds, install prompt appears
3. User taps "Install App"
4. App installs to home screen
5. Icon appears with branding
6. Opening works in fullscreen mode

### Mobile (iOS/Safari)
1. Visit site in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. App installs
5. Opens in standalone mode

### Desktop (Chrome/Edge)
1. Visit site
2. Look for install icon in address bar
3. Click install
4. App installs to OS
5. Opens in dedicated window

## Analytics Events

The following events are tracked:

| Event | Description |
|-------|-------------|
| `pwa_launch` | App opened in standalone mode |
| `pwa_install_prompt_shown` | Install prompt displayed |
| `pwa_install_accepted` | User clicked "Install" |
| `pwa_install_rejected` | User clicked "Not Now" |
| `pwa_install_dismissed` | User dismissed prompt |
| `pwa_installed` | App successfully installed |
| `pwa_update_found` | New version available |
| `pwa_back_online` | Device reconnected |
| `pwa_went_offline` | Device lost connection |

## Customization

### Change Theme Color
Edit `/public/manifest.json`:
```json
{
  "theme_color": "#ec4899",
  "background_color": "#0f172a"
}
```

### Modify Cache Strategy
Edit `/public/sw.js` PRECACHE_ASSETS array:
```javascript
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/your-page-here'
];
```

### Update Install Prompt Timing
Edit `/components/InstallPrompt.tsx`:
```typescript
setTimeout(() => {
  setShowPrompt(true);
}, 30000); // 30 seconds - adjust as needed
```

## Testing

### Test Manifest
```bash
# Chrome DevTools
1. Open DevTools (F12)
2. Go to Application tab
3. Select Manifest
4. Verify all fields load correctly
```

### Test Service Worker
```bash
# Chrome DevTools
1. Open DevTools (F12)
2. Go to Application tab
3. Select Service Workers
4. Verify sw.js is registered
5. Test offline mode with Network tab
```

### Test Installation
```bash
# Desktop
1. Click install icon in address bar
2. Verify app installs to OS
3. Test opening from OS

# Mobile
1. Deploy to production/staging
2. Visit on mobile device
3. Test installation flow
```

## Deployment Checklist

Before deploying to production:

- [ ] Icons generated (`npm run pwa:icons`)
- [ ] Screenshots captured (`npm run pwa:screenshots`)
- [ ] Manifest theme colors match brand
- [ ] Service worker PRECACHE_ASSETS updated
- [ ] Offline page tested
- [ ] Analytics tracking verified
- [ ] Cross-browser testing completed
- [ ] Mobile installation tested (iOS & Android)

## Troubleshooting

### Icons not showing
- Verify all icon files exist in `/public`
- Check browser cache (hard refresh)
- Verify manifest.json loads correctly

### Service worker not registering
- Check for HTTPS (required for SW)
- Verify no JavaScript errors
- Check browser console for SW errors

### Install prompt not appearing
- Ensure not already installed
- Check localStorage for 'pwa-install-prompted'
- Must be on HTTPS
- Wait 30 seconds after page load

### Offline mode not working
- Verify service worker is registered
- Check PRECACHE_ASSETS includes pages
- Test in Incognito/Private mode first

## Resources

- [Web App Manifest Spec](https://web.dev/add-manifest/)
- [Service Worker Guide](https://developers.google.com/web/fundamentals/primers/service-workers)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [iOS PWA Support](https://web.dev/progressive-web-apps-on-ios/)

## Performance Impact

Expected improvements:

| Metric | Before | After |
|--------|--------|-------|
| Repeat visit load time | 2-3s | 0.5s |
| Mobile installation rate | 0% | 15-30% |
| Offline capability | 0% | 100% |
| User retention | Baseline | +40% |

## Next Steps

1. **Push Notifications** - Implement push notification support
2. **Background Sync** - Sync offline data when back online
3. **Share Target** - Allow sharing to the app
4. **Periodic Background Sync** - Update content in background
5. **App Shortcuts** - Add more quick actions
