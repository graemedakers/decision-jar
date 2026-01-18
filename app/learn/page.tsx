"use client";

import { motion } from "framer-motion";
import { RESOURCE_GUIDES } from "@/lib/seo-content";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LearnHubPage() {
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 pt-24 pb-16 px-6">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
                </div>

                <div className="max-w-5xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Decision Jar
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                            <BookOpen className="w-3 h-3" /> Learning Center
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
                            The Art of Decision <br /> & <span className="text-primary">Social Connection.</span>
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                            Deep dives into relationship science, productivity hacks, and community building.
                            Learn how to optimize your time and foster deeper connections.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Guides Grid */}
            <div className="max-w-5xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {RESOURCE_GUIDES.map((guide, index) => (
                        <motion.div
                            key={guide.slug}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={`/learn/${guide.slug}`} className="group block h-full">
                                <div className="glass-card hover:border-primary transition-all h-full flex flex-col group-hover:shadow-2xl group-hover:shadow-primary/5">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                                        <guide.icon className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors" />
                                    </div>

                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{guide.category}</span>
                                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                            <Clock className="w-3 h-3" /> {guide.readTime}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors leading-tight">
                                        {guide.title}
                                    </h3>

                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 line-clamp-3 leading-relaxed">
                                        {guide.description}
                                    </p>

                                    <div className="mt-auto flex items-center text-sm font-bold text-slate-900 dark:text-white group-hover:gap-2 transition-all">
                                        Read Guide <ChevronRight className="w-4 h-4 ml-1 text-primary" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Call to Action */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-32 p-12 rounded-3xl bg-slate-900 dark:bg-white relative overflow-hidden text-center"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-20">
                        <Zap className="w-32 h-32 text-primary" />
                    </div>

                    <h2 className="text-3xl font-black text-white dark:text-slate-900 mb-6">Ready to stop debating & start doing?</h2>
                    <p className="text-slate-400 dark:text-slate-600 mb-10 text-lg max-w-xl mx-auto">
                        Put these theories into practice. Create your first Jar today and transform your social life.
                    </p>
                    <Link href="/signup">
                        <Button className="px-10 py-7 text-lg shadow-2xl shadow-primary/20">
                            Get Started for Free
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* Sub-Footer for SEO */}
            <footer className="border-t border-slate-200 dark:border-white/10 py-12 px-6 bg-white dark:bg-slate-900">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-slate-500">
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-xs">Social Connections</h4>
                        <ul className="space-y-2">
                            <li><Link href="/learn/building-social-connections" className="hover:text-primary">Adult Friendships</Link></li>

                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-xs">Productivity</h4>
                        <ul className="space-y-2">
                            <li><Link href="/learn/reducing-mental-load" className="hover:text-primary">Decision Fatigue</Link></li>
                            <li><Link href="/explore" className="hover:text-primary">Executive Tools</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest text-xs">Resources</h4>
                        <ul className="space-y-2">
                            <li><Link href="/learn/unique-shared-experiences" className="hover:text-primary">Activity Guides</Link></li>
                            <li><Link href="/" className="hover:text-primary">Landing Page</Link></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </main>
    );
}
