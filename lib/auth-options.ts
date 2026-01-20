import { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { generateUniqueJarCode } from "@/lib/utils";

export const authOptions: NextAuthConfig = {
    adapter: PrismaAdapter(prisma) as any,
    debug: process.env.NODE_ENV === 'development',
    events: {
        createUser: async ({ user }) => {
            if (!user.id) return;

            try {
                // Use transaction to ensure atomicity
                // If any step fails, all changes are rolled back
                await prisma.$transaction(async (tx) => {
                    // Check if this is an OAuth user (no password = OAuth)
                    const fullUser = await tx.user.findUnique({
                        where: { id: user.id },
                        select: { passwordHash: true, emailVerified: true }
                    });

                    // Auto-verify OAuth users since Google/Facebook already verified them
                    if (fullUser && !fullUser.passwordHash && !fullUser.emailVerified) {
                        await tx.user.update({
                            where: { id: user.id },
                            data: {
                                emailVerified: new Date(),
                                verificationToken: null // Clear any token
                            }
                        });
                        console.log(`✅ Auto-verified OAuth user: ${user.id}`);
                    }

                    // Don't create a default jar automatically
                    // Let users customize their first jar through the dashboard modal
                    // This ensures both OAuth and email/password users get the same onboarding experience

                    // Add to community jars (BUGRPT and FEATREQ)
                    const communityJars = await tx.jar.findMany({
                        where: {
                            referenceCode: { in: ['BUGRPT', 'FEATREQ'] }
                        }
                    });

                    if (communityJars.length > 0) {
                        await tx.jarMember.createMany({
                            data: communityJars.map(jar => ({
                                jarId: jar.id,
                                userId: user.id!,
                                role: 'MEMBER'
                            }))
                        });
                    }
                });

                console.log(`✅ Successfully initialized new user: ${user.id}`);
            } catch (error) {
                // Log the error with full context for debugging
                console.error(`❌ CRITICAL: Failed to set up user ${user.id}:`, error);

                // In production, you may want to:
                // 1. Send error to monitoring service (e.g., Sentry)
                // 2. Set a flag on user account to trigger manual setup
                // 3. Send alert to admin

                // For now, we throw to prevent silent failures
                // This will cause the signup to fail, which is better than leaving user in broken state
                throw new Error(`Failed to initialize user: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    },
    ...authConfig,
};
