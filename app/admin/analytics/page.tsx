import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Users, TrendingUp, Clock, Zap, Target, Award } from 'lucide-react';
import { HourlyHeatmap } from '@/components/analytics/HourlyHeatmap';
import { UserJourney } from '@/components/analytics/UserJourney';
import { EventStream } from '@/components/analytics/EventStream';
import { PerformanceTrends } from '@/components/analytics/PerformanceTrends';
import { AutoRefresh } from '@/components/analytics/AutoRefresh';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
    const session = await getSession();

    if (!session?.user?.isSuperAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-500">
                Access Denied
            </div>
        );
    }

    // Time ranges
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    // ============================================
    // QUICK WIN #1: User Breakdown
    // ============================================

    // Total unique visitors (all time)
    const allSessions = await prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
    });
    const totalVisitors = allSessions.length;

    // New vs Returning (based on first visit)
    const newVisitorsToday = await prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: { createdAt: { gte: last24h } }
    }).then(async (todaySessions) => {
        let newCount = 0;
        for (const session of todaySessions) {
            const firstEvent = await prisma.analyticsEvent.findFirst({
                where: { sessionId: session.sessionId },
                orderBy: { createdAt: 'asc' }
            });
            if (firstEvent && firstEvent.createdAt >= last24h) {
                newCount++;
            }
        }
        return newCount;
    });

    const visitorsToday = await prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: { createdAt: { gte: last24h } }
    }).then(r => r.length);

    const returningToday = visitorsToday - newVisitorsToday;

    // Authenticated vs Anonymous
    const authenticatedUsers = await prisma.analyticsEvent.groupBy({
        by: ['userId'],
        where: { userId: { not: null }, createdAt: { gte: last7d } }
    }).then(r => r.length);

    const anonymousSessions = await prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: { userId: null, createdAt: { gte: last7d } }
    }).then(r => r.length);

    // Device type (from user agent in metadata - approximate)
    const mobileEvents = await prisma.analyticsEvent.count({
        where: {
            createdAt: { gte: last7d },
            metadata: { path: ['userAgent'], string_contains: 'Mobile' }
        }
    });

    const totalEventsLast7d = await prisma.analyticsEvent.count({
        where: { createdAt: { gte: last7d } }
    });

    const mobilePercentage = totalEventsLast7d > 0 ? ((mobileEvents / totalEventsLast7d) * 100).toFixed(0) : 0;

    // ============================================
    // QUICK WIN #2: Time-based Metrics
    // ============================================

    // Users active in last hour
    const activeLastHour = await prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: { createdAt: { gte: lastHour } }
    }).then(r => r.length);

    // Peak hour analysis (last 7 days)
    const hourlyActivity = await prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: last7d } },
        select: { createdAt: true }
    });

    const hourCounts = new Array(24).fill(0);
    hourlyActivity.forEach(event => {
        const hour = new Date(event.createdAt).getHours();
        hourCounts[hour]++;
    });

    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    const peakHourFormatted = `${peakHour}:00 - ${peakHour + 1}:00`;

    // Average session duration (approximate from first to last event per session)
    const sessionDurations = await prisma.$queryRaw<{ avg_duration: number }[]>`
        SELECT AVG(duration) as avg_duration FROM (
            SELECT 
                "sessionId",
                EXTRACT(EPOCH FROM (MAX("createdAt") - MIN("createdAt"))) as duration
            FROM "AnalyticsEvent"
            WHERE "createdAt" >= ${last7d}
            GROUP BY "sessionId"
            HAVING COUNT(*) > 1
        ) as sessions
    `;

    const avgDurationMinutes = sessionDurations[0]?.avg_duration
        ? Math.round(sessionDurations[0].avg_duration / 60)
        : 0;

    // ============================================
    // QUICK WIN #3: Feature Usage Leaderboard
    // ============================================

    // Concierge tool usage
    const conciergeEvents = await prisma.analyticsEvent.groupBy({
        by: ['name'],
        _count: { name: true },
        where: {
            type: 'ACTION',
            name: { in: ['movie_concierge', 'dining_concierge', 'bar_concierge', 'hotel_concierge', 'book_concierge', 'date_night_planner', 'weekend_planner', 'bar_crawl_planner'] }
        },
        orderBy: { _count: { name: 'desc' } },
        take: 10
    });

    // Popular jar topics (from jar creation events or could infer from users table)
    const topicUsage = await prisma.jar.groupBy({
        by: ['topic'],
        _count: { topic: true },
        orderBy: { _count: { topic: 'desc' } },
        take: 8
    });

    // ============================================
    // QUICK WIN #4: Real Retention Cohorts
    // ============================================

    // Get users who signed up in different periods
    const usersSignedUpLast30d = await prisma.user.findMany({
        where: { createdAt: { gte: last30d } },
        select: { id: true, createdAt: true }
    });

    // Calculate D1, D7, D30 retention
    let d1RetainedCount = 0;
    let d7RetainedCount = 0;
    let d30RetainedCount = 0;

    for (const user of usersSignedUpLast30d) {
        const signupDate = new Date(user.createdAt);

        // D1: Did they come back next day?
        const d1Start = new Date(signupDate.getTime() + 24 * 60 * 60 * 1000);
        const d1End = new Date(signupDate.getTime() + 48 * 60 * 60 * 1000);
        const d1Activity = await prisma.analyticsEvent.count({
            where: {
                userId: user.id,
                createdAt: { gte: d1Start, lt: d1End }
            }
        });
        if (d1Activity > 0) d1RetainedCount++;

        // D7: Active in days 6-8?
        const d7Start = new Date(signupDate.getTime() + 6 * 24 * 60 * 60 * 1000);
        const d7End = new Date(signupDate.getTime() + 8 * 24 * 60 * 60 * 1000);
        const d7Activity = await prisma.analyticsEvent.count({
            where: {
                userId: user.id,
                createdAt: { gte: d7Start, lt: d7End }
            }
        });
        if (d7Activity > 0) d7RetainedCount++;

        // D30: Active in days 29-31?
        const d30Start = new Date(signupDate.getTime() + 29 * 24 * 60 * 60 * 1000);
        const d30End = new Date(signupDate.getTime() + 31 * 24 * 60 * 60 * 1000);
        const d30Activity = await prisma.analyticsEvent.count({
            where: {
                userId: user.id,
                createdAt: { gte: d30Start, lt: d30End }
            }
        });
        if (d30Activity > 0) d30RetainedCount++;
    }

    const totalSignups = usersSignedUpLast30d.length;
    const d1Retention = totalSignups > 0 ? ((d1RetainedCount / totalSignups) * 100).toFixed(1) : '0.0';
    const d7Retention = totalSignups > 0 ? ((d7RetainedCount / totalSignups) * 100).toFixed(1) : '0.0';
    const d30Retention = totalSignups > 0 ? ((d30RetainedCount / totalSignups) * 100).toFixed(1) : '0.0';

    // ============================================
    // Existing Metrics (Enhanced)
    // ============================================

    const lcp = await prisma.analyticsEvent.aggregate({ _avg: { value: true }, where: { name: 'LCP' } });
    const fid = await prisma.analyticsEvent.aggregate({ _avg: { value: true }, where: { name: 'FID' } });
    const cls = await prisma.analyticsEvent.aggregate({ _avg: { value: true }, where: { name: 'CLS' } });

    const signups = await prisma.analyticsEvent.count({ where: { name: 'signup' } });
    const spins = await prisma.analyticsEvent.count({ where: { name: 'spin_jar' } });

    const conversionRate = totalVisitors > 0 ? ((signups / totalVisitors) * 100).toFixed(1) : '0.0';

    const topPaths = await prisma.analyticsEvent.groupBy({
        by: ['path'],
        _count: { path: true },
        where: { type: 'VIEW' },
        orderBy: { _count: { path: 'desc' } },
        take: 10,
    });

    const recentEvents = await prisma.analyticsEvent.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } }
    });

    // ============================================
    // ADVANCED FEATURE #1: Hourly Heatmap Data
    // ============================================
    const heatmapEvents = await prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: last7d } },
        select: { createdAt: true }
    });

    const heatmapData = heatmapEvents.map(event => {
        const date = new Date(event.createdAt);
        return {
            hour: date.getHours(),
            day: date.getDay(), // 0-6 (Sun-Sat)
            count: 1
        };
    });

    // Aggregate counts
    const heatmapAggregated = heatmapData.reduce((acc, curr) => {
        const key = `${curr.day}-${curr.hour}`;
        if (!acc[key]) {
            acc[key] = { hour: curr.hour, day: curr.day, count: 0 };
        }
        acc[key].count++;
        return acc;
    }, {} as Record<string, { hour: number; day: number; count: number }>);

    const heatmapFinal = Object.values(heatmapAggregated);

    // ============================================
    // ADVANCED FEATURE #2: User Journey Paths
    // ============================================
    const viewEvents = await prisma.analyticsEvent.findMany({
        where: {
            type: 'VIEW',
            createdAt: { gte: last7d }
        },
        orderBy: { createdAt: 'asc' },
        select: { sessionId: true, path: true, createdAt: true }
    });

    // Build path flows
    const sessionPaths: Record<string, string[]> = {};
    viewEvents.forEach(event => {
        if (!event.sessionId) return; // Skip if no sessionId
        if (!sessionPaths[event.sessionId]) {
            sessionPaths[event.sessionId] = [];
        }
        if (event.path) {
            sessionPaths[event.sessionId].push(event.path);
        }
    });

    // Count flows from path to path
    const flowCounts: Record<string, number> = {};
    Object.values(sessionPaths).forEach(paths => {
        for (let i = 0; i < paths.length - 1; i++) {
            const key = `${paths[i]}→${paths[i + 1]}`;
            flowCounts[key] = (flowCounts[key] || 0) + 1;
        }
    });

    const userJourneys = Object.entries(flowCounts).map(([key, count]) => {
        const [from, to] = key.split('→');
        return { from, to, count };
    }).sort((a, b) => b.count - a.count);

    // ============================================
    // ADVANCED FEATURE #3: Performance Trends
    // ============================================
    const lcpEvents = await prisma.analyticsEvent.findMany({
        where: { name: 'LCP', createdAt: { gte: last7d } },
        orderBy: { createdAt: 'asc' },
        select: { value: true, createdAt: true }
    });

    const fidEvents = await prisma.analyticsEvent.findMany({
        where: { name: 'FID', createdAt: { gte: last7d } },
        orderBy: { createdAt: 'asc' },
        select: { value: true, createdAt: true }
    });

    const clsEvents = await prisma.analyticsEvent.findMany({
        where: { name: 'CLS', createdAt: { gte: last7d } },
        orderBy: { createdAt: 'asc' },
        select: { value: true, createdAt: true }
    });

    const lcpTrend = lcpEvents.map(e => ({ date: e.createdAt.toISOString(), value: e.value || 0 }));
    const fidTrend = fidEvents.map(e => ({ date: e.createdAt.toISOString(), value: e.value || 0 }));
    const clsTrend = clsEvents.map(e => ({ date: e.createdAt.toISOString(), value: e.value || 0 }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            Analytics Dashboard
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time insights for {session.user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            {activeLastHour} active now
                        </div>
                        <AutoRefresh intervalSeconds={30} />
                    </div>
                </header>

                {/* QUICK WIN #1: User Breakdown */}
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        User Overview (Last 24h)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            title="New Visitors"
                            value={newVisitorsToday}
                            icon={<Users className="w-5 h-5" />}
                            trend={`${visitorsToday} total today`}
                            color="blue"
                        />
                        <MetricCard
                            title="Returning Visitors"
                            value={returningToday}
                            icon={<TrendingUp className="w-5 h-5" />}
                            trend={`${((returningToday / Math.max(visitorsToday, 1)) * 100).toFixed(0)}% of today`}
                            color="green"
                        />
                        <MetricCard
                            title="Authenticated Users"
                            value={authenticatedUsers}
                            icon={<Award className="w-5 h-5" />}
                            trend="Last 7 days"
                            color="purple"
                        />
                        <MetricCard
                            title="Mobile Traffic"
                            value={`${mobilePercentage}%`}
                            icon={<Zap className="w-5 h-5" />}
                            trend="Last 7 days"
                            color="orange"
                        />
                    </div>
                </section>

                {/* QUICK WIN #2: Time Metrics */}
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Engagement Timing
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MetricCard
                            title="Peak Activity Hour"
                            value={peakHourFormatted}
                            icon={<Clock className="w-5 h-5" />}
                            trend="Last 7 days"
                            color="pink"
                        />
                        <MetricCard
                            title="Avg Session Duration"
                            value={`${avgDurationMinutes} min`}
                            icon={<Clock className="w-5 h-5" />}
                            trend="Multi-event sessions"
                            color="cyan"
                        />
                        <MetricCard
                            title="Active Last Hour"
                            value={activeLastHour}
                            icon={<Zap className="w-5 h-5" />}
                            trend="Real-time"
                            color="green"
                        />
                    </div>
                </section>

                {/* Growth & Engagement */}
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                        Growth & Engagement
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <MetricCard title="Total Visitors" value={totalVisitors} color="blue" />
                        <MetricCard title="Signups" value={signups} color="green" />
                        <MetricCard title="Conversion Rate" value={`${conversionRate}%`} color="purple" />
                        <MetricCard title="Total Spins" value={spins} color="pink" />
                    </div>
                </section>

                {/* QUICK WIN #3 & #4: Feature Usage & Retention */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Feature Leaderboard */}
                    <div className="glass-card p-6">
                        <h3 className="font-bold mb-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-500" />
                            Top Features (All Time)
                        </h3>
                        <div className="space-y-2">
                            {conciergeEvents.map((event, index) => (
                                <div key={event.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            index === 1 ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                                                index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    'bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
                                            }`}>
                                            #{index + 1}
                                        </div>
                                        <span className="font-medium text-slate-900 dark:text-white capitalize">
                                            {event.name.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">{event._count.name}</span>
                                </div>
                            ))}
                            {conciergeEvents.length === 0 && (
                                <p className="text-slate-400 text-sm text-center py-8">No feature usage recorded yet</p>
                            )}
                        </div>
                    </div>

                    {/* Real Retention */}
                    <div className="glass-card p-6">
                        <h3 className="font-bold mb-4 text-slate-700 dark:text-slate-300">User Retention (Last 30d Cohort)</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                <div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">Day 1 Retention</div>
                                    <div className="text-xs text-slate-500 mt-1">{d1RetainedCount} of {totalSignups} returned</div>
                                </div>
                                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{d1Retention}%</div>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">Day 7 Retention</div>
                                    <div className="text-xs text-slate-500 mt-1">{d7RetainedCount} of {totalSignups} returned</div>
                                </div>
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{d7Retention}%</div>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                <div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400">Day 30 Retention</div>
                                    <div className="text-xs text-slate-500 mt-1">{d30RetainedCount} of {totalSignups} returned</div>
                                </div>
                                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{d30Retention}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Topic Distribution & Top Pages */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card p-6">
                        <h3 className="font-bold mb-4 text-slate-700 dark:text-slate-300">Popular Jar Topics</h3>
                        <div className="space-y-2">
                            {topicUsage.map((topic) => {
                                const total = topicUsage.reduce((sum, t) => sum + t._count.topic, 0);
                                const percentage = ((topic._count.topic / total) * 100).toFixed(0);
                                return (
                                    <div key={topic.topic} className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{topic.topic || 'General'}</span>
                                                <span className="text-slate-500">{topic._count.topic} jars</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 w-12 text-right">{percentage}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-bold mb-4 text-slate-700 dark:text-slate-300">Top Visited Pages</h3>
                        <div className="space-y-2">
                            {topPaths.map((p) => (
                                <div key={p.path} className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                    <span className="font-mono text-blue-600 dark:text-blue-400 truncate flex-1">{p.path || '/'}</span>
                                    <span className="font-bold ml-4">{p._count.path}</span>
                                </div>
                            ))}
                            {topPaths.length === 0 && <span className="text-slate-400 text-sm">No page views recorded yet.</span>}
                        </div>
                    </div>
                </div>

                {/* Core Web Vitals */}
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Performance (Web Vitals)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MetricCard
                            title="First Input Delay"
                            value={fid._avg.value ? `${fid._avg.value.toFixed(1)}ms` : 'No Data'}
                            status={getVitalStatus('FID', fid._avg.value || 0)}
                            desc="Target < 100ms"
                        />
                        <MetricCard
                            title="Cumulative Layout Shift"
                            value={cls._avg.value ? cls._avg.value.toFixed(3) : 'No Data'}
                            status={getVitalStatus('CLS', cls._avg.value || 0)}
                            desc="Target < 0.1"
                        />
                        <MetricCard
                            title="Largest Contentful Paint"
                            value={lcp._avg.value ? `${lcp._avg.value.toFixed(0)}ms` : 'No Data'}
                            status={getVitalStatus('LCP', lcp._avg.value || 0)}
                            desc="Target < 2500ms"
                        />
                    </div>
                </section>

                {/* ADVANCED FEATURE: Performance Trends */}
                <PerformanceTrends
                    lcpData={lcpTrend}
                    fidData={fidTrend}
                    clsData={clsTrend}
                />

                {/* ADVANCED FEATURE: Hourly Heatmap & User Journey */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <HourlyHeatmap data={heatmapFinal} />
                    <UserJourney flows={userJourneys} />
                </div>

                {/* ADVANCED FEATURE: Event Stream with Filtering */}
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Recent Activity Stream</h2>
                    <EventStream events={recentEvents} />
                </section>
            </div>
        </div>
    );
}

interface MetricCardProps {
    title: string;
    value: string | number;
    status?: 'good' | 'average' | 'poor';
    desc?: string;
    icon?: React.ReactNode;
    trend?: string;
    color?: 'blue' | 'green' | 'purple' | 'pink' | 'orange' | 'cyan';
}

function MetricCard({ title, value, status, desc, icon, trend, color = 'blue' }: MetricCardProps) {
    let colorClass = 'text-slate-900 dark:text-white';
    let bgClass = 'bg-slate-100 dark:bg-slate-800';

    if (status === 'good') {
        colorClass = 'text-emerald-500';
        bgClass = 'bg-emerald-100 dark:bg-emerald-900/30';
    }
    if (status === 'average') {
        colorClass = 'text-amber-500';
        bgClass = 'bg-amber-100 dark:bg-amber-900/30';
    }
    if (status === 'poor') {
        colorClass = 'text-rose-500';
        bgClass = 'bg-rose-100 dark:bg-rose-900/30';
    }

    // Color themes for icons
    const colorThemes = {
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
        orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
        cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    };

    return (
        <div className="glass-card p-6 flex flex-col justify-between h-full hover:shadow-lg transition-shadow">
            <div>
                {icon && (
                    <div className={`w-10 h-10 rounded-xl ${colorThemes[color]} flex items-center justify-center mb-3`}>
                        {icon}
                    </div>
                )}
                <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
                <div className={`text-3xl font-bold ${colorClass}`}>
                    {value}
                </div>
            </div>
            {(desc || trend) && (
                <p className="text-xs text-slate-400 mt-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                    {desc || trend}
                </p>
            )}
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
