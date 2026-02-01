import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiKey } from "@prisma/client";
import { redirect } from "next/navigation";
import { generateApiKey, revokeApiKey } from "@/app/actions/developer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Terminal, Copy, RefreshCcw, ShieldAlert, BookOpen } from "lucide-react";
import { UpgradeButton } from "@/components/UpgradeButton";
import { APP_URL } from "@/lib/config";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Developer Portal | Decision Jar",
    description: "Manage your API keys, view usage, and access developer documentation.",
};

export default async function DeveloperPortal() {
    const session = await getSession();
    if (!session?.user) {
        redirect("/login?callbackUrl=/developers");
    }

    const apiKeys = await prisma.apiKey.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    const activeKey = apiKeys.find((k: ApiKey) => k.isActive);

    return (
        <div className="container mx-auto px-6 max-w-4xl pt-24 pb-10 space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Developer Portal</h1>
                <p className="text-muted-foreground">
                    Manage your API keys and monitor usage for the Ideas Generator API.
                </p>
            </div>

            {/* Active Plan / Key Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>API Keys</span>
                        {activeKey && (
                            <Badge variant={activeKey.tier === 'FREE' ? 'secondary' : 'default'}>
                                {activeKey.tier} TIER
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        {activeKey
                            ? "Use this key to authenticate your requests."
                            : "Generate an API key to start building."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {activeKey ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-muted rounded-md flex items-center justify-between font-mono text-sm break-all">
                                <span>{activeKey.key}</span>
                                {/* Client-side copy button would go here, omitting for SSR simplicity */}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Monthly Usage</span>
                                    <span>{activeKey.usedThisMonth} / {activeKey.monthlyLimit === -1 ? '∞' : activeKey.monthlyLimit}</span>
                                </div>
                                <Progress value={activeKey.monthlyLimit > 0 ? (activeKey.usedThisMonth / activeKey.monthlyLimit) * 100 : 0} />
                                <p className="text-xs text-muted-foreground text-right">
                                    Resets on {activeKey.resetAt.toLocaleDateString()}
                                </p>
                            </div>

                            <form action={async () => {
                                'use server';
                                await revokeApiKey(activeKey.id);
                            }}>
                                <Button variant="destructive" size="sm">
                                    <ShieldAlert className="w-4 h-4 mr-2" />
                                    Revoke Key
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-6 space-y-4 border-2 border-dashed rounded-lg">
                            <div className="p-3 bg-muted rounded-full">
                                <Terminal className="w-6 h-6" />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="font-semibold">No Active Key</h3>
                                <p className="text-sm text-muted-foreground">Generate a key to access the API.</p>
                            </div>
                            <form action={async () => {
                                'use server';
                                await generateApiKey('FREE'); // Default to Free for now
                            }}>
                                <Button>Generate New Key</Button>
                            </form>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Resources & Docs */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Interactive Playground</CardTitle>
                        <CardDescription>Test the API live with your key.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <a href="/developers/docs" className="block w-full">
                            <Button variant="outline" className="w-full">
                                <Terminal className="w-4 h-4 mr-2" />
                                Open Playground
                            </Button>
                        </a>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>API Documentation</CardTitle>
                        <CardDescription>Read the complete integration guide.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <a href="/developers/guide" className="block w-full">
                            <Button variant="outline" className="w-full">
                                <BookOpen className="w-4 h-4 mr-2" />
                                View Documentation
                            </Button>
                        </a>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Start */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Start</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
                        <pre>{`curl -X POST ${APP_URL}/api/ideas/generate \\
  -H "Authorization: Bearer ${activeKey?.key || '<YOUR_KEY>'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "Suggest 3 romantic dinner ideas",
    "location": "New York" 
  }'`}</pre>
                    </div>
                </CardContent>
            </Card>

            {/* Pricing / Upgrade Section */}
            {activeKey && activeKey.tier === 'FREE' && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold tracking-tight">Upgrade Plan</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="border-muted-foreground/20">
                            <CardHeader>
                                <CardTitle>API Starter</CardTitle>
                                <CardDescription>For growing apps</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-3xl font-bold">$29<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                                <ul className="text-sm space-y-3">
                                    <li className="flex items-center">✨ <span className="ml-2">1,000 requests/mo</span></li>
                                    <li className="flex items-center">✅ <span className="ml-2">All Topics Unlocked</span></li>
                                    <li className="flex items-center">🚀 <span className="ml-2">Commercial Use</span></li>
                                </ul>
                                <UpgradeButton priceId={process.env.STRIPE_PRICE_API_STARTER!} apiKeyId={activeKey.id} label="Upgrade to Starter" />
                            </CardContent>
                        </Card>

                        <Card className="border-primary/20 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    API Pro
                                    <Badge>POPULAR</Badge>
                                </CardTitle>
                                <CardDescription>For commercial scale</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-3xl font-bold">$49<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                                <ul className="text-sm space-y-3">
                                    <li className="flex items-center">🚀 <span className="ml-2">5,000 requests/mo</span></li>
                                    <li className="flex items-center">✅ <span className="ml-2">All Topics Unlocked</span></li>
                                    <li className="flex items-center">⚡ <span className="ml-2">Priority Support</span></li>
                                </ul>
                                <UpgradeButton priceId={process.env.STRIPE_PRICE_API_PRO!} apiKeyId={activeKey.id} label="Upgrade to Pro" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* History (Revoked Keys) */}
            {apiKeys.length > (activeKey ? 1 : 0) && (
                <div className="space-y-4 pt-8 border-t">
                    <h3 className="text-lg font-semibold">Key History</h3>
                    <div className="border rounded-md divide-y">
                        {apiKeys.filter((k: ApiKey) => !k.isActive).map((key: ApiKey) => (
                            <div key={key.id} className="p-4 flex justify-between items-center opacity-60">
                                <div className="space-y-1">
                                    <div className="font-mono text-sm line-through">{key.key.substring(0, 12)}...</div>
                                    <div className="text-xs text-muted-foreground">
                                        Created: {key.createdAt.toLocaleDateString()} • Tier: {key.tier}
                                    </div>
                                </div>
                                <Badge variant="outline">Revoked</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
