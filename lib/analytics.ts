import posthog from 'posthog-js';

// Safe capture wrapper (handles DNS errors, PostHog not loaded, etc.)
function safeCapture(eventName: string, properties?: Record<string, any>) {
    if (typeof window === 'undefined') return; // SSR guard
    try {
        if (posthog && posthog.capture) {
            posthog.capture(eventName, properties);
        }
    } catch (error) {
        // Silently fail (don't break user experience for analytics)
        console.warn('Analytics capture failed:', error);
    }
}

// Generic event tracker
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    safeCapture(eventName, properties);
};

// User identification
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    try {
        if (posthog && posthog.identify) {
            posthog.identify(userId, traits);
        }
    } catch (error) {
        console.warn('User identification failed:', error);
    }
};

// Path selection tracking
export const trackPathSelected = (pathType: 'smart_input' | 'concierge' | 'templates') => {
    safeCapture('path_selected', {
        path: pathType,
    });
};

// Modal tracking
export const trackModalOpened = (modalType: string) => {
    const sessionId = sessionStorage.getItem('sessionId');
    const sessionStartTime = sessionStorage.getItem('sessionStartTime');
    
    safeCapture('modal_opened', {
        modal_type: modalType,
        session_id: sessionId,
        session_start_time: sessionStartTime,
    });
};

export const trackModalAbandoned = (modalType: string, reason: string, data?: any) => {
    const sessionId = sessionStorage.getItem('sessionId');
    
    safeCapture('modal_abandoned', {
        modal_type: modalType,
        reason: reason,
        session_id: sessionId,
        ...data
    });
};

// Concierge tracking
export const trackConciergeSkillSelected = (skillId: string, skillName: string, method: 'manual' | 'auto-routed') => {
    safeCapture('concierge_skill_selected', {
        skill_id: skillId,
        skill_name: skillName,
        method: method,
    });
};

export const trackIntentDetectionResult = (input: string, topIntentId: string | null, topIntentScore: number, threshold: number) => {
    safeCapture('intent_detection_result', {
        input_text: input.substring(0, 100), // Limit PII
        top_intent_id: topIntentId,
        top_intent_score: topIntentScore,
        threshold: threshold,
        routed: topIntentScore >= threshold,
    });
};

export const trackAIToolUsed = (toolName: string, properties?: Record<string, any>) => {
    safeCapture('ai_tool_used', {
        tool_name: toolName,
        ...properties
    });
};

// Idea tracking
export const trackIdeaAdded = (source: 'manual' | 'template' | 'concierge', jarId: string) => {
    const sessionId = sessionStorage.getItem('sessionId');
    const sessionStartTime = sessionStorage.getItem('sessionStartTime');
    
    // Calculate time to first idea if this is the first one
    const firstIdeaTracked = sessionStorage.getItem('firstIdeaTracked');
    let timeToFirstIdea = null;
    if (!firstIdeaTracked && sessionStartTime) {
        const startTime = parseInt(sessionStartTime, 10);
        timeToFirstIdea = Date.now() - startTime;
        sessionStorage.setItem('firstIdeaTracked', 'true');
    }
    
    safeCapture('idea_added', {
        source: source,
        jar_id: jarId,
        session_id: sessionId,
        time_to_first_idea: timeToFirstIdea,
    });
};

// Template tracking
export const trackTemplateBrowserOpened = () => {
    safeCapture('template_browser_opened', {});
};

export const trackTemplateBrowsed = () => {
    safeCapture('template_browser_opened', {}); // Alias for backward compatibility
};

export const trackTemplateUsed = (templateName: string, ideaCount: number) => {
    safeCapture('template_used', {
        template_name: templateName,
        idea_count: ideaCount,
    });
};

// Shortcut tracking
export const trackConciergeShortcutCreated = (toolId: string, toolName: string, method: 'native_share' | 'clipboard' | 'download') => {
    safeCapture('concierge_shortcut_created', {
        tool_id: toolId,
        tool_name: toolName,
        method: method,
    });
};

// Streak tracking
export const trackStreakContinued = (jarId: string, currentStreak: number) => {
    safeCapture('streak_continued', {
        jar_id: jarId,
        current_streak: currentStreak,
    });
};

export const trackStreakLost = (jarId: string, previousStreak: number) => {
    safeCapture('streak_lost', {
        jar_id: jarId,
        previous_streak: previousStreak,
    });
};

export const trackStreakMilestoneReached = (jarId: string, milestone: number) => {
    safeCapture('streak_milestone_reached', {
        jar_id: jarId,
        milestone: milestone,
    });
};

// Achievement tracking
export const trackAchievementUnlocked = (achievementId: string, achievementTitle: string, category: string, jarId: string) => {
    safeCapture('achievement_unlocked', {
        achievement_id: achievementId,
        achievement_title: achievementTitle,
        category: category,
        jar_id: jarId,
    });
};

export const trackAchievementNotificationShown = (achievementId: string, achievementTitle: string, displayMethod: 'toast' | 'modal') => {
    safeCapture('achievement_notification_shown', {
        achievement_id: achievementId,
        achievement_title: achievementTitle,
        display_method: displayMethod,
    });
};

// Signup tracking
export const trackSignup = (method: 'email' | 'google' | 'facebook', properties?: Record<string, any>) => {
    safeCapture('signup', {
        method: method,
        ...properties
    });
};

// Share tracking
export const trackShareClicked = (method: string, content: string) => {
    safeCapture('share_clicked', {
        method: method,
        content: content
    });
};
