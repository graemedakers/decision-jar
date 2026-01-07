# Force Vercel to Rebuild

This file forces Vercel to do a completely fresh build by changing a timestamp.

Last rebuild trigger: 2026-01-08 09:07:00 AEST

## Why this is needed:
After database schema changes, Vercel needs to:
1. Pull the new Prisma schema
2. Run `prisma generate` with the new schema
3. Rebuild all API routes with the new Prisma Client

Sometimes cached builds don't pick up schema changes properly.

## Changes made:
- Renamed `Couple` table → `Jar`
- Renamed `coupleId` columns → `jarId` in 6 tables
- User premium status: `isLifetimePro = true`

Build trigger timestamp: Wed Jan 08 2026 09:07:14 GMT+1100
