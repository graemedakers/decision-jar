import { useState } from "react";
import { SoundEffects, triggerHaptic } from "@/lib/feedback";
import { spinJar } from "@/app/actions/spin";
import { showError } from "@/lib/toast";
import { Idea } from "@/lib/types";
import { useModalSystem } from "@/components/ModalProvider";

interface UseSpinProps {
    ideas: Idea[];
    onSpinComplete: () => void;
}

export function useSpin({ ideas, onSpinComplete }: UseSpinProps) {
    const [isSpinning, setIsSpinning] = useState(false);
    const { openModal } = useModalSystem();

    const handleSpinJar = async (filters: any = {}) => {
        if (ideas.length === 0) {
            showError("Add some ideas first!");
            return;
        }
        setIsSpinning(true);

        // Animation Loop
        const spinDuration = 2000;
        const tickInterval = 150;
        let elapsed = 0;

        const tickLoop = setInterval(() => {
            SoundEffects.playTick();
            triggerHaptic(10);
            elapsed += tickInterval;
            if (elapsed >= spinDuration) clearInterval(tickLoop);
        }, tickInterval);

        await new Promise(resolve => setTimeout(resolve, spinDuration));

        clearInterval(tickLoop);
        triggerHaptic([50, 50, 50]);
        SoundEffects.playFanfare();

        try {
            const res = await spinJar(filters);

            if (res.success) {
                openModal('DATE_REVEAL', { idea: res.idea });
                onSpinComplete();
            } else {
                showError(res.error || "Failed to pick a date. Try adding more ideas!");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSpinning(false);
        }
    };

    return {
        isSpinning,
        handleSpinJar
    };
}
