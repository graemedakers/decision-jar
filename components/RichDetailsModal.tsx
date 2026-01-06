import React from "react";
import { X, ChefHat, ShoppingCart, Clock, Utensils, Check, Share2, Plus, Zap, Star } from "lucide-react";
import { Button } from "./ui/Button";
import { motion, AnimatePresence } from "framer-motion";

interface RichDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        name: string;
        description: string;
        details: string; // Markdown content
        price?: string;
        google_rating?: string | number;
        [key: string]: any;
    } | null;
    onAddToJar: () => void;
    onGoAction: () => void;
}

export function RichDetailsModal({ isOpen, onClose, data, onAddToJar, onGoAction }: RichDetailsModalProps) {
    if (!data) return null;

    // Simple parser to structure the markdown content
    const parseMarkdown = (md: string) => {
        const sections = md.split(/^## /gm);
        return sections.map((section, idx) => {
            if (!section.trim()) return null;
            const [title, ...content] = section.split('\n');

            // Clean content
            const body = content.join('\n').trim();

            // Detect list items
            const htmlContent = body.split('\n').map((line, i) => {
                if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                    return <li key={i} className="ml-4 list-disc pl-1 mb-1">{line.replace(/^[-*] /, '')}</li>;
                }
                if (line.trim().match(/^\d+\. /)) {
                    return <li key={i} className="ml-4 list-decimal pl-1 mb-1">{line.replace(/^\d+\. /, '')}</li>;
                }
                if (line.trim().startsWith('### ')) {
                    return <h4 key={i} className="font-bold text-lg mt-4 mb-2 text-emerald-700 dark:text-emerald-400">{line.replace('### ', '')}</h4>;
                }
                if (line.trim().startsWith('**')) {
                    // Simple bold parse
                    const parts = line.split('**');
                    return (
                        <p key={i} className="mb-2">
                            {parts.map((part, p) => p % 2 === 1 ? <strong key={p}>{part}</strong> : part)}
                        </p>
                    );
                }
                if (line.trim() === "") return <br key={i} />;
                return <p key={i} className="mb-2">{line}</p>;
            });

            return (
                <div key={idx} className="mb-8">
                    {title && title.length > 2 && ( // Skip if it's just the intro text before first header
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-2">
                            {getIconForSection(title)}
                            {title.trim()}
                        </h3>
                    )}
                    <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                        {title && title.length > 2 ? htmlContent : (
                            // Intro text handling (before first ##)
                            <div className="text-lg font-medium text-slate-800 dark:text-slate-200 italic border-l-4 border-emerald-500 pl-4 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-r-lg">
                                {section.split('\n').filter(l => l.trim()).map((l, i) => <p key={i}>{l}</p>)}
                            </div>
                        )}
                    </div>
                </div>
            );
        });
    };

    const getIconForSection = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes('shopping') || t.includes('ingredients')) return <ShoppingCart className="w-5 h-5 text-emerald-500" />;
        if (t.includes('time') || t.includes('schedule') || t.includes('prep')) return <Clock className="w-5 h-5 text-blue-500" />;
        if (t.includes('instructions') || t.includes('steps') || t.includes('execution')) return <Utensils className="w-5 h-5 text-orange-500" />;
        if (t.includes('menu') || t.includes('overview')) return <ChefHat className="w-5 h-5 text-purple-500" />;
        return <Check className="w-5 h-5 text-slate-400" />;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10"
                    >
                        {/* Header */}
                        <div className="relative h-32 bg-gradient-to-r from-emerald-600 to-teal-700 flex items-end p-6 shrink-0">
                            <div className="absolute top-4 right-4">
                                <button onClick={onClose} className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="relative z-10 w-full">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="flex items-center gap-2 text-emerald-100 mb-1 text-sm font-bold tracking-wider uppercase">
                                            <ChefHat className="w-4 h-4" /> Chef's Selection
                                        </div>
                                        <h2 className="text-3xl font-black text-white leading-tight shadow-black/20 drop-shadow-md">{data.name}</h2>
                                    </div>
                                    <div className="hidden sm:block text-right">
                                        <div className="text-3xl font-bold text-white mb-1">{data.price}</div>
                                        {data.google_rating && (
                                            <div className="flex items-center gap-1 text-emerald-200 bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                                                <Star className="w-4 h-4 fill-current" /> {data.google_rating} / 5
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Decorative background pattern */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                            {/* Mobile Price/Rating */}
                            <div className="flex sm:hidden justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
                                <span className="font-bold text-2xl text-slate-700 dark:text-slate-200">{data.price}</span>
                                {data.google_rating && (
                                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">
                                        <Star className="w-4 h-4 fill-current" /> {data.google_rating} / 5
                                    </span>
                                )}
                            </div>

                            <div className="prose dark:prose-invert max-w-none">
                                {parseMarkdown(data.details || "# No details available\nSorry, full menu details could not be loaded.")}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex gap-3 shrink-0">
                            <Button variant="outline" onClick={onAddToJar} className="flex-1 border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
                                <Plus className="w-4 h-4 mr-2" /> Add to Jar
                            </Button>
                            <Button onClick={onGoAction} className="flex-[2] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-500/20">
                                <Zap className="w-4 h-4 mr-2" /> Cook This Menu!
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
