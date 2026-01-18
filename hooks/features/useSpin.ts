
import { useState, useRef } from "react";
import { SoundEffects, triggerHaptic } from "@/lib/feedback";
import { spinJar } from "@/app/actions/spin";
import { showError } from "@/lib/toast";
import { Idea } from "@/lib/types";
import { useModalSystem } from "@/components/ModalProvider";

interface UseSpinProps {
    ideas: Idea[];
    onSpinComplete: () => void;
    disabled?: boolean;
}

export function useSpin({ ideas, onSpinComplete, disabled }: UseSpinProps) {
    const [isSpinning, setIsSpinning] = useState(false);
    const { openModal, activeModal } = useModalSystem();
    const tickLoopRef = useRef<NodeJS.Timeout | null>(null);

    const startSpinAnimation = () => {
        setIsSpinning(true);
        const spinDuration = 20000; // Long max duration, we expect to be stopped manually or by timer
        const tickInterval = 150;
        let elapsed = 0;

        if (tickLoopRef.current) clearInterval(tickLoopRef.current);

        tickLoopRef.current = setInterval(() => {
            SoundEffects.playTick();
            triggerHaptic(10);
            elapsed += tickInterval;
            if (elapsed >= spinDuration && tickLoopRef.current) clearInterval(tickLoopRef.current);
        }, tickInterval);
    };

    const stopSpinAnimation = () => {
        if (tickLoopRef.current) clearInterval(tickLoopRef.current);
        setIsSpinning(false);
        triggerHaptic([50, 50, 50]);
        SoundEffects.playFanfare();
    };

    /**
     * Triggered when THIS user clicks Spin.
     * Broadcasts events to others.
     */
    const handleSpinJar = async (
        filters: any = {},
        callbacks?: { onBroadcastStart?: () => void; onBroadcastResult?: (idea: any) => void }
    ) => {
        if (disabled) return;

        if (ideas.length === 0) {
            showError("Add some ideas first!");
            return;
        }

        // 1. Broadcast Start
        callbacks?.onBroadcastStart?.();

        // 2. Start Local Animation
        startSpinAnimation();

        try {
            // 3. Wait minimum time for effect
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 4. Fetch Result
            const res = await spinJar(filters);

            // 5. Stop Animation
            stopSpinAnimation();

            if (res.success) {
                // 6. Broadcast Result & Show Local
                callbacks?.onBroadcastResult?.(res.idea);
                openModal('DATE_REVEAL', { idea: res.idea });
                onSpinComplete();
                window.dispatchEvent(new Event('pwa-prompt-ready'));
            } else {
                showError(res.error || "Failed to pick a date. Try adding more ideas!");
            }
        } catch (error) {
            console.error(error);
            stopSpinAnimation();
        }
    };

    /**
     * Triggered when ANOTHER user started spinning.
     */
    const handleExternalSpinStart = () => {
        // Block external spins if:
        // 1. We are in a disabled state (onboarding/loading)
        // 2. We have a modal open (don't want background spinning/noise distracting from current task)
        // Note: Removed ideas.length check so users can see spin even if their local list isn't fully synced or populated yet.
        if (disabled || activeModal !== null) return;
        startSpinAnimation();
    };

    /**
     * Triggered when ANOTHER user finishes spinning.
     */
    const handleExternalSpinComplete = (idea: any) => {
        stopSpinAnimation();
        openModal('DATE_REVEAL', { idea, isViewOnly: true });
    };

    return {
        isSpinning,
        handleSpinJar,
        handleExternalSpinStart,
        handleExternalSpinComplete
    };
}
