import { useState } from "react";
import { getApiUrl } from "@/lib/utils";

interface UseMagicIdeaProps {
    jarTopic?: string | null;
    currentUser?: any;
    onIdeaGenerated: (idea: any) => void;
}

export function useMagicIdea({ jarTopic, currentUser, onIdeaGenerated }: UseMagicIdeaProps) {
    const [isLoading, setIsLoading] = useState(false);

    const randomize = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/magic-idea'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: jarTopic,
                    location: currentUser?.location
                })
            });
            if (res.ok) {
                const randomIdea = await res.json();
                if (randomIdea) {
                    onIdeaGenerated(randomIdea);
                }
            }
        } catch (e) {
            console.error("Magic fill failed", e);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        randomize,
        isLoading
    };
}
