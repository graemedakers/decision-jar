-- ✅ HIGH PRIORITY FIX: Add secure premium invite token system
-- This migration adds the PremiumInviteToken model to replace hardcoded token validation

-- CreateTable
CREATE TABLE "PremiumInviteToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usedById" TEXT,
    "usedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PremiumInviteToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PremiumInviteToken_token_key" ON "PremiumInviteToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PremiumInviteToken_usedById_key" ON "PremiumInviteToken"("usedById");

-- CreateIndex
CREATE INDEX "PremiumInviteToken_token_idx" ON "PremiumInviteToken"("token");

-- CreateIndex
CREATE INDEX "PremiumInviteToken_createdById_idx" ON "PremiumInviteToken"("createdById");

-- CreateIndex
CREATE INDEX "PremiumInviteToken_expiresAt_idx" ON "PremiumInviteToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "PremiumInviteToken" ADD CONSTRAINT "PremiumInviteToken_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremiumInviteToken" ADD CONSTRAINT "PremiumInviteToken_usedById_fkey" FOREIGN KEY ("usedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
