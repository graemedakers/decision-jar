import { USE_CASES } from "@/lib/use-cases";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Ways to Use Decision Jar - Scenarios & Inspiration",
    description: "Explore 10 different ways to use Decision Jar for couples, families, friends, and solo adventures.",
};

export default function UseCasesIndexPage() {
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <span className="font-bold text-lg tracking-tight">Decision Jar</span>
                </div>
            </div>

            {/* Hero */}
            <section className="py-20 px-4 text-center">
                <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                    One Jar. <span className="text-secondary">Endless Possibilities.</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    Whether you're planning date night, organizing a team lunch, or just bored on a Sunday—there's a jar for that.
                </p>
            </section>

            {/* Grid */}
            <section className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {USE_CASES.map((uc) => {
                        const Icon = uc.icon;
                        return (
                            <Link key={uc.slug} href={`/use-cases/${uc.slug}`} className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50 transition-colors shadow-sm hover:shadow-xl hover:-translate-y-1 block h-full">
                                <div className={`w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors ${uc.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{uc.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                                    {uc.description}
                                </p>
                                <span className="inline-flex items-center text-sm font-semibold text-primary">
                                    See how it works &rarr;
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
