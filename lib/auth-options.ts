import { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthConfig = {
    adapter: PrismaAdapter(prisma) as any,
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: "jwt",
    },
    ...authConfig,
    providers: [
        ...authConfig.providers,
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = (credentials.email as string).toLowerCase().trim();
                const password = credentials.password as string;

                try {
                    const user = await prisma.user.findUnique({
                        where: { email },
                    });

                    if (!user) {
                        return null;
                    }

                    // Check if user has a password (if not, they might be OAuth only)
                    if (!user.passwordHash) {
                        // You could throw an error here to tell the user to use social login
                        // but usually returning null is safer for security (generic error)
                        // However, we can handle specific errors in the UI if we want to be helpful
                        return null;
                    }

                    const isValid = await bcrypt.compare(password, user.passwordHash);

                    if (!isValid) {
                        return null;
                    }

                    // Return user object without sensitive data
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        })
    ],
    events: {
        createUser: async ({ user }) => {
            if (!user.id) return;

            try {
                // Use transaction to ensure atomicity
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
                });

                console.log(`✅ Successfully initialized new user: ${user.id}`);
            } catch (error) {
                console.error(`❌ CRITICAL: Failed to set up user ${user.id}:`, error);
                console.error(`[DEBUG SHIELD] Suppressing error in createUser event:`, error);
            }
        }
    },
};
