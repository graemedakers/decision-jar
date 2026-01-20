---
description: How to safely manage and update the database schema
---

# Database Management Workflow

To prevent accidental production data loss, all database schema changes MUST follow this workflow.

## 1. Safety Check
Before running any database command, ensure your environment is not pointing to production.
- Run `echo $env:DATABASE_URL` (PowerShell) or `echo $DATABASE_URL` (Bash).
- If it contains `ep-weathered-sun`, CLEAR IT:
  - PowerShell: `$env:DATABASE_URL = ""`
  - Bash: `unset DATABASE_URL`

## 2. Schema Modification
// turbo
1. Modify `prisma/schema.prisma` as needed.

## 3. Applying Changes
// turbo
2. ALWAYS use the npm wrapper scripts. NEVER use raw `npx prisma` commands.
   - For development prototyping: `npm run db:push`
   - For versioned migrations: `npm run db:migrate`

## 4. Why this matters
The `npm run` commands use `scripts/safe-prisma.js` which performs a hostname check. Raw `npx prisma` commands will bypass this check and could wipe production data if the environment is misconfigured.
