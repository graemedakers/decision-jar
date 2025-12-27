
import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        template: '%s | Decision Jar Guide',
        default: 'User Guide | Decision Jar',
    },
    description: 'Learn how to use Decision Jar to make group decisions, find date ideas, and organize social outings.',
};

export default function GuideLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navItems = [
        { href: '/guide', label: 'Introduction' },
        { href: '/guide/setup', label: 'Setup & Jars' },
        { href: '/guide/ideas', label: 'Adding Ideas' },
        { href: '/guide/selection', label: 'Making Choices' },
        { href: '/guide/pro', label: 'Premium Features' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Sidebar navigation */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <nav className="sticky top-24 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <div className="pt-8">
                                <Link
                                    href="/"
                                    className="text-sm text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                                >
                                    &larr; Back to Home
                                </Link>
                            </div>
                        </nav>
                    </aside>

                    {/* Content area */}
                    <main className="flex-1 max-w-3xl">
                        <div className="prose prose-slate dark:prose-invert prose-purple max-w-none">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
