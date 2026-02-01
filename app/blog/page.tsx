"use client";

import { motion } from "framer-motion";
import { BLOG_POSTS } from "@/lib/seo-content";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, ChevronRight, Zap, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function BlogHubPage() {
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 pt-24 pb-16 px-6">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
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
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                            <Newspaper className="w-3 h-3" /> The Decision Log
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
                            Features, stories, & <br /> <span className="text-primary">hidden gems.</span>
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                            Discover new ways to use your Jars, unlock power-user secrets, and see what's new in the Decision Jar ecosystem.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="max-w-5xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {BLOG_POSTS.map((post, index) => (
                        <motion.div
                            key={post.slug}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={`/blog/${post.slug}`} className="group block h-full">
                                <div className="glass-card hover:border-primary transition-all h-full flex flex-col group-hover:shadow-2xl group-hover:shadow-primary/5">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                                        <post.icon className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors" />
                                    </div>

                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{post.category}</span>
                                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                            <Clock className="w-3 h-3" /> {post.readTime}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors leading-tight">
                                        {post.title}
                                    </h3>

                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 line-clamp-3 leading-relaxed">
                                        {post.description}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex items-center text-sm font-bold text-slate-900 dark:text-white group-hover:gap-2 transition-all">
                                            Read Article <ChevronRight className="w-4 h-4 ml-1 text-primary" />
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium">{post.datePublished}</span>
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

                    <h2 className="text-3xl font-black text-white dark:text-slate-900 mb-6">Explore the full platform</h2>
                    <p className="text-slate-400 dark:text-slate-600 mb-10 text-lg max-w-xl mx-auto">
                        These features are just the beginning. Create your free account to unlock the full potential of Decision Jar.
                    </p>
                    <Link href="/signup">
                        <Button className="px-10 py-7 text-lg shadow-2xl shadow-primary/20">
                            Create Free Account
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* Minimal Footer */}
            <footer className="border-t border-slate-200 dark:border-white/10 py-12 px-6 bg-white dark:bg-slate-900">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-sm text-slate-500">© 2026 Decision Jar. All rights reserved.</p>
                </div>
            </footer>
        </main>
    );
}
