-- Migration: Rename Couple table and columns to Jar
-- This migration renames the legacy "Couple" table to "Jar"
-- and updates all foreign key columns from "coupleId" to "jarId"

-- Step 1: Rename the main table
ALTER TABLE "Couple" RENAME TO "Jar";

-- Step 2: Rename foreign key columns in related tables
ALTER TABLE "UnlockedAchievement" RENAME COLUMN "coupleId" TO "jarId";
ALTER TABLE "DeletedLog" RENAME COLUMN "coupleId" TO "jarId";
ALTER TABLE "Idea" RENAME COLUMN "coupleId" TO "jarId";
ALTER TABLE "FavoriteVenue" RENAME COLUMN "coupleId" TO "jarId";
ALTER TABLE "VoteSession" RENAME COLUMN "coupleId" TO"jarId";

-- Note: Foreign key constraints are automatically updated by PostgreSQL
-- when columns are renamed. No need to drop/recreate them.

-- Verification queries (run separately to check):
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Jar';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Idea' AND column_name LIKE '%jar%';
