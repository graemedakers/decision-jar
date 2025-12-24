# Mobile App Strategy Guide for Date Jar

To turn your "Date Jar" Next.js web application into a mobile app for iOS and Android while keeping a single, easy-to-maintain codebase, we recommend two parallel strategies:

1.  **Progressive Web App (PWA):** The "Zero Effort" immediate solution.
2.  **Capacitor:** The "Native App Store" solution using your existing code.

---

## Strategy 1: Progressive Web App (PWA)
**Effort:** Low | **Maintenance:** Zero (Same as web)
**Result:** Installable app icon, offline support (optional), fullscreen experience.

Your app already has a `manifest.ts` file, which is the first step. To fully enable PWA capabilities:

1.  **Enhance Manifest:** Add high-res icons (512x512) and screenshots to `app/manifest.ts`.
2.  **Service Workers:** Use a library like `next-pwa` to cache assets for offline speed.
3.  **Installation:** Users simply visit your site on Safari (iOS) or Chrome (Android) and tap "Add to Home Screen". It will look and feel like an app.

---

## Strategy 2: Capacitor (Recommended for App Stores)
**Effort:** Medium | **Maintenance:** Low (Single Codebase)
**Result:** Real `.ipa` (iOS) and `.apk` (Android) files for the App Store and Google Play.

[Capacitor](https://capacitorjs.com/) by Ionic is a tool that wraps your web app in a native container. It allows you to access native features (Haptics, Push Notifications, Camera) using JavaScript.

### How it works with Next.js
Since your app uses **Server-Side APIs** (`/api/...`) and Database connections, these **cannot** run on the phone itself.
*   **The Mobile App** will allow the UI to run on the phone.
*   **The Backend** must remain hosted (e.g., on Vercel).
*   The App will make HTTP requests to your live API URL (e.g., `https://date-jar.vercel.app/api/...`).

### Implementation Steps

#### 1. Setup Capacitor in your project
Run these commands in your project root:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init
# Name: Date Jar
# Package ID: com.datejar.app
```

#### 2. Configure Build Settings
You have two options for the mobile build:

**Option A: Static Export (Recommended for Performance)**
The UI files are bundled *inside* the app. This is faster but requires your Next.js app to be "static exportable" (no `getServerSideProps`).
1.  Update `next.config.ts` to include `output: 'export'`.
2.  Update your code to fetch data from your *absolute* production URL (e.g., `fetch('https://your-site.com/api/ideas')`) instead of relative paths (`fetch('/api/ideas')`).

**Option B: Web Wrapper (Easier)**
The app simply loads your live website url.
1.  - Open `capacitor.config.ts` and set the `server.url` to `https://spinthejar.com`.
2.  *Risk:* Apple sometimes rejects apps that are "just websites" unless you add native features (like haptics or push notifications).

#### 3. Build & Sync
```bash
# Build your next.js app
npm run build

# Sync assets to native projects
npx cap add android
npx cap add ios
npx cap sync
```

#### 4. Compile Native App
*   **Android:** `npx cap open android` (Opens Android Studio)
*   **iOS:** 
 (Opens Xcode - Mac only)

From there, you hit "Run" or "Archive" to create your app store binaries.

### Maintenance Workflow
1.  **Develop:** Write code in your normal Next.js flow.
2.  **Web Deploy:** Push to Main -> Vercel updates the website.
3.  **Mobile Update:**
    *   If using **Option B (Wrapper)**: You rarely need to update the app store version! The app just loads the new site content automatically.
    *   If using **Option A (Static)**: You run `npm run build && npx cap sync`, then upload a new binary to the App Stores.

---

## Summary Recommendation

**Start with Capacitor Option B (Wrapper).**
It allows you to get into the App Stores with minimal code changes. You maintain **one** codebase. Any changes you push to Vercel instantly update the content inside the mobile app without users needing to update via the App Store.

**To add "App-like" feel:**
1.  Install `@capacitor/haptics`.
2.  Add haptic feedback to your "Spin" button (`Haptics.impact({ style: ImpactStyle.Heavy })`).
3.  This small touch satisfies App Store requirements for "native functionality".

---

## Troubleshooting

### "Unable to launch Android Studio"
If you see an error saying `Unable to launch Android Studio. Is it installed?`, it means Capacitor cannot find the Android Studio application on your computer.

1.  **Install Android Studio:** ensure you have downloaded and installed it from [developer.android.com/studio](https://developer.android.com/studio).
2.  **Open Manually:** You don't *have* to use the CLI command. You can simply:
    - Open **Android Studio** manually.
    - Click **File > Open**.
    - Navigate to your project folder and select the `android` directory (e.g., `c:\Users\graem\.gemini\antigravity\scratch\date-jar\android`).
3.  **Environment Variable:** If it is installed but not found, set the `CAPACITOR_ANDROID_STUDIO_PATH` environment variable to point to your executable.
