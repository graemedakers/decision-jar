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
    configId?: string; // e.g. 'holiday_concierge' | 'chef_concierge'
    onAddToJar: () => void;
    onGoAction: () => void;
}

import { Plane, Map, Calendar, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

export function RichDetailsModal({ isOpen, onClose, data, configId, onAddToJar, onGoAction }: RichDetailsModalProps) {
    if (!data) return null;

    const [openCards, setOpenCards] = React.useState<Record<number, boolean>>({ 0: false });

    // Toggle function
    const toggleCard = (idx: number) => {
        setOpenCards(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    // --- Dynamic Configuration ---
    const getConfigTheme = () => {
        switch (configId) {
            case 'holiday_concierge':
                return {
                    gradient: 'from-blue-500 to-sky-400',
                    icon: Plane,
                    label: 'Trip Itinerary',
                    buttonLabel: 'View Full Plan',
                    bgPattern: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)',
                    sectionHeaderColor: 'text-blue-600 dark:text-blue-400'
                };
            case 'chef_concierge':
            default:
                return {
                    gradient: 'from-emerald-600 to-teal-700',
                    icon: ChefHat,
                    label: "Chef's Selection",
                    buttonLabel: 'Cook This Menu!',
                    bgPattern: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
                    sectionHeaderColor: 'text-emerald-700 dark:text-emerald-400'
                };
        }
    };

    const theme = getConfigTheme();
    const ThemeIcon = theme.icon;

    // --- Enhanced Markdown Parser ---
    const parseMarkdown = (md: string) => {
        // Special handling for Itineraries (Day 1, Day 2...) to create cards
        const isItinerary = configId === 'holiday_concierge';

        // Split by H3 (###) which we use for Day headers in prompts
        const sections = md.split(/^### /gm);

        return sections.map((section, idx) => {
            if (!section.trim()) return null;

            // If it's the first chunk and doesn't start with a header (intro text)
            if (idx === 0 && !md.startsWith('### ')) {
                return (
                    <div key={idx} className="mb-6 text-slate-600 dark:text-slate-300 italic">
                        {section}
                    </div>
                );
            }

            const [titleLine, ...contentLines] = section.split('\n');
            const body = contentLines.join('\n').trim();

            const renderBody = (text: string) => {
                return text.split('\n').map((line, i) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <div key={i} className="h-2" />;

                    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                        // Sub-headers like **Morning:**
                        return <div key={i} className="font-bold text-slate-800 dark:text-slate-100 mt-3 mb-1">{trimmed.replace(/\*\*/g, '')}</div>;
                    }
                    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                        return <li key={i} className="ml-4 list-disc pl-1 text-slate-600 dark:text-slate-300">{trimmed.replace(/^[-*] /, '')}</li>;
                    }

                    // Link parsing (e.g. Map links)
                    const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
                    if (linkMatch) {
                        const [full, text, url] = linkMatch;
                        const parts = line.split(full);
                        return (
                            <p key={i} className="mb-1 text-sm sm:text-base">
                                {parts[0]}
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium inline-flex items-center gap-0.5">
                                    {text} <ArrowRight className="w-3 h-3" />
                                </a>
                                {parts[1]}
                            </p>
                        );
                    }

                    return <p key={i} className="mb-1 text-sm sm:text-base text-slate-600 dark:text-slate-300">{line}</p>;
                });
            };

            // Itinerary Card Style with Accordion
            if (isItinerary) {
                // For day 1 (idx 1 usually, as idx 0 is intro), default to open if not set
                // Actually, let's just use the state directly. The init state {0:false} might need adjustment if idx=0 is intro text.
                // Let's assume idx 1 is the first real day. 
                const isOpen = openCards[idx];

                return (
                    <div key={idx} className="mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden transition-all duration-300">
                        <button
                            onClick={() => toggleCard(idx)}
                            className="w-full bg-slate-100 dark:bg-slate-700/30 px-4 py-3 border-b border-transparent data-[open=true]:border-slate-200 dark:data-[open=true]:border-white/5 flex items-center justify-between gap-2 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors"
                            data-open={isOpen}
                        >
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{titleLine.trim()}</h3>
                            </div>
                            {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                        </button>

                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="p-4 bg-white/50 dark:bg-transparent">
                                        {renderBody(body)}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            }

            // Default Style (Chef etc)
            return (
                <div key={idx} className="mb-6">
                    <h3 className={`text-xl font-bold mb-3 flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-2 ${theme.sectionHeaderColor}`}>
                        {getIconForSection(titleLine)}
                        {titleLine.trim()}
                    </h3>
                    <div className="leading-relaxed">
                        {renderBody(body)}
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
                        <div className={`relative h-32 bg-gradient-to-r ${theme.gradient} flex items-end p-6 shrink-0`}>
                            <div className="absolute top-4 right-4">
                                <button onClick={onClose} className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="relative z-10 w-full">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="flex items-center gap-2 text-white/90 mb-1 text-sm font-bold tracking-wider uppercase">
                                            <ThemeIcon className="w-4 h-4" /> {theme.label}
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight shadow-black/10 drop-shadow-md line-clamp-2">{data.name}</h2>
                                    </div>
                                    <div className="hidden sm:block text-right whitespace-nowrap pl-4">
                                        <div className="text-3xl font-bold text-white mb-1">{data.price}</div>
                                        {data.google_rating && (
                                            <div className="flex items-center gap-1 text-white/90 bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm justify-end">
                                                <Star className="w-4 h-4 fill-current" /> {data.google_rating} / 5
                                            </div>
                                        )}
                                        {data.duration_label && (
                                            <div className="text-white/80 text-sm font-medium mt-1">
                                                {data.duration_label}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Decorative background pattern */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: theme.bgPattern, backgroundSize: '20px 20px' }}></div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                            {/* Mobile Price/Rating */}
                            <div className="flex sm:hidden justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
                                <div className="flex flex-col">
                                    <span className="font-bold text-2xl text-slate-700 dark:text-slate-200">{data.price}</span>
                                    {data.duration_label && <span className="text-xs text-slate-500">{data.duration_label}</span>}
                                </div>
                                {data.google_rating && (
                                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">
                                        <Star className="w-4 h-4 fill-current" /> {data.google_rating} / 5
                                    </span>
                                )}
                            </div>

                            {data.description && (
                                <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 italic leading-relaxed">
                                    {data.description}
                                </p>
                            )}

                            <div className="prose dark:prose-invert max-w-none">
                                {parseMarkdown(data.details || "# No details available\nSorry, full details could not be loaded.")}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex gap-3 shrink-0">
                            <Button variant="outline" onClick={onAddToJar} className="flex-1 border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
                                <Plus className="w-4 h-4 mr-2" /> Add to Jar
                            </Button>
                            <Button onClick={onGoAction} className={`flex-[2] bg-gradient-to-r text-white font-bold shadow-lg ${configId === 'holiday_concierge' ? 'from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 shadow-blue-500/20' : 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20'}`}>
                                <Zap className="w-4 h-4 mr-2" /> {theme.buttonLabel}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
