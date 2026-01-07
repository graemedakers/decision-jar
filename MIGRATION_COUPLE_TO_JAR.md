# ⚠️ IMPORTANT: READ BEFORE RUNNING

## Database Migration: Couple → Jar Rename

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
