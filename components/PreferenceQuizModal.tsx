'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PreferenceQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (preferences: QuizPreferences) => Promise<void>;
}

export interface QuizPreferences {
    categories: string[];
    budget: 'free' | 'low' | 'medium' | 'high' | 'any';
    duration: 'quick' | 'medium' | 'long' | 'any';
    activityLevel: 'relaxed' | 'moderate' | 'active' | 'any';
    idealCount: number;
}

const CATEGORIES = [
    { id: 'romantic', label: '💕 Romantic', description: 'Classic date nights' },
    { id: 'adventure', label: '🏔️ Adventure', description: 'Outdoor & exciting' },
    { id: 'cultural', label: '🎭 Cultural', description: 'Arts & museums' },
    { id: 'foodie', label: '🍽️ Foodie', description: 'Dining experiences' },
    { id: 'wellness', label: '🧘 Wellness', description: 'Relaxing & healthy' },
    { id: 'entertainment', label: '🎬 Entertainment', description: 'Movies & shows' },
    { id: 'creative', label: '🎨 Creative', description: 'DIY & crafts' },
    { id: 'spontaneous', label: '🎲 Spontaneous', description: 'Surprise activities' }
];

const BUDGET_OPTIONS = [
    { id: 'free', label: 'Free', description: '$0', icon: '🆓' },
    { id: 'low', label: 'Budget', description: '$1-20', icon: '💵' },
    { id: 'medium', label: 'Moderate', description: '$20-100', icon: '💳' },
    { id: 'high', label: 'Premium', description: '$100+', icon: '💎' },
    { id: 'any', label: 'Any Budget', description: 'No limit', icon: '🌟' }
];

const DURATION_OPTIONS = [
    { id: 'quick', label: 'Quick', description: '< 2 hours', icon: '⚡' },
    { id: 'medium', label: 'Half Day', description: '2-5 hours', icon: '☀️' },
    { id: 'long', label: 'Full Day', description: '5+ hours', icon: '🌙' },
    { id: 'any', label: 'Any Duration', description: 'Flexible', icon: '⏰' }
];

const ACTIVITY_OPTIONS = [
    { id: 'relaxed', label: 'Relaxed', description: 'Low energy', icon: '🛋️' },
    { id: 'moderate', label: 'Moderate', description: 'Some movement', icon: '🚶' },
    { id: 'active', label: 'Active', description: 'High energy', icon: '🏃' },
    { id: 'any', label: 'Any Level', description: 'Mix it up', icon: '🔄' }
];

export function PreferenceQuizModal({ isOpen, onClose, onComplete }: PreferenceQuizModalProps) {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [budget, setBudget] = useState<QuizPreferences['budget']>('any');
    const [duration, setDuration] = useState<QuizPreferences['duration']>('any');
    const [activityLevel, setActivityLevel] = useState<QuizPreferences['activityLevel']>('any');
    const [idealCount, setIdealCount] = useState(20);

    const steps = [
        {
            title: 'What interests you?',
            subtitle: 'Select all that apply',
            component: (
                <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map((category) => (
                        <motion.button
                            key={category.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setSelectedCategories(prev =>
                                    prev.includes(category.id)
                                        ? prev.filter(c => c !== category.id)
                                        : [...prev, category.id]
                                );
                            }}
                            className={`
                                p-4 rounded-xl border-2 text-left transition-all
                                ${selectedCategories.includes(category.id)
                                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/30'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }
                            `}
                        >
                            <div className="text-2xl mb-1">{category.label.split(' ')[0]}</div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                {category.label.split(' ').slice(1).join(' ')}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                {category.description}
                            </div>
                        </motion.button>
                    ))}
                </div>
            ),
            canProceed: selectedCategories.length > 0
        },
        {
            title: 'What\'s your budget?',
            subtitle: 'Typical spending per date',
            component: (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {BUDGET_OPTIONS.map((option) => (
                        <motion.button
                            key={option.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setBudget(option.id as typeof budget)}
                            className={`
                                p-4 rounded-xl border-2 transition-all
                                ${budget === option.id
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }
                            `}
                        >
                            <div className="text-3xl mb-2">{option.icon}</div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{option.label}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{option.description}</div>
                        </motion.button>
                    ))}
                </div>
            ),
            canProceed: true
        },
        {
            title: 'How much time?',
            subtitle: 'Preferred date duration',
            component: (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DURATION_OPTIONS.map((option) => (
                        <motion.button
                            key={option.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDuration(option.id as typeof duration)}
                            className={`
                                p-4 rounded-xl border-2 transition-all
                                ${duration === option.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }
                            `}
                        >
                            <div className="text-3xl mb-2">{option.icon}</div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{option.label}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{option.description}</div>
                        </motion.button>
                    ))}
                </div>
            ),
            canProceed: true
        },
        {
            title: 'Activity level?',
            subtitle: 'Energy & movement preference',
            component: (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {ACTIVITY_OPTIONS.map((option) => (
                        <motion.button
                            key={option.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActivityLevel(option.id as typeof activityLevel)}
                            className={`
                                p-4 rounded-xl border-2 transition-all
                                ${activityLevel === option.id
                                    ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }
                            `}
                        >
                            <div className="text-3xl mb-2">{option.icon}</div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{option.label}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{option.description}</div>
                        </motion.button>
                    ))}
                </div>
            ),
            canProceed: true
        },
        {
            title: 'How many ideas?',
            subtitle: 'AI will generate personalized ideas',
            component: (
                <div className="max-w-md mx-auto">
                    <div className="text-center mb-6">
                        <div className="text-6xl font-black text-gradient bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            {idealCount}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            ideas will be generated
                        </p>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={idealCount}
                        onChange={(e) => setIdealCount(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <span>5 ideas</span>
                        <span>50 ideas</span>
                    </div>
                </div>
            ),
            canProceed: true
        }
    ];

    const currentStep = steps[step];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            await onComplete({
                categories: selectedCategories,
                budget,
                duration,
                activityLevel,
                idealCount
            });
            onClose();
        } catch (error) {
            console.error('Quiz completion error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                    Preference Quiz
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Step {step + 1} of {steps.length}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                                transition={{ duration: 0.3 }}
                                className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {currentStep.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                {currentStep.subtitle}
                            </p>

                            {currentStep.component}
                        </motion.div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between gap-4">
                        <Button
                            onClick={handleBack}
                            disabled={step === 0}
                            variant="outline"
                            className="border-slate-300 dark:border-slate-600"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={!currentStep.canProceed || loading}
                            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white border-none"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : step === steps.length - 1 ? (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate Ideas
                                </>
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
