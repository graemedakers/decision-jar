# ⚠️ IMPORTANT: READ BEFORE RUNNING

## Database# Migration Log: Couple to Jar (Recovery Phase)

## Critical Issues & Fixes (Jan 8, 2026)

### 1. Raw SQL Queries
We found several `prisma.$queryRaw` and `prisma.$executeRaw` calls that were manually referencing `"Couple"` table and `"coupleId"` column. Since the table was renamed in the DB, these crashed immediately.
**Fix:** Updated all raw SQL to use `"Jar"` and `"jarId"`.

### 2. Prisma Schema Drift (Enum Mismatch)
The `MemberStatus` enum in the database contained `PENDING` and `WAITLISTED`, but the `schema.prisma` file was missing them (likely reverted or never updated during original dev). This caused crashes when Prisma tried to read `JarMember` records.
**Fix:** Added `PENDING` and `WAITLISTED` to `MemberStatus` enum.

### 3. Code References to `user.couple`
The codebase still referenced `user.couple` and `user.coupleId` extensively.
**Fix:**
- Updated `schema.prisma`: Added `legacyJar Jar?` relation and `legacyJarId` field to User model for backward compatibility mapping (but using correct DB columns).
- Updated `lib/auth.ts`: Mapped `session.user.coupleId` -> `user.legacyJarId` to keep frontend working.
- Updated API Routes: Replaced `user.couple` -> `user.legacyJar` and `user.coupleId` (Prisma) -> `user.legacyJarId`.

---
# Original Migration Plan
This migration renames the legacy "Couple" table to "Jar" throughout the database.

### ⚠️ WARNING
This is a **breaking change** if done incorrectly. The application expects either `Couple` OR `Jar` table names, not both.

###✅ Safe Migration Steps

#### Step 1: Backup Database (CRITICAL!)
```bash
# Use Neon dashboard to create a snapshot OR
# Export via pg_dump
pg_dump $DATABASE_URL > backup_before_rename.sql
```

#### Step 2: Run the SQL Migration
You have two options:

**Option A: Via Neon Dashboard (Recommended)**
1. Log into Neon console
2. Navigate to SQL Editor
3. Run the SQL from: `prisma/migrations/rename_couple_to_jar.sql`

**Option B: Via Prisma**
```bash
# This will apply the schema changes directly
npx prisma db push
```

#### Step 3: Regenerate Prisma Client
```bash
npx prisma generate
```

#### Step 4: Test Locally First
```bash
# Start dev server
npm run dev

# Test critical paths:
# - Login
# - View jars
# - Create idea
# - Spin jar
```

#### Step 5: Deploy to Production
Only after local testing passes!

### What Changes:
- Table: `Couple` → `Jar`
- Columns: `coupleId` → `jarId` in:
  - UnlockedAchievement
  - DeletedLog
  - Idea
  - FavoriteVenue
  - VoteSession

### Rollback Plan
If something goes wrong:
```sql
ALTER TABLE "Jar" RENAME TO "Couple";
ALTER TABLE "UnlockedAchievement" RENAME COLUMN "jarId" TO "coupleId";
ALTER TABLE "DeletedLog" RENAME COLUMN "jarId" TO "coupleId";
ALTER TABLE "Idea" RENAME COLUMN "jarId" TO "coupleId";
ALTER TABLE "FavoriteVenue" RENAME COLUMN "jarId" TO "coupleId";
ALTER TABLE "VoteSession" RENAME COLUMN "jarId" TO "coupleId";
```

Then restore the @map directives in schema.prisma and run `npx prisma generate`.

### Estimated Downtime
- **Development**: 0 seconds (instant rename)
- **Production**: < 5 seconds

PostgreSQL table renames are atomic operations.
