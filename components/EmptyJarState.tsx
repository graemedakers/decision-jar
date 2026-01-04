'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { JAR_TEMPLATES } from '@/lib/jar-templates';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EmptyJarStateProps {
    onUseTemplate: (templateId: string) => void;
    onCreateCustom: () => void;
}

export function EmptyJarState({ onUseTemplate, onCreateCustom }: EmptyJarStateProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    // Show top 3 most popular templates
    const featuredTemplates = JAR_TEMPLATES.slice(0, 3);

    const handleUseTemplate = async (templateId: string) => {
        setLoading(templateId);
        onUseTemplate(templateId);
    };

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12 max-w-2xl"
            >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-pink-600 dark:text-pink-400" />
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                    Your jar is empty!
                </h2>

                <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
                    Get started in <span className="font-bold text-pink-600 dark:text-pink-400">10 seconds</span> with a pre-filled template
                </p>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                    or create your own custom jar from scratch
                </p>
            </motion.div>

            {/* Featured Templates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-8">
                {featuredTemplates.map((template, index) => (
                    <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                        className="glass-card p-6 hover:shadow-2xl transition-all group cursor-pointer"
                        onClick={() => handleUseTemplate(template.id)}
                    >
                        <div className="text-center mb-4">
                            <div className="text-5xl mb-3">{template.icon}</div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                {template.name.replace(/^[^\w\s]+\s*/, '')}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                                {template.description}
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">
                                <Sparkles className="w-3 h-3" />
                                {template.ideas.length} ideas included
                            </div>
                        </div>

                        <Button
                            disabled={loading === template.id}
                            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 border-none group-hover:scale-105 transition-transform"
                        >
                            {loading === template.id ? 'Creating...' : 'Use This Template'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </motion.div>
                ))}
            </div>

            {/* Custom Jar Option */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-center"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">or</span>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>

                <Button
                    onClick={onCreateCustom}
                    variant="outline"
                    className="border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Custom Jar from Scratch
                </Button>
            </motion.div>

            {/* Browse All Link */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-8"
            >
                <button
                    onClick={() => router.push('/dashboard')} // This will trigger the template browser
                    className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium underline"
                >
                    Browse all {JAR_TEMPLATES.length} templates →
                </button>
            </motion.div>
        </div>
    );
}
