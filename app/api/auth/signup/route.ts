import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { login } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/mailer';

export async function POST(request: Request) {
    try {
        const { name, email: rawEmail, password, inviteCode, location, topic, type } = await request.json();
        const email = rawEmail?.toLowerCase().trim();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // ... existing user check ...
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        let user;

        if (!inviteCode) {
            // Determine Name
            let jarName = `${name}'s Jar`;
            const selectedTopic = topic || "General";

            if (selectedTopic !== "General") {
                jarName = `${name}'s ${selectedTopic} Jar`;
            }

            // Create new Jar
            const jar = await (prisma.jar as any).create({
                data: {
                    referenceCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                    location: location || 'Unknown',
                    isPremium: false,
                    name: jarName,
                    type: (type === 'ROMANTIC' || type === 'SOCIAL' || type === 'GENERIC') ? type : 'SOCIAL',
                    topic: selectedTopic
                },
            });

            // Create User and default Membership
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    passwordHash,
                    activeJarId: jar.id,
                    coupleId: jar.id, // Legacy support
                    hasUsedTrial: false, // Default false until they subscribe/start trial
                    verificationToken,
                    emailVerified: null,
                    memberships: {
                        create: {
                            jarId: jar.id,
                            role: "ADMIN"
                        }
                    }
                },
            });
        } else {
            // JOINING EXISTING JAR (via code)
            const jar = await prisma.jar.findUnique({
                where: { referenceCode: inviteCode },
            });

            if (!jar) {
                return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
            }

            // Create User linked to existing jar
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    passwordHash,
                    activeJarId: jar.id,
                    coupleId: jar.id, // Legacy support
                    verificationToken,
                    emailVerified: null,
                    memberships: {
                        create: {
                            jarId: jar.id,
                            role: "MEMBER"
                        }
                    }
                },
            });
        }

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        // DO NOT LOGIN YET
        // await login(user);

        return NextResponse.json({ success: true, requiresVerification: true });

    } catch (error: any) {
        console.error('Signup error details:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
