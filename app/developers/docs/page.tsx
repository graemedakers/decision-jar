import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PlaygroundClient } from "./client";

export default async function ApiDocs() {
    const session = await getSession();
    if (!session?.user) {
        redirect("/login?callbackUrl=/developers/docs");
    }

    const apiKeys = await prisma.apiKey.findMany({
        where: { userId: session.user.id, isActive: true },
        orderBy: { createdAt: 'desc' }
    });

    const activeKey = apiKeys[0]?.key || "";

    return (
        <div className="container mx-auto px-6 max-w-4xl pt-24 pb-10 space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">API Playground</h1>
                <p className="text-muted-foreground">
                    Test the Ideas Generator API live.
                </p>
            </div>

            <PlaygroundClient initialKey={activeKey} />
        </div>
    )
}
