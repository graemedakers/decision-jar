# Decision Jar

Decision Jar is a powerful, interactive tool designed to end indecision. Whether you're planning a date night, managing household chores, or coordinating team activities, Decision Jar makes it fun and fair.

## 🚀 Key Features

- **Clean Dashboard**: Focused interface for your jar and ideas, with instant access to spin, add, and favorites.
- **Explore Tab**: Dedicated discovery space for all AI planners and concierge services.
- **Classic Spin**: Randomly select an idea from your jar based on budget, time, and energy filters.
- **Task Allocation**: Distribute chores or responsibilities fairly and privately among group members.
- **AI Planners**: Generate comprehensive itineraries for weekends, nights out, and catering events.
- **Concierge Services**: AI-powered scouts for dining, nightlife, movies, hotels, and local events.
- **Gamification**: Earn XP and level up as you make decisions and complete activities.

## 🛠️ Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📖 Documentation

- [User Manual](./USER_MANUAL.md) - Comprehensive guide for users.
- [Mobile App Guide](./MOBILE_APP_GUIDE.md) - Guide for the Capacitor-based mobile build.
- [Group Jar Use Cases](./GROUP_JAR_USE_CASES.md) - Explore ways to use the app in shared mode.

## ⚠️ Developer Safety Guidelines

### Database Updates
To prevent accidental production data loss, **never** run raw `npx prisma` commands. Always use the provided wrappers:

- **Push Schema (Dev):** `npm run db:push`
- **Create Migration:** `npm run db:migrate`

These commands run through `scripts/safe-prisma.js`, which blocks any attempt to modify the `weathered-sun` (Production) database unless explicitly authorized.

### Environment Hygiene
Before running DB commands, always verify your terminal doesn't have a global `DATABASE_URL` set that might override your `.env` file.
- **PowerShell:** `echo $env:DATABASE_URL`
- **Bash:** `echo $DATABASE_URL`

## 🚢 Deployment

The project is optimized for deployment on [Vercel](https://vercel.com). Ensure you have configured your environment variables and Prisma database correctly.

---

Built for fun and fairness.
