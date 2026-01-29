import { prisma } from './prisma';
import { auth } from './next-auth-helper';

export async function getSession() {
    try {
        // E2E Test Bypass
        if (process.env.NODE_ENV !== 'production') {
            const { headers } = await import('next/headers');
            const headerList = await headers();
            if (headerList.get('x-e2e-bypass') === 'true') {
                // Return the seeded mocked session if bypass is active
                // We try to find the user by email if provided, or just the first user
                const email = headerList.get('x-e2e-user-email');
                let user;

                if (email) {
                    user = await prisma.user.findFirst({ where: { email } });
                }

                if (!user) {
                    // Fallback to any test user if specific one not found or not provided
                    user = await prisma.user.findFirst({
                        where: { email: { contains: 'test-user' } }
                    });
                }

                if (user) {
                    return {
                        user: {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            activeJarId: user.activeJarId,
                            isLifetimePro: user.isLifetimePro,
                            stripeSubscriptionId: user.stripeSubscriptionId,
                            subscriptionStatus: user.subscriptionStatus
                        },
                        expires: new Date(Date.now() + 86400000).toISOString()
                    };
                }
            }
        }

        const nextAuthSession = await auth();

        if (nextAuthSession?.user?.email) {
            // Map NextAuth session to match custom session structure
            // This ensures backward compatibility for components expecting the full user object
            const user = await prisma.user.findFirst({
                where: { email: { equals: nextAuthSession.user.email, mode: 'insensitive' } }
            });

            if (user) {
                return {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        activeJarId: user.activeJarId,
                        isLifetimePro: user.isLifetimePro,
                        stripeSubscriptionId: user.stripeSubscriptionId,
                        subscriptionStatus: user.subscriptionStatus
                    },
                    expires: nextAuthSession.expires
                };
            }

            // If user not in DB (edge case), return basic session
            return {
                user: { email: nextAuthSession.user.email },
                expires: nextAuthSession.expires
            };
        }
    } catch (error) {
        console.error("Error getting session:", error);
    }

    return null;
}

// Deprecated but kept to prevent breakages if imported, but now value-less or redirecting
export async function login(userData: any) {
    console.warn("Legacy login() called. This function is deprecated. Use signIn() from next-auth/react.");
}

export async function logout() {
    console.warn("Legacy logout() called. This function is deprecated. Use signOut() from next-auth/react.");
}
