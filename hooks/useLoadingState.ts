import { useMemo, useEffect, useState } from "react";

/**
 * Unified Loading State Hook
 * 
 * Provides consistent loading state logic across all pages.
 * Prevents over-aggressive loading screens during background refreshes.
 * 
 * @module useLoadingState
 */

interface UseLoadingStateOptions {
    /**
     * Whether user data is currently loading (first fetch)
     */
    isLoadingUser: boolean;

    /**
     * Whether ideas data is currently loading (first fetch)
     */
    isLoadingIdeas: boolean;

    /**
     * Whether ideas are being refetched in background
     */
    isFetchingIdeas?: boolean;

    /**
     * Current user data (null if not loaded)
     */
    userData: any;

    /**
     * Current ideas list
     */
    ideas: any[];
}

/**
 * Determines when to show a full-page loading state.
 * 
 * **Philosophy**:
 * - Show loading ONLY when we have NO data at all
 * - Don't show loading during background refreshes (user already has data)
 * - Prevents UI "flicker" when adding first item, switching jars, etc.
 * 
 * **Loading is shown when**:
 * - User data is loading AND we don't have user data yet
 * - Ideas are loading (first time) AND we have zero ideas AND it's not a background fetch
 * 
 * **Loading is NOT shown when**:
 * - Background refetch (isFetchingIdeas) while we already have ideas
 * - User data is being refreshed but we already have userData
 * 
 * @param options - Loading state inputs
 * @returns boolean indicating if loading screen should be shown
 * 
 * @example
 * const isLoading = useLoadingState({
 *   isLoadingUser,
 *   isLoadingIdeas,
 *   isFetchingIdeas,
 *   userData,
 *   ideas
 * });
 * 
 * if (isLoading) {
 *   return <FullPageLoader />;
 * }
 */
export function useLoadingState({
    isLoadingUser,
    isLoadingIdeas,
    isFetchingIdeas = false,
    userData,
    ideas
}: UseLoadingStateOptions): boolean {
    const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
    const [forceShowContent, setForceShowContent] = useState(false);

    const shouldShowLoading = useMemo(() => {
        // ✅ CRITICAL: If redirect is in progress, ALWAYS show loading to freeze UI
        if (isUserRedirecting()) {
            console.log('[Loading State] Redirect in progress, freezing UI');
            return true;
        }

        // ✅ CRITICAL: If user query failed (user deleted but session exists), don't show loading
        // This prevents infinite loading screen when user is deleted from database
        if (!userData && !isLoadingUser) {
            console.log('[Loading State] User data unavailable after load complete, allowing redirect');
            return false;
        }

        // If we don't have user data AND it's loading, show loading
        if (!userData && isLoadingUser) {
            return true;
        }

        // If we have no ideas AND they're loading (first time, not refetch), show loading
        if (ideas.length === 0 && isLoadingIdeas && !isFetchingIdeas) {
            return true;
        }

        // All other cases: don't show loading (we have enough data to show UI)
        return false;
    }, [isLoadingUser, isLoadingIdeas, isFetchingIdeas, userData, ideas.length]);

    // Safety timeout: If stuck loading for >10 seconds, force show content/error
    useEffect(() => {
        if (shouldShowLoading && !loadingStartTime) {
            setLoadingStartTime(Date.now());
            setForceShowContent(false);
        } else if (!shouldShowLoading) {
            setLoadingStartTime(null);
            setForceShowContent(false);
        }
    }, [shouldShowLoading, loadingStartTime]);

    useEffect(() => {
        if (!loadingStartTime) return;

        const timeout = setTimeout(() => {
            console.warn('⚠️ Loading timeout exceeded - forcing content display to allow redirect');
            setForceShowContent(true);
            // Clear any stuck state
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('loading_timeout_occurred', Date.now().toString());
            }
        }, 10000); // 10 second timeout

        return () => clearTimeout(timeout);
    }, [loadingStartTime]);

    return shouldShowLoading && !forceShowContent;
}

/**
 * Documentation: When to use this hook
 * 
 * **Dashboard/Main Pages**: Always use this hook
 * - Prevents jarring unmounts during background updates
 * - Maintains UI stability during jar switches
 * 
 * **Modal/Small Components**: Don't use this hook
 * - Use local loading states for modal contents
 * - Full-page loader not appropriate
 * 
 * **Background Operations**: Don't use this hook
 * - Use subtle loading indicators (spinners, skeleton UI)
 * - Full-page loader disrupts user flow
 */
