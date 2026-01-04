'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendData {
    date: string;
    value: number;
}

interface PerformanceTrendsProps {
    lcpData: TrendData[];
    fidData: TrendData[];
    clsData: TrendData[];
}

export function PerformanceTrends({ lcpData, fidData, clsData }: PerformanceTrendsProps) {
    const renderMiniChart = (data: TrendData[], target: number, label: string, unit: string) => {
        if (data.length === 0) {
            return (
                <div className="text-center text-slate-400 text-sm py-4">
                    No data yet
                </div>
            );
        }

        const max = Math.max(...data.map(d => d.value));
        const min = Math.min(...data.map(d => d.value));
        const range = max - min || 1;

        const latest = data[data.length - 1]?.value || 0;
        const previous = data[data.length - 2]?.value || latest;
        const change = latest - previous;
        const changePercent = previous !== 0 ? ((change / previous) * 100).toFixed(1) : '0';

        const isGood = latest < target;
        const isImproving = change < 0; // Lower is better for web vitals

        return (
            <div className="glass-card p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <div className="text-sm text-slate-500 mb-1">{label}</div>
                        <div className={`text-2xl font-bold ${isGood ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {latest.toFixed(unit === 'ms' ? 0 : 3)}{unit}
                        </div>
                    </div>
                    <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${isImproving
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : change === 0
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                        }`}>
                        {isImproving ? <TrendingDown className="w-3 h-3" /> : change === 0 ? <Minus className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        {Math.abs(parseFloat(changePercent))}%
                    </div>
                </div>

                {/* Mini sparkline */}
                <div className="h-12 flex items-end gap-0.5">
                    {data.slice(-20).map((point, i) => {
                        const heightPercent = ((point.value - min) / range) * 100;
                        const color = point.value < target ? 'bg-emerald-500' : 'bg-amber-500';
                        return (
                            <div
                                key={i}
                                className={`flex-1 ${color} rounded-t transition-all hover:opacity-75`}
                                style={{ height: `${heightPercent}%`, minHeight: '2px' }}
                                title={`${new Date(point.date).toLocaleDateString()}: ${point.value.toFixed(2)}${unit}`}
                            />
                        );
                    })}
                </div>

                <div className="text-xs text-slate-400 mt-2">
                    Target: &lt; {target}{unit}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Performance Trends (Last 20 Data Points)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderMiniChart(lcpData, 2500, 'Largest Contentful Paint', 'ms')}
                {renderMiniChart(fidData, 100, 'First Input Delay', 'ms')}
                {renderMiniChart(clsData, 0.1, 'Cumulative Layout Shift', '')}
            </div>
        </div>
    );
}
