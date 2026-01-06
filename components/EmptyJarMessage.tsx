'use client';

import { motion } from 'framer-motion';
import { Sparkles, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyJarMessageProps {
    onOpenTemplates?: () => void;
    onAddIdea: () => void;
}

export function EmptyJarMessage({ onOpenTemplates, onAddIdea }: EmptyJarMessageProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-[40vh] flex flex-col items-center justify-center px-4 py-12 text-center"
        >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-pink-600 dark:text-pink-400" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                Your jar is empty!
            </h2>

            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 max-w-md">
                {onOpenTemplates ? (
                    <>Get started in <span className="font-bold text-pink-600 dark:text-pink-400">10 seconds</span> with a pre-filled template</>
                ) : (
                    <>Start adding ideas to your community jar</>
                )}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                {onOpenTemplates && (
                    <Button
                        onClick={onOpenTemplates}
                        className="bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 border-none shadow-lg px-6 py-6 h-auto whitespace-nowrap"
                    >
                        <Layers className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span className="font-semibold">Browse Templates</span>
                    </Button>
                )}

                <Button
                    onClick={onAddIdea}
                    variant="outline"
                    className="border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-6 h-auto whitespace-nowrap"
                >
                    <Sparkles className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="font-semibold">Add Custom Idea</span>
                </Button>
            </div>

            {onOpenTemplates && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-6">
                    6 ready-made templates • 10+ ideas each • Instant setup
                </p>
            )}
        </motion.div>
    );
}
