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
                    // 1. Create a default personal jar for the user
                    // Use database-verified unique code to prevent race conditions
                    const code = await generateUniqueJarCode();

                    const personalJar = await tx.jar.create({
                        data: {
                            name: "My First Jar",
                            type: "SOCIAL", // Default to social/general
                            topic: "General Fun",
                            referenceCode: code,
                            members: {
                                create: {
                                    userId: user.id!, // Already checked at function start
                                    role: 'OWNER',
                                    status: 'ACTIVE'
                                }
                            }
                        }
                    });

                    // 2. Set this as the active jar immediately
                    await tx.user.update({
                        where: { id: user.id },
                        data: { activeJarId: personalJar.id }
                    });

                    // 3. Add to community jars (as secondary jars)
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

                console.log(`✅ Successfully created default jar for new user: ${user.id}`);
            } catch (error) {
                // Log the error with full context for debugging
                console.error(`❌ CRITICAL: Failed to set up jars for new user ${user.id}:`, error);

                // In production, you may want to:
                // 1. Send error to monitoring service (e.g., Sentry)
                // 2. Set a flag on user account to trigger manual jar creation
                // 3. Send alert to admin

                // For now, we throw to prevent silent failures
                // This will cause the signup to fail, which is better than leaving user in broken state
                throw new Error(`Failed to initialize user jars: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    },
    ...authConfig,
};
