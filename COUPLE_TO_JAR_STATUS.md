# Legacy Couple → Jar Migration - READY TO EXECUTE

## ✅ Status: Schema Updated, Migration SQL Prepared

### What We've Done:
1. ✅ Updated `prisma/schema.prisma` - Removed all `@@map("Couple")` and `@map("coupleId")` directives
2. ✅ Created SQL migration files:
   - `rename_couple_to_jar_SAFE.sql` - Production-ready migration
   - `prisma/migrations/rename_couple_to_jar.sql` - Documentation

### What Needs To Be Done:

#### Option 1: Apply to Production (Recommended: Via Neon Dashboard)
1. **Backup First!** Create a Neon snapshot
2. Log into Neon Console: https://console.neon.tech
3. Navigate to SQL Editor
4. Copy the SQL from `rename_couple_to_jar_SAFE.sql`
5. Execute the SQL
6. Verify success (should see "Migration complete!" notice)

#### Option 2: Apply Locally First (Testing)
If you have a local PostgreSQL:
```bash
psql $LOCAL_DATABASE_URL < rename_couple_to_jar_SAFE.sql
```

### After SQL Migration:
```bash
# Regenerate Prisma Client
npx prisma generate

# Verify schema is in sync
npx prisma db pull

# Restart dev server
npm run dev
```

### The SQL That Will Run:
```sql
BEGIN;
ALTER TABLE "Couple" RENAME TO "Jar";
ALTER TABLE "UnlockedAchievement" RENAME COLUMN "coupleId" TO "jarId";
ALTER TABLE "DeletedLog" RENAME COLUMN "coupleId" TO "jarId";
ALTER TABLE "Idea" RENAME COLUMN "coupleId" TO "jarId";
ALTER TABLE "FavoriteVenue" RENAME COLUMN "coupleId" TO "jarId";
ALTER TABLE "VoteSession" RENAME COLUMN "coupleId" TO "jarId";
COMMIT;
```

### Why Can't Prisma Do This Automatically?
Prisma sees this as "adding new columns" instead of "renaming existing columns" because:
- The database currently has `coupleId` columns
- The schema now expects `jarId` columns
- Prisma doesn't track renam history without migrations

### Estimated Impact:
- **Downtime**: < 1 second (PostgreSQL table/column renames are atomic)
- **Data Loss**: None (pure rename operation)
- **Rollback**: Simple (reverse the ALTER statements)

### Verification After Migration:
Test these critical paths:
- ✅ Login
- ✅ View dashboard (loads jars)
- ✅ Create a new idea
- ✅ Spin the jar
- ✅ View memories

### Files Changed in This PR:
- ✅ `prisma/schema.prisma` - Removed legacy mappings
- ✅ `rename_couple_to_jar_SAFE.sql` - Migration SQL
- ✅ `MIGRATION_COUPLE_TO_JAR.md` - Full migration guide

## Next Steps:
1. Review this summary
2. Decide when to run the migration
3. Execute SQL via Neon dashboard
4. Run `npx prisma generate`
5. Test thoroughly
6. Commit the schema changes

**Status**: Ready to execute when you're ready! 🚀
