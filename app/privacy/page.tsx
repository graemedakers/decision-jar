"use client";

import { ArrowLeft, Shield, Lock, Eye, Database, Globe, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
    const lastUpdated = "December 30, 2024";

    const sections = [
        {
            icon: <Eye className="w-6 h-6 text-primary" />,
            title: "Information We Collect",
            content: "We collect information you provide directly to us, such as when you create an account (name, email via social providers or manual entry), create jars, and add ideas. We also collect basic usage data to improve the experience."
        },
        {
            icon: <Lock className="w-6 h-6 text-accent" />,
            title: "How We Use Your Data",
            content: "Your data is used to provide the Spin the Jar service, personalize your experience, and sync jars between your devices. We do not sell your personal information to third parties."
        },
        {
            icon: <Database className="w-6 h-6 text-purple-500" />,
            title: "Data Storage & Security",
            content: "We use industry-standard encryption to protect your data. Information is stored securely using professional cloud infrastructure providers (like Vercel and PostgreSQL)."
        },
        {
            icon: <Globe className="w-6 h-6 text-blue-500" />,
            title: "Authentication",
            content: "We use NextAuth.js to handle secure logins. When using Google or Facebook login, we only request the minimum required permissions (email and public profile) to create your account."
        },
        {
            icon: <Shield className="w-6 h-6 text-red-500" />,
            title: "Data Deletion",
            content: "You have the right to request the deletion of your account and all associated data at any time. To do so, please contact us at support@decisionjar.com or use the 'Delete Account' option within your account settings."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">Privacy Policy</span>
                    </div>
                    <div className="w-20" /> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    {/* Hero */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                            Your Privacy <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Matters to Us.</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">Last updated: {lastUpdated}</p>
                    </div>

                    {/* Content Grid */}
                    <div className="grid gap-6">
                        {sections.map((section, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card p-8 group hover:border-primary/30 transition-colors"
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                        {section.icon}
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{section.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {section.content}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact Section */}
                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                            <Mail className="w-8 h-8 text-accent" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Questions?</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                If you have any questions about this Privacy Policy or how we handle your data, feel free to reach out.
                            </p>
                        </div>
                        <a href="mailto:support@decisionjar.com" className="inline-block">
                            <Button className="bg-accent hover:bg-accent/90 text-white font-bold px-8 h-12 rounded-full shadow-lg shadow-accent/25">
                                Contact Support
                            </Button>
                        </a>
                    </div>
                </motion.div>
            </main>

            {/* Simple Footer */}
            <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-slate-200 dark:border-white/5 text-center text-sm text-slate-500">
                &copy; {new Date().getFullYear()} Spin the Jar. All rights reserved.
            </footer>
        </div>
    );
}
