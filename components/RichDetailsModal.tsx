"use client";
import React from "react";
import { X, ChefHat, ShoppingCart, Clock, Utensils, Check, Share2, Plus, Zap, Star, Plane, Map, Calendar, ArrowRight, ChevronDown, ChevronUp, Download, Sparkles } from "lucide-react";
import { downloadShoppingListPdf } from "@/lib/pdf-utils";
import { UnifiedIdeaCard } from "@/components/UnifiedIdeaCard";
import { IdeaTypeRenderer } from "@/components/idea-types/IdeaTypeRenderer";
import { ItineraryMarkdownRenderer } from "./ItineraryMarkdownRenderer";
import { suggestIdeaType, getStandardizedData } from "@/lib/idea-standardizer";

import { Button } from "./ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";

interface RichDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        name: string;
        description: string;
        details: string; // Markdown content
        price?: string;
        google_rating?: string | number;
        duration_label?: string;
        [key: string]: any;
    } | null;
    configId?: string; // e.g. 'holiday_concierge' | 'chef_concierge'
    onAddToJar: () => void;
    onGoAction: () => void;
}

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

    const getIconForSection = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes('shopping') || t.includes('ingredients')) return <ShoppingCart className="w-5 h-5 text-emerald-500" />;
        if (t.includes('time') || t.includes('schedule') || t.includes('prep')) return <Clock className="w-5 h-5 text-blue-500" />;
        if (t.includes('instructions') || t.includes('steps') || t.includes('execution')) return <Utensils className="w-5 h-5 text-orange-500" />;
        return <Check className="w-5 h-5 text-slate-400" />;
    };

    // Unified logic to determine what and how to render
    const effectiveType = data?.ideaType || (data ? suggestIdeaType(data) : null);
    const typeData = data?.typeData || (data ? getStandardizedData(data) : null);
    const hasStandardizedData = !!effectiveType && !!typeData;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent raw className="bg-white dark:bg-slate-900 border-none max-w-3xl">
                {/* Header */}
                <DialogHeader onClose={onClose} showClose={false} className="relative h-32 bg-gradient-to-r p-0 overflow-hidden shrink-0 border-none">
                    <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} flex items-end p-6`}>
                        <div className="absolute top-4 right-4 z-20">
                            <button onClick={onClose} className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="relative z-10 w-full mb-2">
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="flex items-center gap-2 text-white/90 mb-1 text-sm font-bold tracking-wider uppercase">
                                        <ThemeIcon className="w-4 h-4" /> {theme.label}
                                    </div>
                                    <DialogTitle className="text-2xl sm:text-3xl font-black text-white leading-tight shadow-black/10 drop-shadow-md line-clamp-2">{data.name}</DialogTitle>
                                </div>
                                <div className="hidden sm:block text-right whitespace-nowrap pl-4">
                                    <div className="text-3xl font-bold text-white mb-1">{data.price}</div>
                                    {data.google_rating && (
                                        <div className="flex items-center gap-1 text-white/90 bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm justify-end">
                                            <Star className="w-4 h-4 fill-current" /> {data.google_rating} / 5
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: theme.bgPattern, backgroundSize: '20px 20px' }}></div>
                    </div>
                </DialogHeader>

                {/* Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-8 custom-scrollbar">
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

                    {/* RENDERING ENGINE */}
                    <div className="space-y-6">
                        <UnifiedIdeaCard
                            idea={data}
                            effectiveType={effectiveType || undefined}
                            typeData={typeData}
                        />

                        {/* Long-form Markdown Content */}
                        {data.details && (data.details.includes('###') || data.details.includes('**')) && (
                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                                <ItineraryMarkdownRenderer
                                    markdown={data.details}
                                    configId={configId}
                                    theme={theme}
                                />
                            </div>
                        )}

                        {/* Fallback for simple description if no markdown */}
                        {(!data.details || (!data.details.includes('###') && !data.details.includes('**'))) && data.description && (
                            <p className="text-lg text-slate-600 dark:text-slate-300 italic leading-relaxed">
                                {data.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex flex-wrap gap-3 shrink-0">
                    <Button variant="outline" onClick={onAddToJar} className="flex-1 border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 h-12 min-w-[120px]">
                        <Plus className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Add to Jar</span><span className="sm:hidden">Add</span>
                    </Button>

                    {configId === 'chef_concierge' && (
                        <Button
                            variant="outline"
                            onClick={() => downloadShoppingListPdf(data.details, data.name)}
                            className="flex-1 border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 h-12 min-w-[120px]"
                        >
                            <Download className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Shopping List</span><span className="sm:hidden">List</span>
                        </Button>
                    )}

                    <Button onClick={onGoAction} className={`flex-[2] h-12 bg-gradient-to-r text-white font-bold shadow-lg min-w-[160px] ${configId === 'holiday_concierge' ? 'from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 shadow-blue-500/20' : 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20'}`}>
                        <Zap className="w-4 h-4 mr-2" /> {theme.buttonLabel}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
