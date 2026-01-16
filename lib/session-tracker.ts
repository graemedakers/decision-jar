/**
 * Session Tracker for Time-to-First-Idea Analytics
 * 
 * Tracks the time from dashboard load to first idea added
 */

const SESSION_START_KEY = 'dashboard_session_start';
const FIRST_IDEA_TRACKED_KEY = 'first_idea_tracked_this_session';

export class SessionTracker {
    /**
     * Initialize session tracking when dashboard loads
     */
    static initSession() {
        if (typeof window === 'undefined') return;
        
        // Only set if not already set (prevents reset on hot reload in dev)
        if (!sessionStorage.getItem(SESSION_START_KEY)) {
            sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
            sessionStorage.removeItem(FIRST_IDEA_TRACKED_KEY); // Clear previous session flag
        }
    }

    /**
     * Get the time elapsed since session start in seconds
     */
    static getSessionDuration(): number {
        if (typeof window === 'undefined') return 0;
        
        const startTime = sessionStorage.getItem(SESSION_START_KEY);
        if (!startTime) return 0;
        
        return (Date.now() - parseInt(startTime, 10)) / 1000;
    }

    /**
     * Check if first idea has been tracked in this session
     */
    static hasTrackedFirstIdea(): boolean {
        if (typeof window === 'undefined') return false;
        return sessionStorage.getItem(FIRST_IDEA_TRACKED_KEY) === 'true';
    }

    /**
     * Mark that first idea has been tracked
     */
    static markFirstIdeaTracked() {
        if (typeof window === 'undefined') return;
        sessionStorage.setItem(FIRST_IDEA_TRACKED_KEY, 'true');
    }

    /**
     * Reset session (useful for testing)
     */
    static resetSession() {
        if (typeof window === 'undefined') return;
        sessionStorage.removeItem(SESSION_START_KEY);
        sessionStorage.removeItem(FIRST_IDEA_TRACKED_KEY);
    }

    /**
     * Get session ID for grouping related events
     */
    static getSessionId(): string {
        if (typeof window === 'undefined') return 'server';
        
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
        return sessionId;
    }
}
