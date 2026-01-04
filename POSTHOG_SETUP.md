# PostHog Analytics Setup Guide

## Quick Setup (5 minutes)

### Step 1: Install PostHog
```bash
npm install posthog-js
```

### Step 2: Create PostHog Account
1. Go to [https://posthog.com/signup](https://posthog.com/signup)
2. Create a free account
3. Create a new project

### Step 3: Get Your API Key
1. Go to Settings → Project → API Keys
2. Copy your **Project API Key**
3. Copy your **Host** (usually `https://app.posthog.com`)

### Step 4: Add to Environment Variables
Create or update `.env.local`:
```bash
NEXT_PUBLIC_POSTHOG_KEY="phc_your_key_here"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

**Important:** Also add to Vercel environment variables for production!

### Step 5: Deploy & Verify
1. Restart your dev server: `npm run dev`
2. Check browser console for "PostHog loaded"
3. Visit your PostHog dashboard to see events

---

## What's Being Tracked

### ✅ Automatic Events
- **Page views** - Every page navigation
- **Page leave** - When users leave pages

### ✅ Custom Events We Track

#### Template Events
- `template_browser_opened` - User opens template browser
- `template_used` - User creates jar from template or adds to current
  - Properties: `template_id`, `template_name`, `method`

#### Share Events
- `share_clicked` - User clicks share button
  - Properties: `source` (e.g., 'dining_concierge'), `content_type` (e.g., 'restaurant')

#### AI Tool Events
- `ai_tool_used` - User uses any AI concierge
  - Properties: `tool_name`, preferences
- `ai_recommendation_received` - AI returns recommendations
  - Properties: `tool_name`, `recommendation`

#### Jar Events
- `jar_created` - New jar created
  - Properties: `source` ('template', 'manual', 'empty'), `template_id`
- `idea_added` - Idea added to jar
  - Properties: `method` ('manual', 'ai', 'template'), `source`
- `jar_spun` - User spins the jar
  - Properties: `idea_count`, `has_filters`

#### User Events
- `signup_completed` - User signs up
  - Properties: `method`, `utm_source`, `utm_medium`, `utm_campaign`
- `login_completed` - User logs in
  - Properties: `method`

---

## Key Questions This Answers

1. **Which templates are most popular?**
   - Filter: `template_used` event
   - Group by: `template_name`

2. **Do shares convert to signups?**
   - Funnel: `share_clicked` → page view (w/ UTM) → `signup_completed`

3. **Which AI tools drive engagement?**
   - Compare: `ai_tool_used` counts by `tool_name`

4. **Where do users come from?**
   - `signup_completed` events
   - Group by: `utm_source`, `utm_medium`

5. **Do templates or manual jars perform better?**
   - Compare: `jar_created` by `source`
   - Retention rates for each

---

## Viewing Your Data

### PostHog Dashboard
1. Go to [https://app.posthog.com](https://app.posthog.com)
2. Navigate to **Events** to see live feed
3. Use **Insights** to create charts
4. Build **Funnels** for conversion analysis

### Recommended Insights to Create

**1. Template Popularity**
- Event: `template_used`
- Breakdown by: `template_name`
- Chart type: Bar

**2. Share Conversion Funnel**
- Steps:
  1. `share_clicked`
  2. Page view (with `utm_campaign=ai_concierge`)
  3. `signup_completed`

**3. AI Tool Usage**
- Event: `ai_tool_used`
- Breakdown by: `tool_name`
- Chart type: Pie

**4. Daily Active Users**
- Event: Any event
- Unique users per day
- Chart type: Line

---

## Production Deployment

### Vercel Environment Variables
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_POSTHOG_KEY` = your key
   - `NEXT_PUBLIC_POSTHOG_HOST` = https://app.posthog.com
3. Redeploy

### Testing in Production
1. Visit your production site
2. Perform an action (browse templates, share, etc.)
3. Check PostHog dashboard (updates in ~30 seconds)

---

## Privacy & GDPR

PostHog is GDPR-compliant and privacy-friendly:
- **Self-hostable** (optional)
- **No PII required** (we track events, not personal data)
- **User control** (users can opt-out)

### Optional: Add Privacy Controls
If users should opt-in to analytics:
```typescript
// In components/PostHogProvider.tsx
if (userConsent) {
  initPostHog()
}
```

---

## Troubleshooting

### Events not showing?
1. Check `.env.local` has correct keys
2. Restart dev server
3. Check browser console for errors
4. Verify API key is valid in PostHog dashboard

### TypeScript errors?
The lint errors will go away once you run `npm install posthog-js`

### Events showing in dev but not production?
- Verify Vercel environment variables are set
- Check production browser console for errors
- Ensure API key is for the correct project

---

## Next Steps

Once analytics is working:

1. **Create Dashboards** in PostHog for key metrics
2. **Set up Alerts** for important events (e.g., signup spikes)
3. **A/B Test** templates to see which convert best
4. **Optimize** based on data (which AI tools to promote, etc.)

**Your data-driven growth journey starts now!** 🚀
