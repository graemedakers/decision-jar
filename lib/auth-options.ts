import { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthConfig = {
    adapter: PrismaAdapter(prisma) as any,
    // cookies: {
    //     sessionToken: {
    //         name: `next-auth.session-token`,
    //         options: {
    //             httpOnly: true,
    //             sameSite: 'lax',
    //             path: '/',
    //             secure: process.env.NODE_ENV === 'production'
    //         }
    //     }
    // },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    debug: process.env.NODE_ENV === 'development',
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    pages: {
        signIn: "/login",
        newUser: "/dashboard",
    },
    callbacks: {
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url

            // Default to dashboard instead of home
            return baseUrl + '/dashboard'
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub;
            }
            return session;
        },
        async jwt({ token, user }) {
            return token;
        },
    },
};
