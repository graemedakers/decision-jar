# Customer Journeys - Quick Reference
**Decision Jar Application**  
**Visual Summary & Key Touchpoints**

---

## 📊 Signup Methods Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SIGNUP ENTRY POINTS                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. DIRECT SIGNUP                   Conversion: 70%        │
│     Landing → /signup               Time: 2-3 min          │
│     ├─ Email + Password                                    │
│     ├─ Optional: Location, Topic                           │
│     └─ Creates: User + Personal Jar                        │
│                                                             │
│  2. SOCIAL LOGIN (OAuth)            Conversion: 80%        │
│     Landing → Google/FB             Time: 30 sec           │
│     ├─ Auto-verified email                                 │
│     ├─ No password needed                                  │
│     └─ Creates: User only (jar prompt later)               │
│                                                             │
│  3. INVITE LINK                     Conversion: 40%        │
│     /signup?code=ABC123             Time: 2 min            │
│     ├─ Email + Password                                    │
│     ├─ Validates invite code first                         │
│     └─ Creates: User + Joins existing jar                  │
│                                                             │
│  4. DEMO MODE                       Conversion: 25%        │
│     /demo → /signup                 Time: 5+ min           │
│     ├─ Try features first                                  │
│     ├─ Hit quota limit                                     │
│     └─ Creates: User + Personal Jar                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key User Journeys Map

### NEW USER (Day 1-7)
```
Signup → Email Verify → Dashboard → Add Idea → Spin Jar → Rate
  ↓         60%           ↓          >3 ideas    <5 min     60%
ACTIVE      Skip          Tutorial   +15 XP      +5 XP     +100 XP
```

### COLLABORATIVE USER (Week 1-4)
```
Create Jar → Invite Members → Add Ideas → Start Vote → Complete Activity
    ↓           45% join         shared      voting        memories
  ADMIN         MEMBER          +15 XP       +5 XP         photos
```

### PREMIUM CONVERSION (Ongoing)
```
Free Trial → Hit Limit → Upgrade Prompt → Checkout → 7-Day Trial → Paid
            5 AI gens    35% convert     Stripe    45% convert   LTV $120
```

---

## 📱 Critical User Touchpoints

### Touchpoint 1: **First 5 Minutes** (ACTIVATION)
| Touchpoint | Goal | Success Metric |
|------------|------|---------------|
| Email verification | Verify account | 60% click link |
| Onboarding tutorial | Learn core features | 50% complete |
| Add first idea | Create content | <2 min to first idea |
| First spin | Experience core value | <5 min to first spin |

**Drop-off Risk**: 30% abandon before first idea  
**Mitigation**: Pre-populate sample ideas, simplify add flow

---

### Touchpoint 2: **Week 1** (RETENTION)
| Touchpoint | Goal | Success Metric |
|------------|------|---------------|
| Daily email nudge | Return to app | 15% open rate |
| "Add more ideas" CTA | Build jar | 8-12 ideas added |
| Invite prompt | Grow network | 40% send invite |
| Level up notification | Gamification hook | 2.5x engagement boost |

**Drop-off Risk**: 40% inactive after Day 7  
**Mitigation**: Automated re-engagement emails, push notifications

---

### Touchpoint 3: **Month 1** (CONVERSION)
| Touchpoint | Goal | Success Metric |
|------------|------|---------------|
| AI quota limit | Drive premium trial | 18% convert |
| Jar limit (3 jars) | Drive premium trial | 12% convert |
| Premium feature tease | Showcase value | 35% interest |
| Free trial CTA | Start subscription | 45% trial→paid |

**Drop-off Risk**: 55% never convert  
**Mitigation**: Extended free features, annual discount, referral rewards

---

## 🔄 User Lifecycle Stages

```
┌──────────────────────────────────────────────────────────────────┐
│                      USER LIFECYCLE                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STRANGER (0 days)                                              │
│  ├─ Landing page visitor                                        │
│  ├─ Actions: Explore features, try demo                         │
│  └─ Goal: Signup conversion                                     │
│                                                                  │
│  ↓ 70% convert to signup                                        │
│                                                                  │
│  NEW USER (Days 1-7)                                            │
│  ├─ Email verified: 60%                                         │
│  ├─ Actions: Tutorial, add ideas, first spin                    │
│  ├─ Key milestone: 3+ ideas, 1 spin                             │
│  └─ Goal: Activation                                            │
│                                                                  │
│  ↓ 60% become active users                                      │
│                                                                  │
│  ACTIVE USER (Weeks 2-4)                                        │
│  ├─ Weekly engagement                                           │
│  ├─ Actions: Add ideas, spin 3-7 times/week                     │
│  ├─ Invites sent: 40%                                           │
│  └─ Goal: Habit formation                                       │
│                                                                  │
│  ↓ 35% hit free tier limits                                     │
│                                                                  │
│  TRIAL USER (7-day trial)                                       │
│  ├─ Unlocked premium features                                   │
│  ├─ Actions: Try AI tools, create extra jars                    │
│  ├─ Conversion: 45% → Paid                                      │
│  └─ Goal: Premium conversion                                    │
│                                                                  │
│  ↓ 45% convert                     ↓ 55% downgrade              │
│                                                                  │
│  PAID USER                         FREE USER (retained)         │
│  ├─ LTV: $120 (12 months)         ├─ Still active, 3 jars max  │
│  ├─ Churn: <7%/month              ├─ 5 AI gens/month           │
│  └─ Referrals: 2.3 per user       └─ May upgrade later (20%)   │
│                                                                  │
│  ↓ 7% churn                        ↓ 40% inactive after 30d     │
│                                                                  │
│  CHURNED USER                      DORMANT USER                 │
│  ├─ Canceled subscription          ├─ No activity 30+ days     │
│  ├─ Downgraded to free             ├─ Re-engagement campaign   │
│  └─ Win-back campaign (3 emails)   └─ 15% reactivation rate    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Feature Adoption Timeline

### Week 1
- ✅ **Signup** (100% of actives)
- ✅ **Add idea manually** (95%)
- ✅ **First spin** (85%)
- 🔄 **Onboarding tutorial** (50% complete)
  - Triggered automatically via `localStorage` check
  - 11-step guided tour with tooltips
  - Completion sets `onboarding_completed` flag
  - Can be restarted from Settings menu

### Week 2
- ✅ **Invite member** (40%)
- ✅ **Use filters** (60%)
- 🔄 **AI "Surprise Me"** (25%)
- 🔄 **Rate activity** (15%)

### Week 3-4
- ✅ **Create 2nd jar** (35%)
- ✅ **Upload photos** (20%)
- 🔄 **Use AI planner** (10%)
- 🔄 **Start vote session** (5% - group jars only)

### Month 2+
- 🔄 **Premium features** (15-20%)
- 🔄 **Community jar** (5% - premium only)
- 🔄 **Advanced planners** (10% - premium users)

**Legend**: ✅ High adoption | 🔄 Growing adoption

---

## 📈 Conversion Funnels

### Funnel 1: Signup Conversion
```
Landing Page:           10,000 visitors
  ↓ 30%
Signup Page:             3,000 views
  ↓ 70%
Account Created:         2,100 signups
  ↓ 60%
Email Verified:          1,260 users
  ↓ 90%
First Idea Added:        1,134 users    ← ACTIVATION
  ↓ 85%
First Spin:                964 users    ← CORE VALUE
```

**Optimization Targets**:
- Signup page → Account: Improve from 70% to 80% (add social login)
- Email verified → First idea: Improve from 90% to 95% (skip verification)

---

### Funnel 2: Premium Conversion
```
Active Free Users:      1,000 users
  ↓ 35%
Hit Feature Limit:        350 users
  ↓ 50%
Click "Upgrade":          175 users
  ↓ 90%
Start Checkout:           158 users
  ↓ 85%
Complete Trial:           134 users    ← 7-DAY TRIAL
  ↓ 45%
Convert to Paid:           60 users    ← PAID SUBSCRIBER
```

**Optimization Targets**:
- Hit limit → Click upgrade: Improve from 50% to 65% (better messaging)
- Trial → Paid: Improve from 45% to 55% (reminder emails, value demos)

---

## ⚠️ Common Drop-Off Points

### 1. Signup Form Abandonment (30% loss)
**Why**: Too many fields, unclear value
**Fix**: 
- Reduce required fields to Name/Email/Password only
- Move location/topic to post-signup wizard
- Add progress indicator

### 2. Email Verification Click (40% loss)
**Why**: Users don't check email immediately
**Fix**:
- Allow immediate dashboard access
- Show "Verify later" banner
- Gate premium features on unverified accounts

### 3. Empty Jar State (10% loss)
**Why**: Blank canvas is intimidating
**Fix**:
- Pre-populate 3-5 sample ideas
- "Import template" quick action
- AI-generated starter pack

### 4. Trial Expiration (55% loss)
**Why**: Forgot to cancel, didn't see value
**Fix**:
- Mid-trial reminder email (Day 4)
- Show "trials ends in X days" banner
- Highlight premium features used during trial

---

## 💡 Optimization Opportunities

### Quick Wins (Low effort, high impact)
1. **Social login**: Add Apple Sign In (30% of mobile users)
2. **Skip email verification**: Allow immediate access
3. **Pre-populate ideas**: Reduce friction for new users
4. **Push notifications**: 3x better engagement than email

### Medium Effort
1. **Referral program**: Incentivize invites (give 1 month free)
2. **AI quota increase**: Raise free tier to 10 gens/month
3. **Annual discount**: 20% off annual plans (increase LTV)
4. **Onboarding personalization**: Tailor tutorial to signup method

### Major Projects
1. **Mobile app (PWA)**: Native app experience, push notifications
2. **Team plans**: Premium for groups (per-jar pricing)
3. **Public community jars**: Viral discovery mechanism
4. **Integration ecosystem**: Calendar, Google Photos, Spotify

---

## 📊 Key Metrics Dashboard

### North Star Metric
**Weekly Active Users (WAU)**: Users who spin jar ≥1x per week
- Current: 60% of signups
- Target: 75%

### Supporting Metrics
| Metric | Current | Target | Impact |
|--------|---------|--------|--------|
| Signup → First Spin | 85% | 90% | Activation |
| Ideas per user/month | 8-12 | 15+ | Engagement |
| Spins per user/month | 12-20 | 25+ | Core usage |
| Invite sent rate | 40% | 60% | Virality |
| Free → Trial | 18% | 25% | Revenue |
| Trial → Paid | 45% | 55% | Revenue |
| Monthly churn | <7% | <5% | Retention |

---

## 🎯 User Segmentation

### By Activity Level
- **Power Users (15%)**: 20+ spins/month, 3+ jars, invited 5+ members
- **Core Users (35%)**: 10-20 spins/month, 1-2 jars, engaged weekly
- **Casual Users (30%)**: 1-5 spins/month, 1 jar, sporadic usage
- **Dormant (20%)**: No activity in 30+ days

### By Conversion Stage
- **Free Forever (60%)**: Happy with free tier, no upgrade intent
- **Trial Eligible (25%)**: Hit limits, likely to try premium
- **Premium Curious (10%)**: Browsing premium features
- **Paid (5%)**: Active subscribers

### By Use Case (Jar Topic)
- **Dating/Romantic (40%)**: Couples, date night ideas
- **Social/Activities (35%)**: Friend groups, event planning
- **Personal/Solo (15%)**: Individual productivity, hobbies
- **Work/Tasks (10%)**: Team collaboration, task allocation

---

## 🛠️ Tools & Resources

### Analytics Tools
- **PostHog**: Event tracking, funnels, retention
- **Stripe Dashboard**: Revenue, MRR, churn
- **Vercel Analytics**: Page views, performance
- **Google Search Console**: SEO, organic traffic

### User Feedback
- **Feedback jars**: BUGRPT (bugs), FEATREQ (feature requests)
- **In-app reviews**: ReviewAppModal after 10 activities
- **Support email**: hello@decisionjar.app
- **Discord community** (future)

### Documentation
- `CUSTOMER_JOURNEYS.md` - This document
- `SIGNUP_FLOWS_REFERENCE.md` - Technical implementation
- `USER_MANUAL.md` - User-facing help
- `API_ENDPOINT_STATUS.md` - API documentation
- `TESTING_CHECKLIST.md` - QA procedures

---

## 🔮 Future Journey Enhancements

### Short-term (Next Quarter)
- [ ] Add onboarding quiz to personalize first jar
- [ ] Implement push notifications for web and mobile
- [ ] Create referral reward program (1 month free)
- [ ] Add "Import from Instagram" for photo ideas

### Medium-term (6 months)
- [ ] Launch mobile app (iOS/Android native)
- [ ] Build public jar discovery page
- [ ] Add calendar integration (Google, Apple, Outlook)
- [ ] Team/family plans with group billing

### Long-term (12+ months)
- [ ] AI-powered smart recommendations
- [ ] Social features (follow friends, share jars)
- [ ] Third-party integrations (Spotify playlists, etc.)
- [ ] Enterprise version for corporate team building

---

**Quick Access Links**:
- [Full Journey Documentation](./CUSTOMER_JOURNEYS.md)
- [Technical Signup Reference](./SIGNUP_FLOWS_REFERENCE.md)
- [User Manual](./USER_MANUAL.md)

**Last Updated**: January 11, 2026  
**Maintained By**: Product Team
