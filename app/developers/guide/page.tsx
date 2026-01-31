import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function ApiGuide() {
    const session = await getSession();
    if (!session?.user) {
        redirect("/login?callbackUrl=/developers/guide");
    }

    return (
        <div className="container mx-auto px-6 max-w-4xl pt-24 pb-10 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
                <p className="text-muted-foreground">
                    Comprehensive guide to the Ideas Generator API.
                </p>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">

                {/* Authentication */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">Authentication</h2>
                    <p>
                        All API requests must be authenticated using an <strong>API Key</strong> via the Authorization header.
                    </p>
                    <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-sm">
                        Authorization: Bearer &lt;YOUR_API_KEY&gt;
                    </div>
                </section>

                {/* Endpoint */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">Endpoint: Generate Ideas</h2>
                    <div className="flex items-center space-x-2">
                        <Badge>POST</Badge>
                        <code className="bg-muted px-2 py-1 rounded">https://spinthejar.com/api/ideas/generate</code>
                    </div>

                    <h3 className="text-xl font-semibold">Request Body</h3>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                <tr className="border-b">
                                    <th className="h-12 px-4 align-middle">Field</th>
                                    <th className="h-12 px-4 align-middle">Type</th>
                                    <th className="h-12 px-4 align-middle">Required</th>
                                    <th className="h-12 px-4 align-middle">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 font-mono">query</td>
                                    <td className="p-4">string</td>
                                    <td className="p-4">Yes</td>
                                    <td className="p-4">Natural language description (e.g., "Romantic dinner")</td>
                                </tr>
                                <tr className="transition-colors hover:bg-muted/50">
                                    <td className="p-4 font-mono">location</td>
                                    <td className="p-4">string</td>
                                    <td className="p-4">No</td>
                                    <td className="p-4">Specific location context (e.g., "London")</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Topics */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">Plans & Topic Availability</h2>
                    <Card>
                        <div className="rounded-md border-t pt-2"> {/* Added wrapper or adjust Card usage if Card uses div */}
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-medium">
                                    <tr className="border-b">
                                        <th className="h-12 px-4 align-middle">Topic</th>
                                        <th className="h-12 px-4 align-middle text-center">Free Tier</th>
                                        <th className="h-12 px-4 align-middle text-center">Paid Tiers</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4">Dining, Movies, Books</td>
                                        <td className="p-4 text-center">✅</td>
                                        <td className="p-4 text-center">✅</td>
                                    </tr>
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4">Bars, Nightlife, Travel</td>
                                        <td className="p-4 text-center">❌</td>
                                        <td className="p-4 text-center">✅</td>
                                    </tr>
                                    <tr className="transition-colors hover:bg-muted/50">
                                        <td className="p-4">Wellness, Events, Gifting</td>
                                        <td className="p-4 text-center">❌</td>
                                        <td className="p-4 text-center">✅</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </section>

                {/* Quotas */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">Rate Limits</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Free:</strong> 100 requests / month</li>
                        <li><strong>Starter:</strong> 1,000 requests / month</li>
                        <li><strong>Pro:</strong> 5,000 requests / month</li>
                    </ul>
                    <p className="text-muted-foreground text-sm">
                        Quotas reset monthly based on your API key creation date. Check reponse headers `X-RateLimit-Remaining` for current status.
                    </p>
                </section>
            </div>
        </div>
    );
}
