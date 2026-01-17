/**
 * WizardFrame - Universal AI Planner Engine
 * 
 * A configuration-driven modal that handles:
 * - Dynamic form generation based on WizardConfig.fields
 * - Branded AI loading states with rotating phrases
 * - Result display and "Add to Jar" actions
 * 
 * Usage:
 * <WizardFrame
 *   isOpen={isOpen}
 *   config={MENU_PLANNER_CONFIG}
 *   callbacks={{ onClose, onIdeaAdded }}
 * />
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check, Plus, RefreshCw, Heart, Share2, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LocationInput } from "@/components/LocationInput";
import { WizardFrameProps, WizardStep, WizardResultItem, WizardField } from "@/lib/types/wizard";
import { useConciergeActions } from "@/hooks/useConciergeActions";
import { showError, showSuccess } from "@/lib/toast";
import { trackAIToolUsed } from "@/lib/analytics";

// ============================================
// LOADING PHRASE ROTATOR
// ============================================

function useRotatingPhrase(phrases: string[], intervalMs: number = 2500) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % phrases.length);
        }, intervalMs);
        return () => clearInterval(timer);
    }, [phrases, intervalMs]);

    return phrases[index];
}

// ============================================
// WIZARD FRAME COMPONENT
// ============================================

export function WizardFrame({
    isOpen,
    config,
    userLocation,
    isPremium = false,
    callbacks,
}: WizardFrameProps) {
    // ---- State Machine ----
    const [step, setStep] = useState<WizardStep>('INPUT');
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [results, setResults] = useState<WizardResultItem[]>([]);
    const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [isPrivate, setIsPrivate] = useState(false);

    const resultsRef = useRef<HTMLDivElement>(null);
    const currentPhrase = useRotatingPhrase(config.loadingPhrases);

    // ---- Hooks ----
    const { handleAddToJar, handleFavorite } = useConciergeActions({
        onIdeaAdded: callbacks.onIdeaAdded,
        onClose: callbacks.onClose,
        setRecommendations: setResults as any,
    });

    // ---- Initialize Form Data ----
    useEffect(() => {
        if (isOpen) {
            const initialData: Record<string, any> = {};
            config.fields.forEach((field) => {
                if (field.id === 'location' && userLocation) {
                    initialData[field.id] = userLocation;
                } else {
                    initialData[field.id] = field.defaultValue;
                }
            });
            setFormData(initialData);
            setResults([]);
            setAddedItems(new Set());
            setStep('INPUT');
            setError(null);
            setIsPrivate(config.showPrivacyToggle ? true : false);
        }
    }, [isOpen, config, userLocation]);

    // ---- Scroll to Results ----
    useEffect(() => {
        if (step === 'REVIEWING' && resultsRef.current) {
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [step]);

    // ---- Form Handlers ----
    const updateField = useCallback((id: string, value: any) => {
        setFormData((prev) => ({ ...prev, [id]: value }));
    }, []);

    // ---- Submit Handler ----
    const handleSubmit = async () => {
        setStep('GENERATING');
        setError(null);

        trackAIToolUsed(config.id, formData);

        try {
            const res = await fetch(config.apiRoute, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, isPrivate }),
            });

            if (res.ok) {
                const data = await res.json();
                const parsed = config.parseResults(data);
                setResults(parsed);
                setStep(parsed.length > 0 ? 'REVIEWING' : 'ERROR');
                if (parsed.length === 0) {
                    setError('No results found. Try adjusting your preferences.');
                }
            } else {
                const errorData = await res.json().catch(() => ({}));
                setError(errorData.error || 'Failed to generate. Please try again.');
                setStep('ERROR');
            }
        } catch (err) {
            console.error('WizardFrame API Error:', err);
            setError('An error occurred. Please try again.');
            setStep('ERROR');
        }
    };

    // ---- Add Item to Jar ----
    const handleAddItem = async (item: WizardResultItem) => {
        if (addedItems.has(item.id)) return;

        const ideaData = config.mapToIdea(item, { ...formData, isPrivate });
        const { description, details, ...restIdeaData } = ideaData;

        await handleAddToJar(
            {
                name: item.title,
                description: description,
                details: details,
                ...restIdeaData,
            },
            config.ideaCategory,
            isPrivate
        );

        setAddedItems((prev) => new Set(prev).add(item.id));
        showSuccess(`"${item.title}" added to your jar!`);
    };

    // ---- Render Field ----
    const renderField = (field: WizardField) => {
        const value = formData[field.id];

        switch (field.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => updateField(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-2.5 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-slate-200 dark:border-white/10"
                    />
                );

            case 'location':
                return (
                    <LocationInput
                        value={value || ''}
                        onChange={(val) => updateField(field.id, val)}
                        placeholder={field.placeholder}
                    />
                );

            case 'number':
                return (
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-2 rounded-xl">
                        <button
                            type="button"
                            onClick={() => updateField(field.id, Math.max((field as any).min || 0, (value || 0) - 1))}
                            className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg text-slate-600 font-bold"
                        >
                            -
                        </button>
                        <span className="flex-1 text-center font-black text-slate-900 dark:text-white text-xl">
                            {value}
                        </span>
                        <button
                            type="button"
                            onClick={() => updateField(field.id, Math.min((field as any).max || 100, (value || 0) + 1))}
                            className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg text-slate-600 font-bold"
                        >
                            +
                        </button>
                    </div>
                );

            case 'select':
                return (
                    <select
                        value={value || ''}
                        onChange={(e) => updateField(field.id, e.target.value)}
                        className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-2.5 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-slate-200 dark:border-white/10"
                    >
                        {(field as any).options?.map((opt: any) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                );

            case 'button-group':
                return (
                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl flex-wrap gap-1">
                        {(field as any).options?.map((opt: any) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => updateField(field.id, opt.value)}
                                className={`flex-1 min-w-[80px] py-2 px-3 text-xs font-bold rounded-lg transition-all ${value === opt.value
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                );

            case 'multi-select':
                const selectedValues = value || [];
                return (
                    <div className="flex flex-wrap gap-2">
                        {(field as any).options?.map((opt: any) => {
                            const isSelected = selectedValues.includes(opt.value);
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        const newValue = isSelected
                                            ? selectedValues.filter((v: string) => v !== opt.value)
                                            : [...selectedValues, opt.value];
                                        updateField(field.id, newValue);
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isSelected
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                );

            case 'toggle':
                return (
                    <button
                        type="button"
                        onClick={() => updateField(field.id, !value)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${value
                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-500 border border-slate-200 dark:border-white/10'
                            }`}
                    >
                        <Lock className="w-3.5 h-3.5" />
                        {value ? (field as any).onLabel || 'On' : (field as any).offLabel || 'Off'}
                    </button>
                );

            default:
                return null;
        }
    };

    // ---- Render ----
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card w-full max-w-2xl relative max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl"
                    >
                        {/* Header */}
                        <div className={`p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-gradient-to-r ${config.headerGradient || 'from-primary/5 to-accent/5'} rounded-t-3xl`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center shadow-inner ${config.iconColor || 'text-primary'}`}>
                                    <config.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {config.title}
                                    </h2>
                                    {config.subtitle && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                            {config.subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={callbacks.onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-all hover:rotate-90"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* INPUT STEP */}
                            {step === 'INPUT' && (
                                <div className="space-y-4">
                                    {config.fields.map((field) => (
                                        <div key={field.id} className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                                {field.label}
                                            </label>
                                            {renderField(field)}
                                            {field.helpText && (
                                                <p className="text-[10px] text-slate-500 leading-tight">{field.helpText}</p>
                                            )}
                                        </div>
                                    ))}

                                    {/* Privacy Toggle (if enabled) */}
                                    {config.showPrivacyToggle && (
                                        <div className="flex items-center justify-between pt-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Privacy</label>
                                            <button
                                                type="button"
                                                onClick={() => setIsPrivate(!isPrivate)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isPrivate
                                                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                                    : 'bg-slate-100 dark:bg-white/10 text-slate-500 border border-slate-200 dark:border-white/10'
                                                    }`}
                                            >
                                                <Lock className="w-3.5 h-3.5" />
                                                {isPrivate ? 'Secret Mode On' : 'Public Mode'}
                                            </button>
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleSubmit}
                                        className={`w-full h-14 bg-gradient-to-r from-primary to-accent hover:scale-[1.02] transition-all text-white font-black text-lg shadow-xl rounded-2xl`}
                                    >
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Generate
                                    </Button>
                                </div>
                            )}

                            {/* GENERATING STEP */}
                            {step === 'GENERATING' && (
                                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-primary/20 rounded-3xl animate-pulse" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest">
                                            {config.loadingTitle || 'Generating...'}
                                        </h3>
                                        <motion.p
                                            key={currentPhrase}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium"
                                        >
                                            {currentPhrase}
                                        </motion.p>
                                    </div>
                                </div>
                            )}

                            {/* ERROR STEP */}
                            {step === 'ERROR' && (
                                <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
                                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                                        <X className="w-8 h-8 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Something went wrong</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{error}</p>
                                    </div>
                                    <Button onClick={() => setStep('INPUT')} variant="outline">
                                        Try Again
                                    </Button>
                                </div>
                            )}

                            {/* REVIEWING STEP */}
                            {step === 'REVIEWING' && (
                                <div ref={resultsRef} className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {typeof config.resultTitle === 'function'
                                            ? config.resultTitle(results.length)
                                            : config.resultTitle || 'Results'}
                                    </h3>

                                    <div className={`space-y-3 ${config.resultLayout === 'grid' ? 'grid grid-cols-2 gap-3' : ''}`}>
                                        {results.map((item) => (
                                            <div
                                                key={item.id}
                                                className="bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        {item.subtitle && (
                                                            <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                                                {item.subtitle}
                                                            </span>
                                                        )}
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg mt-1">
                                                            {item.title}
                                                        </h4>
                                                        {item.description && (
                                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button
                                                    size="sm"
                                                    variant={addedItems.has(item.id) ? 'ghost' : 'secondary'}
                                                    className={`w-full mt-3 text-xs ${addedItems.has(item.id) ? 'text-green-600 dark:text-green-400' : ''}`}
                                                    onClick={() => handleAddItem(item)}
                                                    disabled={addedItems.has(item.id)}
                                                >
                                                    {addedItems.has(item.id) ? (
                                                        <><Check className="w-3 h-3 mr-1" /> Added</>
                                                    ) : (
                                                        <><Plus className="w-3 h-3 mr-1" /> Add to Jar</>
                                                    )}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-4">
                                        <Button onClick={() => setStep('INPUT')} variant="outline" className="flex-1">
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Start Over
                                        </Button>
                                        <Button onClick={callbacks.onClose} className="flex-1">
                                            Done
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
