# End-to-End Testing Checklist

## 🎯 Goal
Systematically test the entire user journey to catch bugs before real users encounter them.

---

## 🧪 Testing Environments

Test on:
- [ ] **Desktop** (Chrome, Firefox, or Safari)
- [ ] **Mobile** (Real device or Chrome DevTools mobile mode)
- [ ] **Incognito/Private mode** (for clean signup tests)

---

## 📋 Test Scenarios

---

## **Scenario 1: New User - First Time Experience**

### **1.1 Homepage Visit**
- [ ] Visit `https://spinthejar.com`
- [ ] Hero section loads correctly
- [ ] Jar animation appears
- [ ] "Get Started Free" button visible
- [ ] Mobile: Jar is compact, not too much whitespace ✅
- [ ] **PostHog Check:** Event `$pageview` with path `/`

### **1.2 Demo Experience**
- [ ] Click "Try Demo" (if available)
- [ ] Demo jar loads with sample ideas
- [ ] Click "Spin the Jar"
- [ ] Random idea appears
- [ ] Can spin multiple times
- [ ] **PostHog Check:** Event `demo_jar_spun`

### **1.3 Signup Flow**
- [ ] Click "Get Started Free" or "Sign Up"
- [ ] Signup form loads
- [ ] Enter test details:
  - Name: Test User
  - Email: `test+[timestamp]@example.com`
  - Password: `TestPass123!`
- [ ] Submit form
- [ ] **PostHog Check:** Event `signup_completed` (Wait 3 seconds)
- [ ] Redirect to dashboard or verification page
- [ ] If email verification required, check inbox

**Expected Result:** Account created, redirected to dashboard

---

## **Scenario 2: Empty Jar - Template Onboarding**

### **2.1 First Login**
- [ ] See "Your Journey Starts Here!" message
- [ ] Beautiful gradient icon appears
- [ ] Two buttons visible:
  - "Browse Templates" (primary)
  - "Add Custom Idea" (secondary)

### **2.2 Browse Templates**
- [ ] Click "Browse Templates"
- [ ] Template browser modal opens
- [ ] Templates load (Date Night Ideas, etc.)
- [ ] Can preview template ideas
- [ ] **PostHog Check:** Event `template_browser_opened`

### **2.3 Use Template**
- [ ] Select "Date Night Ideas for Couples" template
- [ ] Click "Create New Jar" or "Add to Current"
- [ ] Modal closes
- [ ] Jar page refreshes
- [ ] Ideas appear in the jar
- [ ] **PostHog Check:** Event `template_used`

**Expected Result:** Jar is now filled with 10-20 ideas from template

---

## **Scenario 3: Jar Management**

### **3.1 View Ideas**
- [ ] Go to "In the Jar" page
- [ ] All template ideas visible
- [ ] Idea cards show:
  - Category icon
  - Title/description
  - Duration, cost, indoor/outdoor
- [ ] Ideas are clickable

### **3.2 Add Custom Idea**
- [ ] Click "Add Idea" (+ button)
- [ ] Modal opens
- [ ] Fill in:
  - Description: "Test Idea"
  - Category: Activity
  - Duration: 2 hours
  - Cost: $
  - Indoor
- [ ] Submit
- [ ] New idea appears in jar
- [ ] **PostHog Check:** Event `idea_added` (if tracked)

### **3.3 Edit Idea**
- [ ] Click on an idea card
- [ ] Edit modal opens with prefilled data
- [ ] Change description
- [ ] Save
- [ ] Changes persist

### **3.4 Delete Idea**
- [ ] Hover over an idea
- [ ] Click trash icon (should appear on hover)
- [ ] Confirmation modal appears
- [ ] Confirm deletion
- [ ] Idea removed from jar

**Expected Result:** Full CRUD operations work

---

## **Scenario 4: Spin the Jar**

### **4.1 Random Spin**
- [ ] Go to Dashboard
- [ ] See jar visualization
- [ ] Click "Spin the Jar" button
- [ ] Animation plays
- [ ] Random idea revealed
- [ ] Idea details shown
- [ ] **PostHog Check:** Event `jar_spun`

### **4.2 Spin with Filters**
- [ ] Open filter panel (if available)
- [ ] Select filters:
  - Duration: 2-3 hours
  - Cost: $$
  - Time: Evening
- [ ] Click "Spin"
- [ ] Result matches filter criteria

### **4.3 Spin Result Actions**
- [ ] "Go Tonight" button visible (if PLANNED_DATE)
- [ ] Click "Go Tonight"
- [ ] Idea marked as selected
- [ ] Appears in Memories

**Expected Result:** Spinning works, filters apply, results are saved

---

## **Scenario 5: AI Concierge Tools**

### **5.1 Dining Concierge**
- [ ] Open Dining Concierge modal
- [ ] Select preferences:
  - Cuisine: Italian
  - Vibe: Romantic
  - Price: $$
- [ ] Enter location or use current
- [ ] Click "Find Restaurants"
- [ ] Results load (3 restaurants)
- [ ] Each result shows:
  - Name, description
  - Google rating
  - "Add to Jar" button
  - "Share" button
- [ ] **PostHog Check:** Event `ai_tool_used` with `tool_name: dining_concierge`

### **5.2 Share Restaurant**
- [ ] Click "Share" on a recommendation
- [ ] Share modal opens (or native share on mobile)
- [ ] Can copy link or share to WhatsApp
- [ ] **PostHog Check:** Event `share_clicked`

### **5.3 Add to Jar**
- [ ] Click "Add to Jar"
- [ ] Idea added successfully
- [ ] Confirmation message appears
- [ ] Can find idea in jar

### **5.4 Bar Concierge**
- [ ] Open Bar Concierge
- [ ] Select drinks & vibes
- [ ] Get recommendations
- [ ] **PostHog Check:** Event `ai_tool_used` with `tool_name: bar_concierge`

### **5.5 Movie Concierge**
- [ ] Open Movie Scout
- [ ] Select genre, platform, decade
- [ ] Get movie suggestions
- [ ] **PostHog Check:** Event `ai_tool_used` with `tool_name: movie_concierge`

### **5.6 Weekend Planner**
- [ ] Open Weekend Planner
- [ ] Enter location
- [ ] Generate 5-activity plan
- [ ] Can add individual activities to jar
- [ ] **PostHog Check:** Event `ai_tool_used` with `tool_name: weekend_planner`

**Expected Result:** All AI tools work, track analytics, produce quality results

---

## **Scenario 6: Social Sharing**

### **6.1 OpenGraph Preview**
- [ ] Copy homepage URL
- [ ] Paste into:
  - WhatsApp (if available)
  - Twitter/X
  - Facebook
- [ ] Beautiful preview appears with:
  - Pink/purple gradient image
  - "Never Waste 30 Minutes..."
  - App logo

### **6.2 Test with OpenGraph Debugger**
- [ ] Go to https://www.opengraph.xyz/
- [ ] Enter: `https://spinthejar.com`
- [ ] Preview shows correct image
- [ ] Title and description correct

**Expected Result:** Social sharing looks professional

---

## **Scenario 7: Mobile Responsiveness**

### **7.1 Mobile Homepage**
- [ ] Responsive navigation
- [ ] Hero section compact
- [ ] CTA buttons accessible
- [ ] No horizontal scroll

### **7.2 Mobile Dashboard**
- [ ] Bottom navigation visible
- [ ] Jar visualization works
- [ ] Touch interactions smooth
- [ ] Modals fit screen

### **7.3 Mobile AI Tools**
- [ ] Modals are fullscreen
- [ ] Inputs easy to use
- [ ] Results readable
- [ ] Share button works

**Expected Result:** App works perfectly on mobile

---

## **Scenario 8: Analytics Verification**

### **8.1 Check PostHog Events**
- [ ] Go to PostHog dashboard
- [ ] Click "Events" tab
- [ ] Filter by your test user email
- [ ] Verify these events exist:
  - [ ] `signup_completed`
  - [ ] `template_browser_opened`
  - [ ] `template_used`
  - [ ] `ai_tool_used` (multiple tools)
  - [ ] `share_clicked`
  - [ ] `jar_spun`
  - [ ] `$pageview` (multiple)
  - [ ] `web_vitals_*` (performance)

### **8.2 Check User Identification**
- [ ] Go to PostHog "Persons"
- [ ] Search for your test email
- [ ] User profile shows:
  - Email address ✅
  - Name ✅
  - Signup method ✅
  - All events ✅

**Expected Result:** All events tracked, user identified

---

## **Scenario 9: Performance & UX**

### **9.1 Page Load Speed**
- [ ] Homepage loads in < 2 seconds
- [ ] Dashboard loads in < 3 seconds
- [ ] AI tools respond in < 5 seconds

### **9.2 Error Handling**
- [ ] Try invalid signup email → Error shown
- [ ] Try AI tool with no location → Prompts for location
- [ ] Try to delete non-existent idea → Graceful error

### **9.3 Console Errors**
- [ ] Open DevTools Console
- [ ] Browse the app
- [ ] No red errors (warnings are OK)
- [ ] No 404s for images/assets

**Expected Result:** Fast, smooth, error-free experience

---

## **Scenario 10: Edge Cases**

### **10.1 Empty States**
- [ ] Delete all ideas from jar
- [ ] See "Your Journey Starts Here" again
- [ ] Templates still available

### **10.2 Long Content**
- [ ] Add idea with very long description
- [ ] Text truncates properly
- [ ] No layout breaking

### **10.3 Network Issues**
- [ ] Throttle network in DevTools
- [ ] AI tools show loading states
- [ ] Timeouts handled gracefully

**Expected Result:** App handles edge cases well

---

## 🐛 **Bug Tracking Template**

When you find a bug, note:

```
**Bug:** [Short description]
**Steps to Reproduce:**
1. Go to...
2. Click...
3. See error

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Browser:** Chrome 120, Windows
**Priority:** High/Medium/Low
**Screenshot:** [If applicable]
```

---

## ✅ **Success Criteria**

Your app passes if:
- [ ] All critical flows work (signup, templates, spin, AI tools)
- [ ] Analytics tracking verified in PostHog
- [ ] Mobile experience smooth
- [ ] No blocking bugs
- [ ] Social sharing looks good
- [ ] Performance is acceptable

---

## 🎯 **Post-Testing Actions**

After testing:

1. **Fix Critical Bugs** - Anything blocking core flows
2. **Document Known Issues** - Non-critical items for later
3. **Celebrate** 🎉 - Your app works!
4. **Deploy Final** - Push any bug fixes
5. **Monitor PostHog** - Watch real user behavior

---

## 📊 **Testing Checklist Summary**

✅ **Completed:** 0/10 scenarios
- [ ] New user experience
- [ ] Template onboarding
- [ ] Jar management
- [ ] Spin the jar
- [ ] AI concierge tools
- [ ] Social sharing
- [ ] Mobile responsive
- [ ] Analytics tracking
- [ ] Performance
- [ ] Edge cases

**Let's systematically test your app!** 🚀

Start with Scenario 1 and work your way through. Good luck! 💪
