'use client';

import { motion } from 'framer-motion';
import { Sparkles, Plus, Wand2, Layers, ClipboardList, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

interface EnhancedEmptyStateProps {
    onAddIdea: () => void;
    onSurpriseMe: () => void;
    onBrowseTemplates: () => void;
    onTakeQuiz: () => void;
}

export function EnhancedEmptyState({
    onAddIdea,
    onSurpriseMe,
    onBrowseTemplates,
    onTakeQuiz
}: EnhancedEmptyStateProps) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const quickStartOptions = [
        {
            id: 'manual',
            title: 'Add First Idea Manually',
            description: 'Start simple with your own custom idea',
            icon: Plus,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20 hover:border-blue-500/40',
            onClick: onAddIdea,
            badge: 'Classic'
        },
        {
            id: 'ai',
            title: 'Surprise Me with AI',
            description: 'One-click AI-powered idea generation',
            icon: Wand2,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20 hover:border-purple-500/40',
            onClick: onSurpriseMe,
            badge: 'Instant',
            featured: true
        },
        {
            id: 'template',
            title: 'Import from Template',
            description: 'Pre-made sets with 10-50 ready ideas',
            icon: Layers,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/20 hover:border-green-500/40',
            onClick: onBrowseTemplates,
            badge: 'Popular'
        },
        {
            id: 'quiz',
            title: 'Take the Quiz',
            description: 'AI bulk generates ideas based on your preferences',
            icon: ClipboardList,
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/20 hover:border-orange-500/40',
            onClick: onTakeQuiz,
            badge: 'Personalized'
        }
    ];

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
            {/* Animated Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-8"
            >
                {/* Animated Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                        damping: 15
                    }}
                    className="relative w-24 h-24 mx-auto mb-6"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border-2 border-pink-500/20">
                        <Zap className="w-12 h-12 text-pink-600 dark:text-pink-400" />
                    </div>
                </motion.div>

                {/* Headline */}
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Get started in seconds!
                </h1>

                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    Choose your preferred way to fill your jar with amazing ideas
                </p>
            </motion.div>

            {/* Quick Start Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mb-8">
                {quickStartOptions.map((option, index) => (
                    <motion.div
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                        onMouseEnter={() => setHoveredCard(option.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        className="relative"
                    >
                        <motion.div
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                                relative glass-card p-6 cursor-pointer 
                                border-2 ${option.borderColor}
                                transition-all duration-300
                                ${option.featured ? 'ring-2 ring-purple-500/50 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''}
                                ${hoveredCard === option.id ? 'shadow-2xl' : 'shadow-lg'}
                            `}
                            onClick={option.onClick}
                            role="button"
                            tabIndex={0}
                            aria-label={`${option.title}: ${option.description}`}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    option.onClick();
                                }
                            }}
                        >
                            {/* Featured Badge */}
                            {option.featured && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                                >
                                    ✨ Recommended
                                </motion.div>
                            )}

                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`
                                    w-14 h-14 rounded-xl flex items-center justify-center
                                    bg-gradient-to-br ${option.color}
                                    ${hoveredCard === option.id ? 'scale-110' : 'scale-100'}
                                    transition-transform duration-300
                                `}>
                                    <option.icon className="w-7 h-7 text-white" />
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {option.title}
                                        </h3>
                                        <span className={`
                                            text-xs font-semibold px-2 py-0.5 rounded-full
                                            ${option.bgColor}
                                        `}>
                                            {option.badge}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                        {option.description}
                                    </p>

                                    {/* CTA Button */}
                                    <motion.div
                                        whileHover={{ x: 4 }}
                                        className="flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"
                                    >
                                        Get Started
                                        <motion.span
                                            animate={{ x: hoveredCard === option.id ? [0, 4, 0] : 0 }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                        >
                                            →
                                        </motion.span>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                ))}
            </div>

            {/* Tips Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="text-center max-w-2xl"
            >
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Sparkles className="w-4 h-4" />
                    <span>
                        <span className="font-semibold text-pink-600 dark:text-pink-400">💡 Pro Tip:</span>
                        {' '}Start with "Surprise Me" for instant inspiration, then customize later
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
