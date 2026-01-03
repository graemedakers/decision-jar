'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { trackEvent } from '@/lib/analytics';

function AnalyticsLogic() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Track page view
        trackEvent('page_view', 'VIEW', 1, {
            path: pathname,
            query: searchParams?.toString()
        });
    }, [pathname, searchParams]);

    useReportWebVitals((metric) => {
        // Filter for the metrics we care about: CLS, FID, LCP (proxy for TTFMP)
        // Also INP, FCP, TTFB are available
        if (['CLS', 'FID', 'LCP', 'FCP', 'TTFB', 'INP'].includes(metric.name)) {
            trackEvent(metric.name, 'WEB_VITALS', metric.value, {
                id: metric.id,
                rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
                delta: metric.delta,
                navigationType: metric.navigationType
            });
        }
    });

    return null;
}

export function AnalyticsProvider() {
    return (
        <Suspense fallback={null}>
            <AnalyticsLogic />
        </Suspense>
    );
}
