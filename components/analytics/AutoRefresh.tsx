'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

interface AutoRefreshProps {
    intervalSeconds?: number;
}

export function AutoRefresh({ intervalSeconds = 30 }: AutoRefreshProps) {
    const router = useRouter();
    const [countdown, setCountdown] = useState(intervalSeconds);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    handleRefresh();
                    return intervalSeconds;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [intervalSeconds]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                title="Refresh now"
            >
                <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="text-xs text-slate-500">
                Auto-refresh in {countdown}s
            </div>
        </div>
    );
}
