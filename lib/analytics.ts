import { posthog } from './posthog'

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
}

// User Events
export const trackSignup = (method: string, utmSource?: string, utmMedium?: string, utmCampaign?: string) => {
    posthog.capture('signup_completed', {
        method: method,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
    })
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
