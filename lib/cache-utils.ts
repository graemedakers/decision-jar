import { QueryClient } from "@tanstack/react-query";

/**
 * Unified Cache Management Utilities
 * 
 * SINGLE SOURCE OF TRUTH for all cache invalidation patterns.
 * Prevents inconsistencies in cache key usage across the application.
 * 
 * @module cache-utils
 */

/**
 * Cache key factories for consistent key generation.
 * Use these instead of creating keys manually.
 */
export const CacheKeys = {
    /**
     * User data cache key
     */
    user: () => ['user'] as const,

    /**
     * Ideas cache key (jar-specific)
     * @param jarId - Optional jar ID for jar-specific caching
     */
    ideas: (jarId?: string) => jarId ? ['ideas', jarId] as const : ['ideas'] as const,

    /**
     * Favorites cache key
     */
    favorites: () => ['favorites'] as const,

    /**
     * Jars list cache key
     */
    jars: () => ['jars'] as const,

    /**
     * Specific jar cache key
     * @param jarId - Jar ID
     */
    jar: (jarId: string) => ['jar', jarId] as const,

    /**
     * Notifications cache key
     */
    notifications: () => ['notifications'] as const,
} as const;

/**
 * Cache invalidation helpers.
 * Use these instead of calling queryClient.invalidateQueries directly.
 * 
 * Benefits:
 * - Consistent cache key usage
 * - Centralized invalidation logic
 * - Easy to refactor if cache strategy changes
 */
export class CacheInvalidator {
    constructor(private queryClient: QueryClient) { }

    /**
     * Invalidates user cache.
     * Call after user data updates (settings, premium status, etc.)
     */
    invalidateUser() {
        return this.queryClient.invalidateQueries({
            queryKey: CacheKeys.user()
        });
    }

    /**
     * Invalidates ideas cache.
     * 
     * @param jarId - Optional jar ID. If provided, only invalidates that jar's ideas.
     *                If omitted, invalidates ALL ideas caches.
     * 
     * Call after:
     * - Adding an idea
     * - Updating an idea
     * - Deleting an idea
     * - Switching jars
     */
    invalidateIdeas(jarId?: string) {
        if (jarId) {
            // Invalidate specific jar's ideas
            return this.queryClient.invalidateQueries({
                queryKey: CacheKeys.ideas(jarId)
            });
        } else {
            // Invalidate all ideas (useful when jar context is unknown)
            return this.queryClient.invalidateQueries({
                queryKey: CacheKeys.ideas()
            });
        }
    }

    /**
     * Invalidates favorites cache.
     * Call after adding/removing favorites.
     */
    invalidateFavorites() {
        return this.queryClient.invalidateQueries({
            queryKey: CacheKeys.favorites()
        });
    }

    /**
     * Invalidates jars list cache.
     * Call after creating/deleting/updating jars.
     */
    invalidateJars() {
        return this.queryClient.invalidateQueries({
            queryKey: CacheKeys.jars()
        });
    }

    /**
     * Invalidates a specific jar's cache.
     * @param jarId - Jar ID
     */
    invalidateJar(jarId: string) {
        return this.queryClient.invalidateQueries({
            queryKey: CacheKeys.jar(jarId)
        });
    }

    /**
     * Invalidates everything related to jar content.
     * Useful after major jar operations (switching, joining, etc.)
     * 
     * @param jarId - Optional jar ID for targeted invalidation
     */
    invalidateJarContent(jarId?: string) {
        return Promise.all([
            this.invalidateIdeas(jarId),
            this.invalidateUser(), // User data includes active jar info
            jarId ? this.invalidateJar(jarId) : this.invalidateJars(),
        ]);
    }

    /**
     * Nuclear option: invalidate everything.
     * Use sparingly - only for major state changes (login, logout, etc.)
     */
    invalidateAll() {
        return this.queryClient.invalidateQueries();
    }
}

/**
 * Hook-friendly wrapper for cache invalidation.
 * Use this in React components.
 * 
 * @example
 * const cache = useCacheInvalidator();
 * await cache.invalidateIdeas(jarId);
 */
export function createCacheInvalidator(queryClient: QueryClient): CacheInvalidator {
    return new CacheInvalidator(queryClient);
}

/**
 * Stale time configuration constants.
 * Centralized for easy tuning and documentation.
 * 
 * Rationale:
 * - User data: 5 minutes (changes infrequently, expensive to fetch)
 * - Ideas: 30 seconds (changes more often, but okay to be slightly stale)
 * - Favorites: 2 minutes (medium frequency changes)
 * - Jars: 5 minutes (infrequent changes)
 */
export const STALE_TIME = {
    /**
     * User profile and settings
     * Longer stale time because:
     * - Includes expensive joins (jar, memberships, achievements)
     * - Data changes infrequently
     * - Explicit refresh available via settings
     */
    USER: 1000 * 60 * 5, // 5 minutes

    /**
     * Ideas list
     * Moderate stale time because:
     * - Data changes frequently (adding/editing ideas)
     * - Balance between freshness and performance
     * - Background refresh handles most updates
     */
    IDEAS: 1000 * 30, // 30 seconds

    /**
     * Favorites list
     * Moderate-long stale time because:
     * - Changes less frequently than ideas
     * - Not critical to be real-time
     */
    FAVORITES: 1000 * 60 * 2, // 2 minutes

    /**
     * Jars list
     * Long stale time because:
     * - Jars created/deleted infrequently
     * - Explicit invalidation on jar operations
     */
    JARS: 1000 * 60 * 5, // 5 minutes

    /**
     * Notifications
     * Short stale time because:
     * - Users expect real-time updates
     * - Lightweight query
     */
    NOTIFICATIONS: 1000 * 10, // 10 seconds
} as const;

/**
 * Documentation for when to use which cache invalidation strategy:
 * 
 * 1. **After Mutations**: Always invalidate affected caches
 *    Example: After adding idea → invalidateIdeas()
 * 
 * 2. **After Navigation**: Invalidate when switching context
 *    Example: After switching jars → invalidateJarContent(newJarId)
 * 
 * 3. **Background Updates**: Let React Query handle with staleTime
 *    Example: Ideas list will auto-refetch after 30s
 * 
 * 4. **User Actions**: Explicit refresh buttons
 *    Example: Pull-to-refresh → invalidateAll()
 * 
 * 5. **Real-time**: Use polling or WebSockets, not cache invalidation
 *    Example: Live notifications → separate polling mechanism
 */
