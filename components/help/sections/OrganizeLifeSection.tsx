"use client";

export function OrganizeLifeSection() {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Organizing Your Life with Jars</h3>
            <p className="text-slate-600 dark:text-slate-300">
                Decision Jar is versatile. You can create multiple jars to organize different areas of your life, keeping your ideas separate and relevant.
            </p>
            <div className="grid gap-4 mt-4">
                <div className="bg-pink-50 dark:bg-pink-500/10 p-4 rounded-xl border border-pink-100 dark:border-pink-500/20">
                    <h4 className="font-bold text-pink-700 dark:text-pink-300 mb-2">❤️ Romantic Jar</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Keep the spark alive. Use this for <strong>Date Nights</strong>, <strong>Movies</strong>, or intimate weekend getaways. Share it with your romantic partner(s).
                    </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-500/10 p-4 rounded-xl border border-purple-100 dark:border-purple-500/20">
                    <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-2">👯 Social & Friends</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        The ultimate "What are we doing?" solver. Great for <strong>Group Dinners</strong>, <strong>Bar Crawls</strong>, or <strong>Game Nights</strong>.
                    </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20">
                    <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2">🧘 Solo & Self-Care</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        A jar just for you. Fill it with <strong>Books to Read</strong>, <strong>Walks to Take</strong>, or <strong>Hobbies</strong> you want to practice.
                    </p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                    <h4 className="font-bold text-emerald-700 dark:text-emerald-300 mb-2">🏠 Family & Chores</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Make weekends fun with <strong>Family Activities</strong>, or use <strong>Allocation Mode</strong> to fairly distribute household chores among kids or housemates.
                    </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-100 dark:border-amber-500/20">
                    <h4 className="font-bold text-amber-700 dark:text-amber-300 mb-2">🏢 Work & Team</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Settle the "Where for lunch?" debate or pick <strong>Team Building</strong> activities.
                    </p>
                </div>
            </div>
        </div>
    );
}
