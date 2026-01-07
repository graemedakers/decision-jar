import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { UserData } from "@/lib/types";

interface UseUrlSyncProps {
    userData: UserData | null;
    onJarSwitched: () => void;
}

export function useUrlSync({ userData, onJarSwitched }: UseUrlSyncProps) {
    const searchParams = useSearchParams();

    useEffect(() => {
        const jarIdInUrl = searchParams?.get('jar');
        if (jarIdInUrl && userData && jarIdInUrl !== userData.activeJarId) {
            const switchJar = async () => {
                try {
                    const res = await fetch(`/api/jar/${jarIdInUrl}/switch`, {
                        method: 'POST',
                    });
                    if (res.ok) {
                        // Clear the param and refresh
                        const newParams = new URLSearchParams(window.location.search);
                        newParams.delete('jar');
                        const newUrl = window.location.pathname + (newParams.toString() ? '?' + newParams.toString() : '');
                        window.history.replaceState({}, '', newUrl);
                        onJarSwitched();
                    }
                } catch (error) {
                    console.error('Failed to switch jar from URL:', error);
                }
            };
            switchJar();
        }
    }, [searchParams, userData, onJarSwitched]);
}
