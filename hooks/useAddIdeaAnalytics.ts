import { useState, useEffect, useRef } from 'react';
import { trackModalAbandoned } from "@/lib/analytics";

interface UseAddIdeaAnalyticsProps {
    isOpen: boolean;
    isWizardMode: boolean;
    isEditMode: boolean;
}

export function useAddIdeaAnalytics({ isOpen, isWizardMode, isEditMode }: UseAddIdeaAnalyticsProps) {
    const [modalOpenTime, setModalOpenTime] = useState<number | null>(null);
    const [hadInteraction, setHadInteraction] = useState(false);
    const ideaWasAdded = useRef(false);

    useEffect(() => {
        if (isOpen) {
            setModalOpenTime(Date.now());
            setHadInteraction(false);
            ideaWasAdded.current = false;
        }
    }, [isOpen]);

    const markInteraction = () => setHadInteraction(true);
    const markAdded = () => {
        setHadInteraction(true);
        ideaWasAdded.current = true;
    };

    const trackAbandonment = () => {
        if (modalOpenTime && !ideaWasAdded.current) {
            const timeOpenSeconds = (Date.now() - modalOpenTime) / 1000;
            trackModalAbandoned('add_idea', timeOpenSeconds, hadInteraction, {
                mode: isWizardMode ? 'wizard' : 'form',
                is_edit: isEditMode
            });
        }
    };

    return {
        markInteraction,
        markAdded,
        trackAbandonment
    };
}
