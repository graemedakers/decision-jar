import { posthog } from './posthog'
import { SessionTracker } from './session-tracker'

// Template Events
export const trackTemplateBrowsed = () => {
    posthog.capture('template_browser_opened')
}

export const trackTemplateUsed = (templateId: string, templateName: string, method: 'new_jar' | 'add_to_current') => {
    posthog.capture('template_used', {
        template_id: templateId,
        template_name: templateName,
        method: method,
    })
}

// Share Events
export const trackShareClicked = (source: string, contentType: string) => {
    posthog.capture('share_clicked', {
        source: source, // e.g., 'dining_concierge', 'bar_concierge', 'movie_scout'
        content_type: contentType, // e.g., 'restaurant', 'bar', 'movie'
    })
}

// AI Tool Events
export const trackAIToolUsed = (toolName: string, preferences?: Record<string, any>) => {
    posthog.capture('ai_tool_used', {
        tool_name: toolName,
        ...preferences,
    })
}

export const trackAIRecommendation = (toolName: string, recommendationName: string) => {
    posthog.capture('ai_recommendation_received', {
        tool_name: toolName,
        recommendation: recommendationName,
    })
}

// Jar Events
export const trackJarCreated = (source: 'template' | 'manual' | 'empty', templateId?: string) => {
    posthog.capture('jar_created', {
        source: source,
        template_id: templateId,
    })
}

export const trackIdeaAdded = (method: 'manual' | 'ai' | 'template', source?: string) => {
    posthog.capture('idea_added', {
        method: method,
        source: source,
    })
    
    // Track time to first idea if this is the first idea in the session
    if (!SessionTracker.hasTrackedFirstIdea()) {
        const duration = SessionTracker.getSessionDuration();
        trackTimeToFirstIdea(duration, getSourceCategory(method, source), {
            session_id: SessionTracker.getSessionId()
        });
        SessionTracker.markFirstIdeaTracked();
    }
}

// Helper to convert method/source to path category
function getSourceCategory(method: 'manual' | 'ai' | 'template', source?: string): 'smart_input' | 'concierge' | 'template' | 'manual' {
    if (method === 'template') return 'template';
    if (method === 'ai' || source?.includes('concierge')) return 'concierge';
    if (source?.includes('smart_input') || source?.includes('url') || source?.includes('image')) return 'smart_input';
    return 'manual';
}

// User Events
export const trackSignup = async (method: string, utmSource?: string, utmMedium?: string, utmCampaign?: string) => {
    posthog.capture('signup_completed', {
        method: method,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
    })
    // Wait a bit to ensure event is sent before redirect
    await new Promise(resolve => setTimeout(resolve, 300))
}

export const trackLogin = (method: string) => {
    posthog.capture('login_completed', {
        method: method,
    })
}

// Feature Usage
export const trackFeatureUsed = (featureName: string, details?: Record<string, any>) => {
    posthog.capture('feature_used', {
        feature: featureName,
        ...details,
    })
}

// Spin Events
export const trackJarSpun = (ideaCount: number, hasFilters: boolean) => {
    posthog.capture('jar_spun', {
        idea_count: ideaCount,
        has_filters: hasFilters,
    })
}

// Identify user (call after login)
export const identifyUser = (userId: string, properties?: Record<string, any>) => {
    posthog.identify(userId, properties)
}

// Reset on logout
export const resetAnalytics = () => {
    posthog.reset()
}

// Generic event tracking (for backward compatibility)
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    posthog.capture(eventName, properties)
}

// ===== THREE-PATH STRATEGY ANALYTICS =====

// Path Selection Events
export const trackPathSelected = (
    path: '1_have_idea' | '2_need_inspiration' | '3_browse_templates',
    metadata?: {
        session_start_time?: number
        previous_path?: string
        trigger?: string
    }
) => {
    posthog.capture('path_selected', {
        path: path,
        timestamp: Date.now(),
        ...metadata,
    })
}

// Enhanced Concierge Tracking
export const trackConciergeSkillSelected = (
    skillId: string,
    via: 'picker' | 'intent_detection' | 'direct_link',
    metadata?: {
        user_input?: string
        confidence?: number
        was_corrected?: boolean
        available_skills_count?: number
    }
) => {
    posthog.capture('concierge_skill_selected', {
        skill_id: skillId,
        selection_method: via,
        timestamp: Date.now(),
        ...metadata,
    })
}

// Time to First Idea
export const trackTimeToFirstIdea = (
    durationSeconds: number,
    source: 'smart_input' | 'concierge' | 'template' | 'manual',
    metadata?: {
        path_used?: string
        session_id?: string
    }
) => {
    posthog.capture('time_to_first_idea', {
        duration_seconds: durationSeconds,
        source: source,
        met_5s_goal: durationSeconds <= 5,
        met_10s_goal: durationSeconds <= 10,
        ...metadata,
    })
}

// Modal Abandonment
export const trackModalAbandoned = (
    modalType: string,
    timeOpenSeconds: number,
    hadInteraction: boolean,
    metadata?: {
        last_field_touched?: string
        completion_percent?: number
        reason?: string
        mode?: string
        is_edit?: boolean
        skill_id?: string
        had_skill_selected?: boolean
        templates_expanded?: number
    }
) => {
    posthog.capture('modal_abandoned', {
        modal_type: modalType,
        time_open_seconds: timeOpenSeconds,
        had_interaction: hadInteraction,
        ...metadata,
    })
}

// Intent Detection Accuracy
export const trackIntentDetectionResult = (
    userInput: string,
    detectedSkill: string | null,
    wasAccepted: boolean,
    correctedTo?: string
) => {
    posthog.capture('intent_detection_result', {
        user_input_length: userInput.length,
        user_input_preview: userInput.slice(0, 50), // First 50 chars for context
        detected_skill: detectedSkill,
        was_accepted: wasAccepted,
        corrected_to: correctedTo,
        accuracy: wasAccepted ? 'correct' : 'incorrect',
    })
}

// Modal Opened (for tracking modal flow)
export const trackModalOpened = (
    modalType: string,
    metadata?: {
        triggered_by?: string
        previous_modal?: string
    }
) => {
    posthog.capture('modal_opened', {
        modal_type: modalType,
        timestamp: Date.now(),
        ...metadata,
    })
}