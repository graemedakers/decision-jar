"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Loader2, Play } from "lucide-react";

const TOPICS = [
    { value: "DINING", label: "Dining" },
    { value: "MOVIE", label: "Movie" },
    { value: "BOOK", label: "Book" },
    { value: "WEEKEND_EVENTS", label: "Weekend Events (Pro)" },
    { value: "GIFT_IDEAS", label: "Gift Ideas (Pro)" },
    { value: "TRAVEL_ITINERARY", label: "Travel Itinerary (Pro)" },
];

export function PlaygroundClient({ initialKey }: { initialKey: string }) {
    const [apiKey, setApiKey] = useState(initialKey);
    const [query, setQuery] = useState("Suggest a romantic dinner place");
    const [location, setLocation] = useState("New York, NY");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [status, setStatus] = useState<number | null>(null);

    const handleRun = async () => {
        setLoading(true);
        setResponse(null);
        setStatus(null);

        try {
            const res = await fetch("/api/ideas/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    query,
                    location
                })
            });

            setStatus(res.status);
            const data = await res.json();
            setResponse(data);
        } catch (e) {
            console.error(e);
            setStatus(500);
            setResponse({ error: "Client-side error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Request</CardTitle>
                    <CardDescription>Configure your API request</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input
                            id="apiKey"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk_live_..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="query">Query / Prompt</Label>
                        <Input
                            id="query"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g. Recommend a sci-fi book"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location (Optional)</Label>
                        <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. San Francisco"
                        />
                    </div>

                    <Button onClick={handleRun} disabled={loading} className="w-full">
                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                        Send Request
                    </Button>
                </CardContent>
            </Card>

            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle>Response</CardTitle>
                    <CardDescription>
                        Status: {status !== null ? <span className={status === 200 ? "text-green-500 font-bold" : "text-red-500 font-bold"}>{status}</span> : "Ready"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 bg-slate-950 rounded-b-lg m-1">
                    <pre className="text-slate-50 font-mono text-xs p-4 overflow-auto h-[400px]">
                        {response ? JSON.stringify(response, null, 2) : "// Response will appear here..."}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}
