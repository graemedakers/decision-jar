-- Fix Community Jar Flag
-- Run this SQL query in your database to mark your jar as a community jar

-- Option 1: If you know the jar ID
-- UPDATE "Couple" SET "isCommunityJar" = true WHERE id = 'YOUR_JAR_ID_HERE';

-- Option 2: Find and update by name
UPDATE "Couple" 
SET "isCommunityJar" = true 
WHERE LOWER(name) LIKE '%report%bug%' 
OR LOWER(name) LIKE '%bug%report%';

-- Verify the update
SELECT id, name, "isCommunityJar", "referenceCode" 
FROM "Couple" 
WHERE "isCommunityJar" = true;
