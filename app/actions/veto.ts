'use server';

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function vetoIdea(ideaId: string, jarId: string): Promise<{ success: boolean; error?: string; remaining?: number; idea?: any }> {
    try {
        const session = await getSession();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const userId = session.user.id;

        // 1. Transaction: Check balance, decrement cards, reject idea
        const result = await prisma.$transaction(async (tx) => {
            // Get Member
            const member = await tx.jarMember.findUnique({
                where: { userId_jarId: { userId, jarId } }
            });

            if (!member) throw new Error("Not a member of this jar");
            if (member.vetoCardsRemaining <= 0) throw new Error("No veto cards remaining");

            // Decrement Card
            await tx.jarMember.update({
                where: { userId_jarId: { userId, jarId } },
                data: { vetoCardsRemaining: { decrement: 1 } }
            });

            // Reject Idea
            const idea = await tx.idea.update({
                where: { id: ideaId },
                data: { status: 'REJECTED' }
            });

            return { success: true, remaining: member.vetoCardsRemaining - 1, idea };
        });

        revalidatePath(`/jar/${jarId}`);
        return result;

    } catch (error: any) {
        console.error("Veto Error:", error);
        return { success: false, error: error.message };
    }
}
