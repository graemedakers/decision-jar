-- Quick migration SQL (single command version)
ALTER TABLE "Couple" RENAME TO "Jar";
ALTER TABLE "UnlockedAchievement" RENAME COLUMN "coupleId" TO "jarId";
ALTER TABLE "DeletedLog" RENAME COLUMN "coupleId" TO "jarId";
ALTER TABLE "Idea" RENAME COLUMN "coupleId" TO "jarId";
ALTER TABLE "FavoriteVenue" RENAME COLUMN "coupleId" TO "jarId";
ALTER TABLE "VoteSession" RENAME COLUMN "coupleId" TO "jarId";
