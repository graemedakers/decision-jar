
/**
 * Client-side Analytics Helper
 */

export const trackEvent = async (
    name: string,
    type: 'VIEW' | 'ACTION' | 'WEB_VITALS' | 'ERROR' = 'ACTION',
    value?: number,
    metadata: any = {}
) => {
    if (typeof window === 'undefined') return;

    try {
        // Ensure session ID exists
        let sessionId = localStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('analytics_session_id', sessionId);
        }

        await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                type,
                value,
                metadata,
                sessionId,
                path: window.location.pathname
            })
        });
    } catch (e) {
        // Silent fail to not impact user experience
        console.warn('Analytics track failed', e);
    }
};
