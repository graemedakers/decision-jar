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
                    // Add memberships
                    await prisma.jarMember.createMany({
                        data: communityJars.map(jar => ({
                            jarId: jar.id,
                            userId: user.id!,
                            role: 'MEMBER'
                        }))
                    });

                    // Set active jar to Bug Reports (BUGRPT) if found
                    const bugJar = communityJars.find(j => j.referenceCode === 'BUGRPT');
                    if (bugJar) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { activeJarId: bugJar.id }
                        });
                    }
                }
            } catch (error) {
                console.error("Error adding user to community jars:", error);
            }
        }
    },
    ...authConfig,
};
