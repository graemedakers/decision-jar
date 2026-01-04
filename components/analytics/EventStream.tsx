'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface Event {
    id: string;
    type: string;
    name: string;
    path: string | null;
    value: number | null;
    createdAt: Date;
    user: { email: string } | null;
}

interface EventStreamProps {
    events: Event[];
}

export function EventStream({ events }: EventStreamProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');

    const filtered = events.filter(event => {
        const matchesSearch = !searchTerm ||
            event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.path?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.user?.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'ALL' || event.type === typeFilter;

        return matchesSearch && matchesType;
    });

    const eventTypes = ['ALL', 'VIEW', 'ACTION', 'WEB_VITALS', 'ERROR'];

    return (
        <div className="glass-card overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search events, paths, or users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Type Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {eventTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${typeFilter === type
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-2 text-xs text-slate-500">
                    Showing {filtered.length} of {events.length} events
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-3">Time</th>
                            <th className="px-6 py-3">Event</th>
                            <th className="px-6 py-3">Path</th>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filtered.map((event) => (
                            <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-3 text-slate-500">
                                    {new Date(event.createdAt).toLocaleTimeString()}
                                </td>
                                <td className="px-6 py-3 font-medium">
                                    <span className={`px-2 py-0.5 rounded text-xs ${getEventColor(event.type)}`}>
                                        {event.name}
                                    </span>
                                </td>
                                <td className="px-6 py-3 font-mono text-xs text-slate-500 max-w-[200px] truncate">
                                    {event.path}
                                </td>
                                <td className="px-6 py-3 text-slate-500">
                                    {event.user?.email || 'Guest'}
                                </td>
                                <td className="px-6 py-3 text-slate-500">
                                    {event.value !== null ? event.value.toFixed(2) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                        {searchTerm || typeFilter !== 'ALL'
                            ? 'No events match your filters'
                            : 'No events recorded yet. Interact with the app to generate data!'
                        }
                    </div>
                )}
            </div>
        </div>
    );
}

function getEventColor(type: string) {
    switch (type) {
        case 'VIEW': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
        case 'ACTION': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
        case 'WEB_VITALS': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
        case 'ERROR': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
        default: return 'bg-slate-100 text-slate-700';
    }
}
