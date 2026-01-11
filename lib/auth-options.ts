import { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const authOptions: NextAuthConfig = {
    adapter: PrismaAdapter(prisma) as any,
    debug: process.env.NODE_ENV === 'development',
    events: {
        createUser: async ({ user }) => {
            if (!user.id) return;
            try {
                // Find community jars
                const communityJars = await prisma.jar.findMany({
                    where: {
                        referenceCode: { in: ['BUGRPT', 'FEATREQ'] }
                    }
                });

                if (communityJars.length > 0) {
                    // Add memberships to community jars
                    await prisma.jarMember.createMany({
                        data: communityJars.map(jar => ({
                            jarId: jar.id,
                            userId: user.id!,
                            role: 'MEMBER'
                        }))
                    });

                    // ✅ CRITICAL FIX: Do NOT set activeJarId to community jar
                    // Leave activeJarId as null so user is prompted to create personal jar
                    // Previous behavior caused OAuth users to land in empty BUGRPT jar

                    // NOTE: User will see "Create Your First Jar" modal on dashboard
                    // This provides better onboarding experience for OAuth users
                }
            } catch (error) {
                console.error("Error adding user to community jars:", error);
            }
        }
    },
    ...authConfig,
};
