import { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { generateUniqueCode } from "@/lib/utils";

export const authOptions: NextAuthConfig = {
    adapter: PrismaAdapter(prisma) as any,
    debug: process.env.NODE_ENV === 'development',
    events: {
        createUser: async ({ user }) => {
            if (!user.id) return;
            try {
                // 1. Create a default personal jar for the user
                // Do this FIRST so it becomes their active jar
                const code = await generateUniqueCode();

                const personalJar = await prisma.jar.create({
                    data: {
                        name: "My First Jar",
                        type: "SOCIAL", // Default to social/general
                        topic: "General Fun",
                        referenceCode: code,
                        members: {
                            create: {
                                userId: user.id,
                                role: 'OWNER',
                                status: 'ACTIVE'
                            }
                        }
                    }
                });

                // Set this as the active jar immediately
                await prisma.user.update({
                    where: { id: user.id },
                    data: { activeJarId: personalJar.id }
                });

                // 2. Add to community jars (as secondary jars)
                const communityJars = await prisma.jar.findMany({
                    where: {
                        referenceCode: { in: ['BUGRPT', 'FEATREQ'] }
                    }
                });

                if (communityJars.length > 0) {
                    await prisma.jarMember.createMany({
                        data: communityJars.map(jar => ({
                            jarId: jar.id,
                            userId: user.id!,
                            role: 'MEMBER'
                        }))
                    });
                }
            } catch (error) {
                console.error("Error setting up new user jars:", error);
            }
        }
    },
    ...authConfig,
};
