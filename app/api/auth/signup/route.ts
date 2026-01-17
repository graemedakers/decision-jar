import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { login } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/mailer';
import { validatePremiumToken, recordTokenUsage } from '@/lib/premium-token-validator';

export async function POST(request: Request) {
    try {
        const { name, email: rawEmail, password, inviteCode, location, topic, type, premiumToken, selectionMode } = await request.json();
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

        let isPremiumGifted = false;
        let user;

        const shouldCreateJar = !inviteCode && (topic || type);

        // Helper to infer jar type from topic
        // Note: Type no longer affects functionality - it's just metadata
        function inferTypeFromTopic(topic: string): string {
            const romanticTopics = ['Dates', 'Romantic', 'date', 'romantic'];

            if (romanticTopics.some(t => topic.toLowerCase().includes(t.toLowerCase()))) {
                return 'ROMANTIC';
            }

            // Default to SOCIAL (works for both solo and group use)
            return 'SOCIAL';
        }

        if (shouldCreateJar) {
            // Determine Name
            let jarName = `${name}'s Jar`;
            const selectedTopic = topic || "General";

            if (selectedTopic !== "General") {
                jarName = `${name}'s ${selectedTopic} Jar`;
            }

            const modeInput = selectionMode as string;
            const validSelectionMode = (modeInput === 'VOTING' || modeInput === 'VOTE' || modeInput === 'ALLOCATION')
                ? (modeInput === 'VOTING' ? 'VOTE' : modeInput)
                : 'RANDOM';

            // Auto-infer type from topic
            const inferredType = inferTypeFromTopic(selectedTopic);

            // Create new Jar
            const jar = await (prisma.jar as any).create({
                data: {
                    referenceCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                    location: location || 'Unknown',
                    isPremium: false,
                    name: jarName,
                    type: inferredType,
                    topic: selectedTopic,
                    selectionMode: validSelectionMode
                },
            });

            // Create User and default Membership
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    passwordHash,
                    homeTown: location || 'Unknown',
                    activeJarId: jar.id,
                    hasUsedTrial: false,
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
        } else if (!inviteCode) {
            // Create user WITHOUT a jar
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    passwordHash,
                    homeTown: location || 'Unknown',
                    verificationToken,
                    emailVerified: null,
                }
            });
        } else {
            // JOINING EXISTING JAR (via code)
            const jar = await prisma.jar.findUnique({
                where: { referenceCode: inviteCode },
            });

            if (!jar) {
                return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
            }

            // Validate premium token using unified validator
            if (premiumToken) {
                const validation = await validatePremiumToken(premiumToken);
                isPremiumGifted = validation.isValid;
                if (!validation.isValid && validation.reason) {
                    console.log(`Premium token rejected during signup: ${validation.reason}`);
                }
            }

            // Create User linked to existing jar
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    passwordHash,
                    homeTown: location || 'Unknown',
                    activeJarId: jar.id,
                    verificationToken,
                    emailVerified: null,
                    isLifetimePro: isPremiumGifted, // Grant Premium
                    memberships: {
                        create: {
                            jarId: jar.id,
                            role: "MEMBER"
                        }
                    }
                },
            });

            // Record token usage using unified tracker
            if (isPremiumGifted && premiumToken) {
                await recordTokenUsage(premiumToken, user.id, 'signup');
            }
        }

        // Auto-add user to community feedback jars
        try {
            const feedbackJars = await prisma.jar.findMany({
                where: {
                    referenceCode: {
                        in: ['BUGRPT', 'FEATREQ']
                    }
                },
                select: { id: true, referenceCode: true }
            });

            if (feedbackJars.length > 0) {
                // Check which jars the user is not already a member of
                const existingMemberships = await prisma.jarMember.findMany({
                    where: {
                        userId: user.id,
                        jarId: {
                            in: feedbackJars.map(j => j.id)
                        }
                    },
                    select: { jarId: true }
                });

                const existingJarIds = existingMemberships.map(m => m.jarId);
                const jarsToJoin = feedbackJars.filter(j => !existingJarIds.includes(j.id));

                // Add user to feedback jars they're not already in
                for (const jar of jarsToJoin) {
                    await prisma.jarMember.create({
                        data: {
                            userId: user.id,
                            jarId: jar.id,
                            role: 'MEMBER'
                        }
                    });
                    console.log(`Added user ${user.email} to ${jar.referenceCode} jar`);
                }
            }
        } catch (feedbackError) {
            // Don't fail signup if feedback jar addition fails
            console.error('Failed to add user to feedback jars:', feedbackError);
        }

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        const premiumTokenInvalid = !!premiumToken && !isPremiumGifted;

        return NextResponse.json({
            success: true,
            requiresVerification: true,
            premiumGifted: isPremiumGifted,
            premiumTokenInvalid
        });

    } catch (error: any) {
        console.error('Signup error details:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
