import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { useModalSystem } from "@/components/ModalProvider";
import { UserData } from "@/lib/types";

interface UsePWAHandlerProps {
    userData: UserData | null;
    isLoadingUser: boolean;
    isPremium: boolean;
    refreshUser: () => void;
}

export function usePWAHandler({ userData, isLoadingUser, isPremium, refreshUser }: UsePWAHandlerProps) {
    const searchParams = useSearchParams();
    const { openModal } = useModalSystem();

    useEffect(() => {
        const tool = searchParams?.get('tool');
        if (!tool) return;

        trackEvent('pwa_shortcut_used', { tool, from_home_screen: true });

        const checkAndOpenTool = async () => {
            if (isLoadingUser || !userData) {
                setTimeout(checkAndOpenTool, 100);
                return;
            }

            if (!isPremium) {
                trackEvent('pwa_shortcut_blocked', { tool, reason: 'requires_premium' });
                openModal('PREMIUM');
                return;
            }

            // Auto-select jar if strictly necessary
            if (!userData.activeJarId && userData.memberships && userData.memberships.length > 0) {
                const firstJar = userData.memberships[0];
                try {
                    await fetch('/api/jar/set-active', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ jarId: firstJar.jarId }),
                    });
                    trackEvent('pwa_shortcut_jar_auto_selected', { tool, jarId: firstJar.jarId });
                    refreshUser();
                } catch (error) {
                    console.error('Failed to auto-select jar:', error);
                }
            }

            trackEvent('pwa_shortcut_opened', { tool, user_type: 'premium' });

            switch (tool) {
                case 'dining': openModal('CONCIERGE', { toolId: 'DINING' }); break;
                case 'bar': openModal('CONCIERGE', { toolId: 'BAR' }); break;
                case 'weekend': openModal('WEEKEND_PLANNER'); break;
                case 'movie': openModal('CONCIERGE', { toolId: 'MOVIE' }); break;
                default: console.warn(`Unknown PWA shortcut tool: ${tool}`);
            }
        };

        checkAndOpenTool();
    }, [searchParams, isPremium, isLoadingUser, userData, openModal, refreshUser]);
}
