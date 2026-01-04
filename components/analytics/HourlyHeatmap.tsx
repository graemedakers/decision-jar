'use client';

import { useMemo } from 'react';

interface HourlyHeatmapProps {
    data: { hour: number; day: number; count: number }[];
}

export function HourlyHeatmap({ data }: HourlyHeatmapProps) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Find max for color scaling
    const maxCount = useMemo(() => Math.max(...data.map(d => d.count), 1), [data]);

    const getColor = (count: number) => {
        if (count === 0) return 'bg-slate-100 dark:bg-slate-800';
        const intensity = count / maxCount;
        if (intensity > 0.75) return 'bg-purple-600 dark:bg-purple-500';
        if (intensity > 0.5) return 'bg-purple-500 dark:bg-purple-600';
        if (intensity > 0.25) return 'bg-purple-400 dark:bg-purple-700';
        return 'bg-purple-300 dark:bg-purple-800';
    };

    const getCellData = (hour: number, day: number) => {
        return data.find(d => d.hour === hour && d.day === day)?.count || 0;
    };

    return (
        <div className="glass-card p-6">
            <h3 className="font-bold mb-4 text-slate-700 dark:text-slate-300">
                Activity Heatmap (Last 7 Days)
            </h3>
            <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                    {/* Hour labels */}
                    <div className="flex mb-1">
                        <div className="w-12"></div>
                        {hours.map(hour => (
                            <div key={hour} className="w-8 text-center text-xs text-slate-400">
                                {hour % 3 === 0 ? hour : ''}
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    {days.map((day, dayIndex) => (
                        <div key={day} className="flex items-center mb-1">
                            <div className="w-12 text-xs font-medium text-slate-600 dark:text-slate-400">
                                {day}
                            </div>
                            {hours.map(hour => {
                                const count = getCellData(hour, dayIndex);
                                return (
                                    <div
                                        key={`${day}-${hour}`}
                                        className={`w-8 h-8 mr-0.5 rounded ${getColor(count)} transition-all hover:ring-2 hover:ring-purple-400 cursor-pointer group relative`}
                                        title={`${day} ${hour}:00 - ${count} events`}
                                    >
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                            {day} {hour}:00<br />{count} events
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {/* Legend */}
                    <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
                        <span>Less</span>
                        <div className="flex gap-1">
                            <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800"></div>
                            <div className="w-4 h-4 rounded bg-purple-300 dark:bg-purple-800"></div>
                            <div className="w-4 h-4 rounded bg-purple-400 dark:bg-purple-700"></div>
                            <div className="w-4 h-4 rounded bg-purple-500 dark:bg-purple-600"></div>
                            <div className="w-4 h-4 rounded bg-purple-600 dark:bg-purple-500"></div>
                        </div>
                        <span>More</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
