"use server";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { API_BILLING_CONFIG } from "@/lib/api/billing-config";

export async function createCheckoutSession(priceId: string, apiKeyId: string) {
    const session = await getSession();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Pass auth cookie if needed, but since we are server-side calling an API route, 
            // the API route needs a session.
            // Actually, server actions calling API routes is weird. 
            // Better to call stripe logic directly OR client-side fetch.
            // Let's use client-side fetch in the component for simplicity as per existing pattern?
            // Wait, existing pattern creates checkout session via API.
            // But we can ALSO redirect from here.

            // Re-use API logic? 
            // Simpler: Just return the URL to the client component or redirect.
            'Cookie': (await headers()).get('cookie') || ''
        },
        body: JSON.stringify({
            priceId,
            mode: 'subscription',
            metadata: {
                type: 'API_UPGRADE',
                apiKeyId
            }
        })
    });

    // Actually, calling our own API route from a server action is often flaky with Auth.
    // It's better to just do the Stripe call here if possible, but reusing the route logic is DRY.
    // Let's rely on the Client component calling the API route directly via fetch, 
    // OR have this action construct the session.

    // For now, let's stick to the Client Component calling the route, 
    // because redirect() in server action works well too.
}
