# PostHog Dashboards for Three-Path Analytics

**Created:** January 16, 2026  
**Purpose:** Track the success of the Three-Path UX consolidation strategy  
**Related:** `PROGRESS_JAN_16_2026.md`, `POSTHOG_SETUP.md`

---

## 📊 Overview

This document provides step-by-step instructions to create PostHog dashboards that measure the effectiveness of the Three-Path consolidation strategy.

### Key Metrics to Track
1. **Path Usage Distribution** - Which of the 3 paths do users prefer?
2. **Time to First Idea** - Did we achieve the <5 second goal?
3. **Conversion Rates** - How many users complete the journey?
4. **Intent Detection Accuracy** - How well does AI understand user needs?
5. **Modal Abandonment** - Where do users drop off?

---

## 🎯 Dashboard 1: Three-Path Performance

### Purpose
Measure which paths users choose and how quickly they add their first idea.

### Insights to Create

#### 1.1 Path Selection Distribution (Pie Chart)

**Query:**
- Event: `path_selected`
- Breakdown by: `path` property
- Time range: Last 30 days

**Visualization:** Pie Chart

**How to Create in PostHog:**
1. Navigate to **Insights** → **New Insight**
2. Select **Trends** insight type
3. Click **+ Add graph series**
4. Event name: `path_selected`
5. Under **Breakdown**, select **Property: path**
6. Change visualization to **Pie Chart**
7. Set time range to **Last 30 days**
8. Save as **"Path Selection Distribution"**

**What to Look For:**
- **Goal:** Path 2 (need inspiration) should be 30-40%
- **Goal:** Path 1 (have idea) should be 40-50%
- **Goal:** Path 3 (browse templates) should be 10-20%

---

#### 1.2 Time to First Idea (Line Chart)

**Query:**
- Event: `time_to_first_idea`
- Aggregation: Average `duration_seconds`
- Time range: Last 30 days
- Breakdown by: `met_5s_goal` (boolean)

**Visualization:** Line Chart

**How to Create in PostHog:**
1. Navigate to **Insights** → **New Insight**
2. Event name: `time_to_first_idea`
3. Under **Aggregation**, select **Average of `duration_seconds`**
4. Add a **Breakdown** by **Property: met_5s_goal**
5. Visualization: **Line Chart**
6. Save as **"Average Time to First Idea"**

**What to Look For:**
- **Goal:** Average duration < 5 seconds
- **Goal:** >70% of users meet the 5-second goal
- **Trend:** Duration should decrease over time as users learn the UI

---

#### 1.3 Conversion Funnel: Path to Idea Added

**Query:**
- Step 1: `path_selected`
- Step 2: `modal_opened`
- Step 3: `idea_added`
- Time range: Last 30 days

**Visualization:** Funnel

**How to Create in PostHog:**
1. Navigate to **Insights** → **New Insight**
2. Select **Funnels** insight type
3. Step 1: Event `path_selected`
4. Step 2: Event `modal_opened`
5. Step 3: Event `idea_added`
6. Set conversion window to **30 minutes**
7. Save as **"Path Selection to Idea Added Funnel"**

**What to Look For:**
- **Goal:** >90% conversion from path selection → modal opened
- **Goal:** >70% conversion from modal opened → idea added
- **Overall Goal:** >60% complete conversion

---

#### 1.4 First Idea Added by Source (Bar Chart)

**Query:**
- Event: `time_to_first_idea`
- Count by: `source` property
- Time range: Last 30 days

**Visualization:** Bar Chart

**How to Create in PostHog:**
1. Navigate to **Insights** → **New Insight**
2. Event name: `time_to_first_idea`
3. Breakdown by: **Property: source**
4. Aggregation: **Total count**
5. Visualization: **Bar Chart**
6. Save as **"First Ideas by Source"**

**What to Look For:**
- Which path leads to the most first ideas?
- Is smart_input being used effectively?

---

## 🤖 Dashboard 2: AI Concierge Intelligence

### Purpose
Measure the accuracy and effectiveness of intent detection and skill selection.

### Insights to Create

#### 2.1 Intent Detection Accuracy (Number)

**Query:**
- Event: `intent_detection_result`
- Filter: `was_accepted = true`
- Aggregation: Percentage
- Time range: Last 30 days

**Visualization:** Number

**How to Create in PostHog:**
1. Navigate to **Insights** → **New Insight**
2. Event name: `intent_detection_result`
3. Add filter: **Property: was_accepted** equals **true**
4. Create a **Formula**: `(A / B) * 100`
   - A = Count where `was_accepted = true`
   - B = Total count of `intent_detection_result`
5. Format as **Percentage**
6. Save as **"Intent Detection Accuracy %"**

**What to Look For:**
- **Goal:** >80% accuracy
- **Trend:** Accuracy should improve as detection logic is refined

---

#### 2.2 Most Popular Concierge Skills (Bar Chart)

**Query:**
- Event: `concierge_skill_selected`
- Breakdown by: `skill_id`
- Top 10
- Time range: Last 30 days

**Visualization:** Bar Chart (horizontal)

**How to Create in PostHog:**
1. Navigate to **Insights** → **New Insight**
2. Event name: `concierge_skill_selected`
3. Breakdown by: **Property: skill_id**
4. Sort by **Count (descending)**
5. Limit to **Top 10**
6. Visualization: **Horizontal Bar**
7. Save as **"Top 10 Concierge Skills"**

**What to Look For:**
- Which skills are most used?
- Are users discovering all 17 tools?
- Should popular tools be promoted more?

---

#### 2.3 Skill Selection Method Split (Pie Chart)

**Query:**
- Event: `concierge_skill_selected`
- Breakdown by: `selection_method`
- Values: `picker` vs `intent_detection`
- Time range: Last 30 days

**Visualization:** Pie Chart

**How to Create in PostHog:**
1. Navigate to **Insights** → **New Insight**
2. Event name: `concierge_skill_selected`
3. Breakdown by: **Property: selection_method**
4. Visualization: **Pie Chart**
5. Save as **"Skill Selection Method"**

**What to Look For:**
- **Goal:** 40-60% via intent detection (shows AI is useful)
- If <20% intent detection: Users don't trust AI or it's not accurate
- If >80% intent detection: Skill picker might not be discoverable

---

#### 2.4 Intent Correction Rate (Number)

**Query:**
- Event: `concierge_skill_selected`
- Filter: `was_corrected = true`
- Calculate: (Corrected / Total intent detections) * 100
- Time range: Last 30 days

**Visualization:** Number

**How to Create in PostHog:**
1. Navigate to **Insights** → **New Insight**
2. Event name: `concierge_skill_selected`
3. Add filter: **Property: was_corrected** equals **true**
4. Create Formula: `(A / B) * 100`
   - A = Count where `was_corrected = true`
   - B = Count where `selection_method = intent_detection`
5. Format as **Percentage**
6. Save as **"Intent Correction Rate %"**

**What to Look For:**
- **Goal:** <20% correction rate
- High correction rate (>30%) means intent detection needs improvement

---

## 📉 Dashboard 3: Engagement & Drop-off

### Purpose
Identify where users abandon the flow and why.

### Insights to Create

#### 3.1 Modal Abandonment Rate (Number)

**Query:**
- Event: `modal_abandoned`
- Aggregation: Count
- Compare to: `modal_opened` count
- Formula: (Abandoned / Opened) * 100
- Time range: Last 30 days

**Visualization:** Number

**How to Create in PostHog:**
1. Navigate to **Insights** → **New Insight**
2. Add **Series A**: Event `modal_abandoned`
3. Add **Series B**: Event `modal_opened`
4. Create **Formula**: `(A / B) * 100`
5. Format as **Percentage**
6. Save as **"Overall Modal Abandonment Rate"**

**What to Look For:**
- **Goal:** <10% abandonment rate
- High abandonment (>20%) indicates UX issues or unclear CTAs

---

#### 3.2 Modal Abandonment by Type (Bar Chart)

**Query:**
- Event: `modal_abandoned`
- Breakdown by: `modal_type`
- Time range: Last 30 days

**Visualization:** Bar Chart

**How to Create in PostHog:**
1. Navigate to **Insights** → **New Insight**
2. Event name: `modal_abandoned`
3. Breakdown by: **Property: modal_type**
4. Sort by **Count (descending)**
5. Visualization: **Bar Chart**
6. Save as **"Modal Abandonment by Type"**

**What to Look For:**
- Which modals have the highest abandonment?
- Focus UX improvements on problematic modals

---

#### 3.3 Average Time in Modal Before Abandoning (Number)

**Query:**
- Event: `modal_abandoned`
- Aggregation: Average of `time_open_seconds`
- Time range: Last 30 days

**Visualization:** Number with trend

**How to Create in PostHog:**
1. Navigate to **Insights** → **New Insight**
2. Event name: `modal_abandoned`
3. Aggregation: **Average of `time_open_seconds`**
4. Show **Trend** (previous period comparison)
5. Save as **"Average Time Before Abandoning"**

**What to Look For:**
- **< 5 seconds:** Users confused immediately
- **5-30 seconds:** Users exploring but not finding what they need
- **> 30 seconds:** Users engaged but hitting a blocker

---

#### 3.4 Daily Active Users Trend (Line Chart)

**Query:**
- Event: Any event (or `$pageview`)
- Aggregation: Unique users per day
- Time range: Last 90 days

**Visualization:** Line Chart

**How to Create in PostHog:**
1. Navigate to **Insights** → **New Insight**
2. Event name: **All Events** or `$pageview`
3. Aggregation: **Unique users**
4. Interval: **Day**
5. Time range: **Last 90 days**
6. Visualization: **Line Chart**
7. Save as **"Daily Active Users"**

**What to Look For:**
- Overall growth trend
- Impact of Three-Path launch (before/after)

---

## 🎨 Creating Dashboards

### Dashboard 1: Three-Path Overview

1. Go to **Dashboards** → **New Dashboard**
2. Name: **"Three-Path UX Performance"**
3. Add insights:
   - Path Selection Distribution
   - Time to First Idea
   - Path to Idea Added Funnel
   - First Ideas by Source

### Dashboard 2: AI Intelligence

1. Go to **Dashboards** → **New Dashboard**
2. Name: **"AI Concierge Intelligence"**
3. Add insights:
   - Intent Detection Accuracy %
   - Top 10 Concierge Skills
   - Skill Selection Method
   - Intent Correction Rate %

### Dashboard 3: Engagement Metrics

1. Go to **Dashboards** → **New Dashboard**
2. Name: **"User Engagement & Drop-off"**
3. Add insights:
   - Overall Modal Abandonment Rate
   - Modal Abandonment by Type
   - Average Time Before Abandoning
   - Daily Active Users

---

## 🔔 Setting Up Alerts

### Critical Alerts to Configure

1. **Time to First Idea Spikes**
   - Metric: `time_to_first_idea` average > 10 seconds
   - Frequency: Check hourly
   - Action: Investigate UX issues

2. **Modal Abandonment Spike**
   - Metric: `modal_abandoned` rate > 20%
   - Frequency: Check daily
   - Action: Check for bugs or UX problems

3. **Intent Detection Accuracy Drop**
   - Metric: `intent_detection_result` accuracy < 70%
   - Frequency: Check daily
   - Action: Review and improve detection logic

4. **Low Path 2 Usage**
   - Metric: `path_selected` where `path = 2_need_inspiration` < 20%
   - Frequency: Check weekly
   - Action: Increase visibility of AI Concierge

**How to Set Up Alerts in PostHog:**
1. Go to **Alerts** → **New Alert**
2. Select the insight to monitor
3. Set threshold conditions
4. Choose notification method (email, Slack, webhook)
5. Set check frequency

---

## 📈 Success Criteria

### Week 1 Baseline (Jan 16-23, 2026)
- Collect data without optimization
- Establish baseline metrics
- Identify problem areas

### Month 1 Goals (End of February 2026)
- ✅ Average time to first idea < 5 seconds
- ✅ Path 2 usage between 30-40%
- ✅ Intent detection accuracy > 80%
- ✅ Modal abandonment < 10%
- ✅ 90% conversion from path selection to modal opened

### Month 3 Goals (End of April 2026)
- ✅ Average time to first idea < 3 seconds
- ✅ Intent detection accuracy > 90%
- ✅ Modal abandonment < 5%
- ✅ All 17 concierge skills used at least weekly

---

## 🔄 Regular Review Schedule

### Weekly Review (Every Monday)
- Review Daily Active Users trend
- Check Time to First Idea average
- Identify any alert triggers

### Monthly Review (First Monday of Month)
- Comprehensive dashboard review
- Compare to goals
- Document insights in `PROGRESS_[DATE].md`
- Plan optimizations based on data

### Quarterly Review (Jan, Apr, Jul, Oct)
- Analyze long-term trends
- Update success criteria
- Plan major feature updates

---

## 📝 Example Insights to Look For

### Positive Signals ✅
- Time to first idea decreasing over time
- Path 2 usage increasing (users trusting AI more)
- Intent detection accuracy >85%
- High skill diversity (all tools being used)
- Low abandonment rates across all modals

### Warning Signs ⚠️
- Increasing time to first idea (UX regression?)
- Path 2 usage <20% (AI not trusted or discoverable?)
- Intent detection accuracy <70% (needs improvement)
- High abandonment on specific modals (identify and fix)
- One skill dominating usage (others not discoverable?)

---

## 🛠️ Troubleshooting

### "Events not showing up"
- Check browser console for errors
- Verify PostHog is initialized: Look for "PostHog loaded" in console
- Check network tab for `/e/` requests (PostHog event endpoint)
- Ensure `NEXT_PUBLIC_POSTHOG_KEY` is set in environment

### "Data looks wrong"
- Check event properties match documentation
- Use **Live Events** in PostHog to see raw data
- Verify session storage is working (check DevTools → Application → Session Storage)

### "Can't create insight"
- Ensure event has been captured at least once
- Check property names match exactly (case-sensitive)
- Try using **Live Events** to verify event structure

---

## 📚 Related Documentation

- **Setup Guide:** `POSTHOG_SETUP.md`
- **Progress Report:** `PROGRESS_JAN_16_2026.md`
- **Roadmap:** `ROADMAP.md`
- **TODO List:** `TODO.md`

---

## ✅ Quick Start Checklist

- [ ] Verify PostHog is collecting events (check **Live Events**)
- [ ] Create Dashboard 1 (Three-Path Overview)
- [ ] Create Dashboard 2 (AI Intelligence)
- [ ] Create Dashboard 3 (Engagement)
- [ ] Set up critical alerts
- [ ] Schedule weekly review meeting
- [ ] Document baseline metrics
- [ ] Share dashboards with team

---

**Document Version:** 1.0  
**Last Updated:** January 16, 2026  
**Next Review:** January 23, 2026  
**Owner:** Product/Analytics Team
