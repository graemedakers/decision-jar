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
export const trackPathSelected = (pathType: 'smart_input' | 'concierge' | 'templates' | string, data?: Record<string, any>) => {
    safeCapture('path_selected', {
        path: pathType,
        ...data
    });
};

// Modal tracking
export const trackModalOpened = (modalType: string, data?: Record<string, any>) => {
    const sessionId = sessionStorage.getItem('sessionId');
    const sessionStartTime = sessionStorage.getItem('sessionStartTime');
    
    safeCapture('modal_opened', {
        modal_type: modalType,
        session_id: sessionId,
        session_start_time: sessionStartTime,
        ...data
    });
};

export const trackModalAbandoned = (modalType: string, reason: string | number, hadInteraction?: boolean | any, data?: any) => {
    const sessionId = sessionStorage.getItem('sessionId');
    
    // Handle both old format (reason, data) and new format (timeOpenSeconds, hadInteraction, data)
    let properties: Record<string, any> = {
        modal_type: modalType,
        session_id: sessionId,
    };
    
    if (typeof reason === 'string') {
        // Old format: trackModalAbandoned(modalType, reason, data)
        properties.reason = reason;
        if (hadInteraction && typeof hadInteraction === 'object') {
            properties = { ...properties, ...hadInteraction };
        }
    } else {
        // New format: trackModalAbandoned(modalType, timeOpenSeconds, hadInteraction, data)
        properties.time_open_seconds = reason;
        if (typeof hadInteraction === 'boolean') {
            properties.had_interaction = hadInteraction;
        }
        if (data && typeof data === 'object') {
            properties = { ...properties, ...data };
        }
    }
    
    safeCapture('modal_abandoned', properties);
};

// Concierge tracking
export const trackConciergeSkillSelected = (
    skillId: string, 
    skillNameOrMethod: string, 
    methodOrData?: 'manual' | 'auto-routed' | Record<string, any>
) => {
    let properties: Record<string, any> = {
        skill_id: skillId,
    };
    
    if (typeof methodOrData === 'object') {
        // New format: trackConciergeSkillSelected(skillId, method, data)
        properties.method = skillNameOrMethod;
        properties = { ...properties, ...methodOrData };
    } else {
        // Old format: trackConciergeSkillSelected(skillId, skillName, method)
        properties.skill_name = skillNameOrMethod;
        properties.method = methodOrData || 'manual';
    }
    
    safeCapture('concierge_skill_selected', properties);
};

export const trackIntentDetectionResult = (
    input: string, 
    topIntentId: string | null, 
    topIntentScoreOrRouted: number | boolean, 
    thresholdOrCorrectedSkill?: number | string
) => {
    let properties: Record<string, any> = {
        input_text: input.substring(0, 100), // Limit PII
        top_intent_id: topIntentId,
    };
    
    if (typeof topIntentScoreOrRouted === 'boolean') {
        // Simplified format: trackIntentDetectionResult(input, intentId, routed, correctedSkill?)
        properties.routed = topIntentScoreOrRouted;
        if (thresholdOrCorrectedSkill && typeof thresholdOrCorrectedSkill === 'string') {
            properties.corrected_skill_id = thresholdOrCorrectedSkill;
        }
    } else {
        // Full format: trackIntentDetectionResult(input, intentId, score, threshold)
        properties.top_intent_score = topIntentScoreOrRouted;
        const threshold = typeof thresholdOrCorrectedSkill === 'number' ? thresholdOrCorrectedSkill : 0.05;
        properties.threshold = threshold;
        properties.routed = topIntentScoreOrRouted >= threshold;
    }
    
    safeCapture('intent_detection_result', properties);
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

export const trackTemplateUsed = (templateId: string, templateName: string, actionOrIdeaCount: string | number) => {
    let properties: Record<string, any> = {
        template_id: templateId,
        template_name: templateName,
    };
    
    if (typeof actionOrIdeaCount === 'string') {
        // New format: trackTemplateUsed(templateId, templateName, action)
        properties.action = actionOrIdeaCount;
    } else {
        // Old format: trackTemplateUsed(templateName, ideaCount) - for backward compatibility
        properties.idea_count = actionOrIdeaCount;
    }
    
    safeCapture('template_used', properties);
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
export const trackSignup = (
    method: 'email' | 'google' | 'facebook' | string, 
    utmSourceOrProperties?: string | Record<string, any>,
    utmMedium?: string,
    utmCampaign?: string
) => {
    let properties: Record<string, any> = {
        method: method,
    };
    
    if (typeof utmSourceOrProperties === 'object') {
        // Format: trackSignup(method, properties)
        properties = { ...properties, ...utmSourceOrProperties };
    } else if (typeof utmSourceOrProperties === 'string') {
        // Format: trackSignup(method, utmSource, utmMedium, utmCampaign)
        if (utmSourceOrProperties) properties.utm_source = utmSourceOrProperties;
        if (utmMedium) properties.utm_medium = utmMedium;
        if (utmCampaign) properties.utm_campaign = utmCampaign;
    }
    
    safeCapture('signup', properties);
};

// Share tracking
export const trackShareClicked = (method: string, content: string) => {
    safeCapture('share_clicked', {
        method: method,
        content: content
    });
};
