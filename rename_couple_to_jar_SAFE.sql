-- Direct SQL Migration: Rename Couple → Jar
-- Run this SQL directly in Neon dashboard or via psql

BEGIN;

-- Step 1: Rename the main table
ALTER TABLE "Couple" RENAME TO "Jar";

-- Step 2: Rename foreign key columns
ALTER TABLE "UnlockedAchievement" RENAME COLUMN "coupleId" TO "jarId";
ALTER TABLE "DeletedLog" RENAME COLUMN "coupleId" TO "jarId";
ALTER TABLE "Idea" RENAME COLUMN "coupleId" TO "jarId";
ALTER TABLE "FavoriteVenue" RENAME COLUMN "coupleId" TO "jarId";
ALTER TABLE "VoteSession" RENAME COLUMN "coupleId" TO "jarId";

-- PostgreSQL automatically updates foreign key constraints when columns are renamed
-- Verify success
DO $$
BEGIN
    RAISE NOTICE 'Migration complete! Tables and columns renamed successfully.';
END $$;

COMMIT;
