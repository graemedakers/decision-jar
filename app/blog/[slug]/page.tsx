"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { BLOG_POSTS } from "@/lib/seo-content";
import Link from "next/link";
import { ArrowLeft, Clock, MessageSquare, Sparkles, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { notFound } from "next/navigation";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const post = BLOG_POSTS.find(p => p.slug === slug);

    if (!post) {
        return notFound();
    }

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950">
            {/* Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(post.structuredData) }}
            />

            {/* Sticky Top Nav */}
            <nav className="sticky top-0 z-50 w-full glass border-b border-slate-200 dark:border-white/10 px-6 py-4 flex items-center justify-between">
                <Link href="/blog" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                    <ArrowLeft className="w-3 h-3 mr-2" /> Back to Blog
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
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">{post.category}</span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <Clock className="w-3 h-3" /> {post.readTime} Read
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{post.datePublished}</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tight">
                        {post.title}
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic border-l-4 border-primary/20 pl-6">
                        {post.description}
                    </p>

                    <div className="mt-8 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">
                            {post.author.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-500">{post.author}</span>
                    </div>
                </motion.div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 pb-32">
                <article className="lg:col-span-8 space-y-12">
                    {post.sections.map((section, idx) => (
                        <motion.section
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="prose prose-slate dark:prose-invert max-w-none"
                        >
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-primary/40 text-lg">#</span> {section.title}
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                {section.content}
                            </p>
                        </motion.section>
                    ))}

                    {/* FAQ Section (Optional for Blog posts, but maintained for consistency) */}
                    {post.faqs.length > 0 && (
                        <section className="pt-20 border-t border-slate-100 dark:border-white/5">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-10 flex items-center gap-3">
                                <MessageSquare className="w-8 h-8 text-primary" /> Q&A
                            </h2>
                            <div className="space-y-6">
                                {post.faqs.map((faq, idx) => (
                                    <div key={idx} className="glass-card bg-slate-50 dark:bg-white/5 border-none">
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">{faq.question}</h4>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </article>

                {/* Sidebar CTA */}
                <aside className="lg:col-span-4">
                    <div className="sticky top-24 space-y-6">
                        <div className="rounded-2xl shadow-2xl bg-blue-600 text-white border-none p-8 overflow-hidden relative">
                            <Zap className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
                            <h3 className="text-2xl font-black mb-4 relative z-10 text-white">Try it yourself</h3>
                            <p className="text-white/80 text-sm mb-6 relative z-10 leading-relaxed">
                                See these features in action. Spin up a new Jar and start exploring.
                            </p>
                            <Link href="/dashboard">
                                <Button variant="secondary" className="w-full bg-white text-blue-600 hover:bg-slate-100 font-black relative z-10">
                                    Go to Dashboard
                                </Button>
                            </Link>
                        </div>

                        <div className="glass-card bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 p-6">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-widest text-xs">Read Next</h4>
                            <div className="space-y-4">
                                {BLOG_POSTS.filter(p => p.slug !== slug).map(other => (
                                    <Link key={other.slug} href={`/blog/${other.slug}`} className="group block">
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors line-clamp-2">
                                            {other.title}
                                        </p>
                                        <span className="text-[10px] text-slate-400">{other.readTime} read</span>
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
                        <Link href="/blog">
                            <Button variant="ghost" className="font-bold">Back to Blog</Button>
                        </Link>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/signup">
                            <Button className="font-bold px-8">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
