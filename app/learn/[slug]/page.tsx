"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { RESOURCE_GUIDES } from "@/lib/seo-content";
import Link from "next/link";
import { ArrowLeft, Clock, MessageSquare, Sparkles, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { notFound } from "next/navigation";

export default function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const guide = RESOURCE_GUIDES.find(g => g.slug === slug);

    if (!guide) {
        return notFound();
    }

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950">
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(guide.structuredData) }}
            />

            {/* Sticky Top Nav */}
            <nav className="sticky top-0 z-50 w-full glass border-b border-slate-200 dark:border-white/10 px-6 py-4 flex items-center justify-between">
                <Link href="/learn" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                    <ArrowLeft className="w-3 h-3 mr-2" /> Back to Guides
                </Link>
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/signup" className="text-xs font-bold text-primary">Join Decision Jar</Link>
                    <Link href="/login" className="text-xs font-bold text-slate-500">Sign In</Link>
                </div>
            </nav>

            {/* Article Header */}
            <header className="max-w-4xl mx-auto px-6 pt-20 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">{guide.category}</span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <Clock className="w-3 h-3" /> {guide.readTime} Read
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
                        {guide.title}
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic border-l-4 border-primary/20 pl-6">
                        {guide.description}
                    </p>
                </motion.div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 pb-32">
                <article className="lg:col-span-8 space-y-12">
                    {guide.sections.map((section, idx) => (
                        <motion.section
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="prose prose-slate dark:prose-invert max-w-none"
                        >
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-primary/40">0{idx + 1}.</span> {section.title}
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                {section.content}
                            </p>
                        </motion.section>
                    ))}

                    {/* FAQ Section */}
                    <section className="pt-20 border-t border-slate-100 dark:border-white/5">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-10 flex items-center gap-3">
                            <MessageSquare className="w-8 h-8 text-primary" /> Common Questions
                        </h2>
                        <div className="space-y-6">
                            {guide.faqs.map((faq, idx) => (
                                <div key={idx} className="glass-card bg-slate-50 dark:bg-white/5 border-none">
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">{faq.question}</h4>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </article>

                {/* Sidebar CTA */}
                <aside className="lg:col-span-4">
                    <div className="sticky top-24 space-y-6">
                        <div className="rounded-2xl shadow-2xl bg-primary text-white border-none p-8 overflow-hidden relative">
                            <Zap className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
                            <h3 className="text-2xl font-black mb-4 relative z-10 text-white">Put this into practice</h3>
                            <p className="text-white/80 text-sm mb-6 relative z-10 leading-relaxed">
                                Don't just read about connection—build it. Download Decision Jar and start your first shared collection.
                            </p>
                            <Link href="/signup">
                                <Button variant="secondary" className="w-full bg-white text-primary hover:bg-slate-100 font-black relative z-10">
                                    Join for Free
                                </Button>
                            </Link>
                        </div>

                        <div className="glass-card bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 p-6">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-widest text-xs">More Resources</h4>
                            <div className="space-y-4">
                                {RESOURCE_GUIDES.filter(g => g.slug !== slug).map(other => (
                                    <Link key={other.slug} href={`/learn/${other.slug}`} className="group block">
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors line-clamp-2">
                                            {other.title}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Footer Navigation */}
            <div className="bg-slate-50 dark:bg-slate-900/50 py-20 px-6 border-t border-slate-200 dark:border-white/10">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Decision Jar</h3>
                            <p className="text-sm text-slate-500">Connecting people through decisions.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/">
                            <Button variant="ghost" className="font-bold">Home</Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="font-bold px-8">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
