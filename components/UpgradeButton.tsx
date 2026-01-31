"use client";

import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function UpgradeButton({ priceId, apiKeyId, label }: { priceId: string, apiKeyId: string, label: string }) {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId,
                    mode: 'subscription',
                    metadata: {
                        type: 'API_UPGRADE',
                        apiKeyId
                    }
                })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Checkout failed');
                setLoading(false);
            }
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleUpgrade} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {label}
        </Button>
    );
}
