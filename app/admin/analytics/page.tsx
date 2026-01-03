import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
// import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
    const session = await getSession();

    if (session?.user?.email !== 'graemedakers@gmail.com') {
        // Strict access control
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-500">
                Access Denied
            </div>
        );
    }

    // ----------------------------------------------------
    // Fetch Data
    // ----------------------------------------------------

    // 1. Web Vitals (Last 24h for freshness, or all time?) - All time for now
    const lcp = await prisma.analyticsEvent.aggregate({ _avg: { value: true }, where: { name: 'LCP' } });
    const fid = await prisma.analyticsEvent.aggregate({ _avg: { value: true }, where: { name: 'FID' } });
    const cls = await prisma.analyticsEvent.aggregate({ _avg: { value: true }, where: { name: 'CLS' } });

    // 2. Business Metrics
    const signups = await prisma.analyticsEvent.count({ where: { name: 'signup' } });
    const spins = await prisma.analyticsEvent.count({ where: { name: 'spin_jar' } });

    // Visitors (Approximate via session IDs)
    // Note: This is an expensive query on large datasets. 
    // Optimization: Use raw SQL or a separate 'DailyStats' table in production.
    const uniqueVisitorCount = await prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
    }).then(groups => groups.length);

    const conversionRate = uniqueVisitorCount > 0 ? ((signups / uniqueVisitorCount) * 100).toFixed(1) : '0.0';

    // Activation: Users who have spun key features
    // We need unique users who spun.
    const activeSpinners = await prisma.analyticsEvent.groupBy({
        by: ['sessionId'], // or userId if logged in
        where: { name: 'spin_jar' }
    }).then(groups => groups.length);

    const activationRate = uniqueVisitorCount > 0 ? ((activeSpinners / uniqueVisitorCount) * 100).toFixed(1) : '0.0';

    // 3. Navigation / Top Paths
    const topPaths = await prisma.analyticsEvent.groupBy({
        by: ['path'],
        _count: { path: true },
        where: { type: 'VIEW' },
        orderBy: { _count: { path: 'desc' } },
        take: 10,
    });

    // 4. Recent Events Stream
    const recentEvents = await prisma.analyticsEvent.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } }
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Analytics</h1>
                        <p className="text-slate-500 dark:text-slate-400">Real-time performance and usage metrics for {session.user.email}</p>
                    </div>
                    <div className="text-sm text-slate-400">
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                </header>

                {/* Core Web Vitals */}
                <section>
                    <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">User Experience (Web Vitals)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MetricCard
                            title="Time to Interactive (FID)"
                            value={fid._avg.value ? `${fid._avg.value.toFixed(1)}ms` : 'No Data'}
                            status={getVitalStatus('FID', fid._avg.value || 0)}
                            desc="First Input Delay (Target < 100ms)"
                        />
                        <MetricCard
                            title="Visual Stability (CLS)"
                            value={cls._avg.value ? cls._avg.value.toFixed(3) : 'No Data'}
                            status={getVitalStatus('CLS', cls._avg.value || 0)}
                            desc="Cumulative Layout Shift (Target < 0.1)"
                        />
                        <MetricCard
                            title="Loading Speed (LCP approx)"
                            value={lcp._avg.value ? `${lcp._avg.value.toFixed(0)}ms` : 'No Data'}
                            status={getVitalStatus('LCP', lcp._avg.value || 0)}
                            desc="Largest Contentful Paint (Target < 2500ms)"
                        />
                    </div>
                </section>

                {/* Business Metrics */}
                <section>
                    <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Growth & Engagement</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <MetricCard title="Total Visitors" value={uniqueVisitorCount} />
                        <MetricCard title="Signups" value={signups} />
                        <MetricCard title="Conversion Rate" value={`${conversionRate}%`} />
                        <MetricCard title="Activation Rate" value={`${activationRate}%`} desc="Visitors who spun the jar" />
                    </div>
                </section>

                {/* Retention Placeholders */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-semibold mb-4 text-slate-700 dark:text-slate-300">Retention (Cohorts)</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span>Day 1 Retention</span>
                                <span className="font-mono text-slate-500">Calculating... (Need more data)</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span>Day 7 Retention</span>
                                <span className="font-mono text-slate-500">--</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span>Day 30 Retention</span>
                                <span className="font-mono text-slate-500">--</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-semibold mb-4 text-slate-700 dark:text-slate-300">Top Visited Pages</h3>
                        <div className="space-y-2">
                            {topPaths.map((p) => (
                                <div key={p.path} className="flex justify-between text-sm py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                    <span className="font-mono text-blue-600 dark:text-blue-400">{p.path || '/'}</span>
                                    <span className="font-semibold">{p._count.path}</span>
                                </div>
                            ))}
                            {topPaths.length === 0 && <span className="text-slate-400 text-sm">No page views recorded yet.</span>}
                        </div>
                    </div>
                </section>

                {/* Recent Activity Stream */}
                <section>
                    <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Recent Activity Feed</h2>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
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
                                {recentEvents.map((event) => (
                                    <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-3 text-slate-500">{new Date(event.createdAt).toLocaleTimeString()}</td>
                                        <td className="px-6 py-3 font-medium">
                                            <span className={`px-2 py-0.5 rounded text-xs ${getEventColor(event.type)}`}>
                                                {event.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 font-mono text-xs text-slate-500 max-w-[200px] truncate">{event.path}</td>
                                        <td className="px-6 py-3 text-slate-500">{event.user?.email || 'Guest'}</td>
                                        <td className="px-6 py-3 text-slate-500">{event.value !== null ? event.value.toFixed(2) : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {recentEvents.length === 0 && (
                            <div className="p-8 text-center text-slate-400">
                                No events recorded yet. Interact with the app to generate data!
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

function MetricCard({ title, value, status, desc }: { title: string, value: string | number, status?: 'good' | 'average' | 'poor', desc?: string }) {
    let colorClass = 'text-slate-900 dark:text-white';
    if (status === 'good') colorClass = 'text-emerald-500';
    if (status === 'average') colorClass = 'text-amber-500';
    if (status === 'poor') colorClass = 'text-rose-500';

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
            <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
                <div className={`text-3xl font-bold ${colorClass}`}>
                    {value}
                </div>
            </div>
            {desc && <p className="text-xs text-slate-400 mt-3 border-t border-slate-100 dark:border-slate-800 pt-3">{desc}</p>}
        </div>
    );
}

function getVitalStatus(name: string, value: number): 'good' | 'average' | 'poor' {
    if (name === 'CLS') return value < 0.1 ? 'good' : value < 0.25 ? 'average' : 'poor';
    if (name === 'FID') return value < 100 ? 'good' : value < 300 ? 'average' : 'poor';
    if (name === 'LCP') return value < 2500 ? 'good' : value < 4000 ? 'average' : 'poor';
    return 'average';
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
