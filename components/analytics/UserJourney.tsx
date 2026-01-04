'use client';

import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';

interface PathFlow {
    from: string;
    to: string;
    count: number;
}

interface UserJourneyProps {
    flows: PathFlow[];
}

export function UserJourney({ flows }: UserJourneyProps) {
    const { nodes, links } = useMemo(() => {
        // Get unique paths
        const nodeSet = new Set<string>();
        flows.forEach(flow => {
            nodeSet.add(flow.from);
            nodeSet.add(flow.to);
        });

        const nodes = Array.from(nodeSet);
        const maxFlow = Math.max(...flows.map(f => f.count), 1);

        return { nodes, links: flows, maxFlow };
    }, [flows]);

    const getNodeLabel = (path: string) => {
        if (path === '/') return 'Home';
        if (path === '/dashboard') return 'Dashboard';
        if (path === '/demo') return 'Demo';
        if (path === '/memories') return 'Memories';
        if (path === '/auth/signin') return 'Sign In';
        if (path.startsWith('/learn')) return 'Learning Center';
        return path.split('/').pop() || path;
    };

    const topFlows = flows
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return (
        <div className="glass-card p-6">
            <h3 className="font-bold mb-4 text-slate-700 dark:text-slate-300">
                Top User Journeys
            </h3>
            <div className="space-y-3">
                {topFlows.map((flow, index) => {
                    const percentage = (flow.count / flows.reduce((sum, f) => sum + f.count, 0) * 100).toFixed(1);
                    return (
                        <div key={`${flow.from}-${flow.to}-${index}`} className="relative">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium truncate max-w-[150px]">
                                        {getNodeLabel(flow.from)}
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    <div className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md text-sm font-medium truncate max-w-[150px]">
                                        {getNodeLabel(flow.to)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-xs text-slate-500 whitespace-nowrap">
                                        {percentage}%
                                    </div>
                                    <div className="font-bold text-slate-700 dark:text-slate-300 w-12 text-right">
                                        {flow.count}
                                    </div>
                                </div>
                            </div>
                            <div
                                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    );
                })}
                {topFlows.length === 0 && (
                    <p className="text-slate-400 text-sm text-center py-8">
                        Not enough navigation data yet
                    </p>
                )}
            </div>
        </div>
    );
}
