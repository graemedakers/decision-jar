"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Loader2, Sparkles, Lock, LucideIcon, Search, ArrowLeft } from "lucide-react";
import { ConciergeShortcutButton } from "./ConciergeShortcutButton";
import { Button } from "./ui/Button";
import { LocationInput } from "./LocationInput";
import { ConciergeResultCard } from "@/components/ConciergeResultCard";
import { RichDetailsModal } from "./RichDetailsModal";
import { ItineraryMarkdownRenderer } from "./ItineraryMarkdownRenderer";
import { useDemoConcierge } from "@/lib/use-demo-concierge";
import { DemoUpgradePrompt } from "./DemoUpgradePrompt";
import { trackAIToolUsed, trackConciergeSkillSelected, trackIntentDetectionResult, trackModalAbandoned } from "@/lib/analytics";
import { useConciergeActions } from "@/hooks/useConciergeActions";
import { getCurrentLocation } from "@/lib/utils";
import { ConciergeSkillPicker } from "./ConciergeSkillPicker";
import { detectIntent, getIntentConfidence } from "@/lib/intent-detection";
import { CONCIERGE_CONFIGS } from "@/lib/concierge-configs";
import { ACTION_LABELS } from "@/lib/ui-constants";

// --- Configuration Interfaces ---

export interface ConciergeSection {
    id: string;
    label: string;
    icon?: LucideIcon;
    type: 'multi-select' | 'single-select' | 'text' | 'date-range';
    options?: string[];
    allowCustom?: boolean; // New: Allow user to type a custom value
    condition?: {
        sectionId: string;
        values: string[]; // Show if ONE of these is selected in the target section
    };
}

export interface ConciergeToolConfig {
    id: string; // e.g. 'dining_concierge'
    title: string;
    subtitle: string;
    icon: LucideIcon;
    colorTheme: 'blue' | 'purple' | 'orange' | 'green' | 'rose' | 'amber' | 'emerald' | 'indigo' | 'pink' | 'red';

    // Features
    hasLocation: boolean; // formatting as always-on if true
    locationCondition?: { // New: Optional condition to show location
        sectionId: string;
        values: string[];
    };
    hasPrice: boolean;

    // Input Configuration
    sections: ConciergeSection[];

    // Result Card Configuration
    categoryType: string; // For adding to jar
    resultCard: {
        mainIcon: LucideIcon;
        subtextKey?: string; // e.g. 'cuisine' or 'speciality'
        secondIcon?: LucideIcon;
        secondSubtextKey?: string;
        goActionLabel?: string;
        ratingClass?: string; // Tailwind class for star color
    }
}

interface GenericConciergeModalProps {
    isOpen: boolean;
    onClose: () => void;
    config?: ConciergeToolConfig; // Now optional - shows skill picker if not provided
    skillId?: string; // Alternative: pass skill ID to load from CONCIERGE_CONFIGS
    userLocation?: string;
    initialPrompt?: string; // New: Support for Smart Input Bar
    onIdeaAdded?: () => void;
    onGoTonight?: (idea: any) => void;
    onFavoriteUpdated?: () => void;
    onUpdateUserLocation?: (newLocation: string) => void;
    isPremium?: boolean; // For premium-only features like shortcuts
}

// --- Theme Helper ---
const getThemeClasses = (theme: string) => {
    const maps: Record<string, any> = {
        orange: {
            bg: 'bg-orange-100 dark:bg-orange-500/20',
            text: 'text-orange-600 dark:text-orange-400',
            button: 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
            shadow: 'shadow-orange-500/20',
            selected: 'bg-orange-500 text-white shadow-lg shadow-orange-500/20',
            border: 'border-orange-500',
            ring: 'focus:ring-orange-500',
            lightBg: 'bg-orange-500/10'
        },
        purple: {
            bg: 'bg-purple-100 dark:bg-purple-500/20',
            text: 'text-purple-600 dark:text-purple-400',
            button: 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700',
            shadow: 'shadow-purple-500/20',
            selected: 'bg-purple-500 text-white shadow-lg shadow-purple-500/20',
            border: 'border-purple-500',
            ring: 'focus:ring-purple-500',
            lightBg: 'bg-purple-500/10'
        },
        blue: {
            bg: 'bg-blue-100 dark:bg-blue-500/20',
            text: 'text-blue-600 dark:text-blue-400',
            button: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
            shadow: 'shadow-blue-500/20',
            selected: 'bg-blue-500 text-white shadow-lg shadow-blue-500/20',
            border: 'border-blue-500',
            ring: 'focus:ring-blue-500',
            lightBg: 'bg-blue-500/10'
        },
        green: {
            bg: 'bg-green-100 dark:bg-green-500/20',
            text: 'text-green-600 dark:text-green-400',
            button: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
            shadow: 'shadow-green-500/20',
            selected: 'bg-green-500 text-white shadow-lg shadow-green-500/20',
            border: 'border-green-500',
            ring: 'focus:ring-green-500',
            lightBg: 'bg-green-500/10'
        },
        rose: {
            bg: 'bg-rose-100 dark:bg-rose-500/20',
            text: 'text-rose-600 dark:text-rose-400',
            button: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700',
            shadow: 'shadow-rose-500/20',
            selected: 'bg-rose-500 text-white shadow-lg shadow-rose-500/20',
            border: 'border-rose-500',
            ring: 'focus:ring-rose-500',
            lightBg: 'bg-rose-500/10'
        },
        amber: {
            bg: 'bg-amber-100 dark:bg-amber-500/20',
            text: 'text-amber-600 dark:text-amber-400',
            button: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
            shadow: 'shadow-amber-500/20',
            selected: 'bg-amber-500 text-white shadow-lg shadow-amber-500/20',
            border: 'border-amber-500',
            ring: 'focus:ring-amber-500',
            lightBg: 'bg-amber-500/10'
        },
        emerald: {
            bg: 'bg-emerald-100 dark:bg-emerald-500/20',
            text: 'text-emerald-600 dark:text-emerald-400',
            button: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
            shadow: 'shadow-emerald-500/20',
            selected: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
            border: 'border-emerald-500',
            ring: 'focus:ring-emerald-500',
            lightBg: 'bg-emerald-500/10'
        },
        indigo: {
            bg: 'bg-indigo-100 dark:bg-indigo-500/20',
            text: 'text-indigo-600 dark:text-indigo-400',
            button: 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700',
            shadow: 'shadow-indigo-500/20',
            selected: 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20',
            border: 'border-indigo-500',
            ring: 'focus:ring-indigo-500',
            lightBg: 'bg-indigo-500/10'
        },
        pink: {
            bg: 'bg-pink-100 dark:bg-pink-500/20',
            text: 'text-pink-600 dark:text-pink-400',
            button: 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700',
            shadow: 'shadow-pink-500/20',
            selected: 'bg-pink-500 text-white shadow-lg shadow-pink-500/20',
            border: 'border-pink-500',
            ring: 'focus:ring-pink-500',
            lightBg: 'bg-pink-500/10'
        },
        red: {
            bg: 'bg-red-100 dark:bg-red-500/20',
            text: 'text-red-600 dark:text-red-400',
            button: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
            shadow: 'shadow-red-500/20',
            selected: 'bg-red-500 text-white shadow-lg shadow-red-500/20',
            border: 'border-red-500',
            ring: 'focus:ring-red-500',
            lightBg: 'bg-red-500/10'
        }
    };
    return maps[theme] || maps.blue;
};

export function GenericConciergeModal({
    isOpen,
    onClose,
    config: initialConfig,
    skillId,
    userLocation,
    initialPrompt,
    onIdeaAdded,
    onGoTonight,
    onFavoriteUpdated,
    onUpdateUserLocation,
    isPremium = false
}: GenericConciergeModalProps) {
    const demoConcierge = useDemoConcierge();
    const [showTrialUsedPrompt, setShowTrialUsedPrompt] = useState(false);

    // Dynamic config selection - can change based on user input or skill picker
    const [activeConfig, setActiveConfig] = useState<ConciergeToolConfig | null>(() => {
        if (initialConfig) return initialConfig;
        if (skillId && CONCIERGE_CONFIGS[skillId]) return CONCIERGE_CONFIGS[skillId];
        return null; // Show skill picker
    });

    // Show skill picker when no config is selected
    const [showSkillPicker, setShowSkillPicker] = useState(!initialConfig && !skillId);

    const [isLoading, setIsLoading] = useState(false);

    // State Store for all dynamic inputs
    const [selections, setSelections] = useState<Record<string, string[]>>({});
    const [customInputs, setCustomInputs] = useState<Record<string, string>>({}); // New: Store custom text inputs
    const [dateRanges, setDateRanges] = useState<Record<string, { start: string, end: string }>>({}); // New: Store dates

    const [location, setLocation] = useState(userLocation || "");
    const [price, setPrice] = useState("any");
    const [isPrivate, setIsPrivate] = useState(true);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const resultsRef = useRef<HTMLDivElement>(null);
    const [viewingItem, setViewingItem] = useState<any | null>(null);
    const [expandedRecIndex, setExpandedRecIndex] = useState<number | null>(null);

    // Abandonment tracking
    const [modalOpenTime, setModalOpenTime] = useState<number | null>(null);
    const [hadInteraction, setHadInteraction] = useState(false);
    const [lastFieldTouched, setLastFieldTouched] = useState<string>('');

    // Use active config or fallback to initial
    const config = activeConfig || initialConfig || CONCIERGE_CONFIGS.CONCIERGE;
    const theme = getThemeClasses(config.colorTheme);

    // Find the CONCIERGE_CONFIGS key for this config (for deep links)
    const configKey = Object.entries(CONCIERGE_CONFIGS).find(
        ([_, cfg]) => cfg.id === config.id
    )?.[0] || skillId || 'CONCIERGE';

    // Track modal open time for abandonment analytics
    useEffect(() => {
        if (isOpen) {
            setModalOpenTime(Date.now());
            setHadInteraction(false);
            setLastFieldTouched('');
        }
    }, [isOpen]);

    // Initialize location and custom inputs on first open
    // React key pattern ensures this component remounts when tool changes
    useEffect(() => {
        if (isOpen) {
            // Fill location if not already set
            if (!location && userLocation) {
                setLocation(userLocation);
            }
            // Set initial prompt if provided and selections are empty
            if (initialPrompt && Object.keys(selections).length === 0) {
                setCustomInputs({ extraInstructions: initialPrompt });

                // Auto-detect intent from initial prompt
                if (!activeConfig || activeConfig.id === 'generic_concierge') {
                    const detectedIntent = detectIntent(initialPrompt);
                    if (detectedIntent && detectedIntent !== 'CONCIERGE' && CONCIERGE_CONFIGS[detectedIntent]) {
                        const confidence = getIntentConfidence(initialPrompt, detectedIntent);
                        // Lower threshold (0.05 = 5%) to be more helpful - even single keyword match is useful
                        if (confidence > 0.05) {
                            // Track successful intent detection
                            trackIntentDetectionResult(initialPrompt, detectedIntent, true);
                            trackConciergeSkillSelected(detectedIntent, 'intent_detection', {
                                user_input: initialPrompt,
                                confidence: confidence,
                                available_skills_count: Object.keys(CONCIERGE_CONFIGS).length
                            });

                            setActiveConfig(CONCIERGE_CONFIGS[detectedIntent]);
                            setShowSkillPicker(false);
                        } else {
                            // Track low confidence detection (not used)
                            trackIntentDetectionResult(initialPrompt, detectedIntent, false);
                        }
                    } else {
                        // Track no intent detected
                        trackIntentDetectionResult(initialPrompt, detectedIntent, false);
                    }
                }
            }
        }
    }, [isOpen, userLocation, initialPrompt]);

    // Handle skill selection from picker
    const handleSkillSelect = (selectedConfig: ConciergeToolConfig) => {
        // Check if this is a correction from auto-detected intent
        const wasAutoDetected = !showSkillPicker && activeConfig && activeConfig.id !== selectedConfig.id;
        const previousSkillId = activeConfig?.id;

        // Track manual skill selection
        trackConciergeSkillSelected(selectedConfig.id, 'picker', {
            was_corrected: wasAutoDetected ?? undefined,
            available_skills_count: Object.keys(CONCIERGE_CONFIGS).length
        });

        // If user is correcting auto-detection, track that
        if (wasAutoDetected && previousSkillId) {
            trackIntentDetectionResult(
                customInputs.extraInstructions || '',
                previousSkillId,
                false,
                selectedConfig.id
            );
        }

        setActiveConfig(selectedConfig);
        setShowSkillPicker(false);
        // Clear previous selections when switching skills
        setSelections({});
        setRecommendations([]);
    };

    // Handle back to skill picker
    const handleBackToSkillPicker = () => {
        setShowSkillPicker(true);
        setRecommendations([]);
    };

    // Helper to mark user interaction
    const markInteraction = (fieldName: string) => {
        setHadInteraction(true);
        setLastFieldTouched(fieldName);
    };

    // Enhanced onClose with abandonment tracking
    const handleClose = () => {
        // Track abandonment if modal is being closed without getting recommendations
        if (modalOpenTime && !isLoading && recommendations.length === 0) {
            const timeOpenSeconds = (Date.now() - modalOpenTime) / 1000;
            trackModalAbandoned('concierge', timeOpenSeconds, hadInteraction, {
                last_field_touched: lastFieldTouched || undefined,
                skill_id: activeConfig?.id || 'none',
                had_skill_selected: !!activeConfig
            });
        }
        onClose();
    };

    // Sync location if it arrives late (after modal already open)
    useEffect(() => {
        if (isOpen && userLocation && !location) {
            setLocation(userLocation);
        }
    }, [userLocation, isOpen, location]);

    // Scroll to results when recommendations appear
    useEffect(() => {
        if (recommendations.length > 0 && resultsRef.current) {
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [recommendations]);

    // Concierge action handlers
    const { handleAddToJar, handleGoTonight: handleGoTonightFromHook, handleFavorite, addingItemName } = useConciergeActions({
        onIdeaAdded,
        onGoTonight,
        onFavoriteUpdated,
        onClose,
        setRecommendations
    });

    const onGoAction = (rec: any) => {
        if (config.id === 'chef_concierge' || config.id === 'holiday_concierge') {
            setViewingItem(rec);
        } else {
            handleGoTonightFromHook(rec, config.categoryType, isPrivate);
        }
    };

    const toggleSelection = (option: string, sectionId: string, type: 'multi-select' | 'single-select') => {
        markInteraction(`selection_${sectionId}`);
        setSelections(prev => {
            const current = prev[sectionId] || [];
            if (type === 'single-select') {
                return { ...prev, [sectionId]: current.includes(option) ? [] : [option] };
            } else {
                return {
                    ...prev,
                    [sectionId]: current.includes(option)
                        ? current.filter(i => i !== option)
                        : [...current, option]
                };
            }
        });
    };

    const handleGetRecommendations = async () => {
        if (demoConcierge && !demoConcierge.hasUsedTrial) {
            demoConcierge.onUse();
        }

        setIsLoading(true);

        // Auto-save location preference if it has changed/is set
        if ((config.hasLocation || (config.locationCondition && (selections[config.locationCondition.sectionId] || []).some(v => config.locationCondition?.values.includes(v)))) && location && location !== userLocation) {
            // 1. Persist to DB
            fetch('/api/user/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location })
            }).catch(err => console.error("Failed to save location preference:", err));

            // 2. Update Parent State (if callback provided)
            if (onUpdateUserLocation) {
                onUpdateUserLocation(location);
            }
        }

        // Flatten selections for Analytics & API
        const selectionMap: Record<string, string> = {};

        config.sections.forEach(section => {
            const key = section.id;
            const selectedValues = [...(selections[key] || [])];

            // Append custom input if exists for this section
            if (customInputs[key] && customInputs[key].trim()) {
                selectedValues.push(customInputs[key].trim());
            }

            // Append date range if exists
            if (section.type === 'date-range' && dateRanges[key]) {
                const { start, end } = dateRanges[key];
                if (start || end) {
                    selectedValues.push(`From: ${start || 'Any'} To: ${end || 'Any'}`);
                    selectionMap[key + '_start'] = start;
                    selectionMap[key + '_end'] = end;
                }
            }

            if (selectedValues.length > 0) {
                selectionMap[key] = selectedValues.join(", ");
            }
        });

        const isLocationRelevant = config.hasLocation || (config.locationCondition &&
            (selections[config.locationCondition.sectionId] || []).some(v => config.locationCondition?.values.includes(v)));

        trackAIToolUsed(config.id, {
            ...selectionMap,
            location: isLocationRelevant ? location : undefined,
            price: config.hasPrice ? price : undefined
        });

        try {
            const headers: any = { 'Content-Type': 'application/json' };
            if (demoConcierge) {
                headers['x-demo-mode'] = 'true';
            }

            const body = {
                configId: config.id, // Now sending configId instead of implicit endpoint logic
                inputs: selectionMap,
                location: isLocationRelevant ? location : undefined,
                price: config.hasPrice ? price : undefined,
                extraInstructions: customInputs['extraInstructions'], // Support for extra instructions if added later
                isDemo: !!demoConcierge // ✅ FIX: Signal demo mode to backend
            };

            const res = await fetch('/api/concierge', { // New Unified Endpoint
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });

            if (res.ok) {
                const data = await res.json();
                setRecommendations(data.recommendations || []);

                if (demoConcierge && demoConcierge.triesRemaining === 0) {
                    setTimeout(() => {
                        setShowTrialUsedPrompt(true);
                    }, 3000);
                }
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(`Error: ${errorData.error || "Failed to fetch recommendations."}`);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <div key="concierge-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        key="concierge-modal-content"
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] rounded-3xl shadow-xl flex flex-col overflow-hidden relative ring-1 ring-white/10"
                    >
                        {/* HEADER */}
                        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-gradient-to-r from-transparent via-transparent to-white/5">
                            <div className="flex items-center gap-3">
                                {!showSkillPicker && activeConfig && (
                                    <button
                                        onClick={handleBackToSkillPicker}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                                        aria-label="Back to skill picker"
                                    >
                                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    </button>
                                )}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme.bg}`}>
                                    <config.icon className={`w-5 h-5 ${theme.text}`} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{config.title}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{config.subtitle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {/* Premium: Add shortcut button */}
                                {!showSkillPicker && config && (
                                    <ConciergeShortcutButton
                                        toolId={configKey}
                                        toolName={config.title}
                                        isPremium={isPremium}
                                    />
                                )}
                                <button
                                    onClick={handleClose}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-6 px-7 custom-scrollbar">
                            {/* SKILL PICKER VIEW */}
                            {showSkillPicker ? (
                                <ConciergeSkillPicker
                                    onSelectSkill={handleSkillSelect}
                                    currentSkillId={activeConfig?.id}
                                    onClose={handleClose}
                                />
                            ) : (
                                <div className="space-y-6">
                                    {/* ORIGINAL FORM VIEW */}
                                    {/* LOCATION */}
                                    {/* LOCATION */}
                                    {(config.hasLocation || (config.locationCondition && (selections[config.locationCondition.sectionId] || []).some(v => config.locationCondition?.values.includes(v)))) && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location to Search</label>
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        markInteraction('location_gps');
                                                        try {
                                                            const currentLoc = await getCurrentLocation();
                                                            setLocation(currentLoc);
                                                        } catch (err) {
                                                            alert("Could not get location. Please check permissions.");
                                                        }
                                                    }}
                                                    className={`text-[10px] uppercase tracking-wider font-bold ${theme.text} hover:opacity-80 transition-colors flex items-center gap-1`}
                                                >
                                                    <MapPin className="w-3 h-3" />
                                                    Use GPS
                                                </button>
                                            </div>
                                            <LocationInput
                                                value={location}
                                                onChange={(val) => {
                                                    markInteraction('location_input');
                                                    setLocation(val);
                                                }}
                                                placeholder="City, Neighborhood, or Zip"
                                                className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                                                updateProfileLocation={true}
                                            />
                                        </div>
                                    )}

                                    {/* DYNAMIC SECTIONS */}
                                    {config.sections.map((section) => {
                                        // Check visibility condition
                                        if (section.condition) {
                                            const triggerValues = selections[section.condition.sectionId] || [];
                                            const isVisible = triggerValues.some(v => section.condition!.values.includes(v));
                                            if (!isVisible) return null;
                                        }

                                        return (
                                            <div key={section.id} className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    {section.icon && <section.icon className={`w-4 h-4 ${theme.text}`} />}
                                                    {section.label}
                                                </label>

                                                {section.type === 'date-range' ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="date"
                                                            value={dateRanges[section.id]?.start || ''}
                                                            onChange={(e) => {
                                                                markInteraction(`date_start_${section.id}`);
                                                                setDateRanges(prev => ({ ...prev, [section.id]: { ...prev[section.id], start: e.target.value } }));
                                                            }}
                                                            className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${theme.ring} bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white`}
                                                            placeholder="Check In"
                                                        />
                                                        <span className="text-slate-400">to</span>
                                                        <input
                                                            type="date"
                                                            value={dateRanges[section.id]?.end || ''}
                                                            onChange={(e) => {
                                                                markInteraction(`date_end_${section.id}`);
                                                                setDateRanges(prev => ({ ...prev, [section.id]: { ...prev[section.id], end: e.target.value } }));
                                                            }}
                                                            className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${theme.ring} bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white`}
                                                            placeholder="Check Out"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {(section.options || []).map((option) => {
                                                            const isActive = (selections[section.id] || []).includes(option);
                                                            return (
                                                                <button
                                                                    key={option}
                                                                    onClick={() => toggleSelection(option, section.id, section.type as 'multi-select' | 'single-select')}
                                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isActive
                                                                        ? theme.selected
                                                                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200'
                                                                        }`}
                                                                >
                                                                    {option}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {section.allowCustom && section.type !== 'date-range' && (
                                                    <div className="mt-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Other (specify)..."
                                                            value={customInputs[section.id] || ''}
                                                            onChange={(e) => {
                                                                markInteraction(`custom_${section.id}`);
                                                                setCustomInputs(prev => ({ ...prev, [section.id]: e.target.value }));
                                                            }}
                                                            className={`w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${theme.ring} bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400`}
                                                            aria-label={`Custom ${section.label}`}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* PRICE */}
                                    {config.hasPrice && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Price Range</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['any', 'cheap', 'moderate', 'expensive'].map((p) => (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => {
                                                            markInteraction('price');
                                                            setPrice(p);
                                                        }}
                                                        className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${price === p
                                                            ? `${theme.lightBg} ${theme.border} ${theme.text}`
                                                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {p === 'any' ? 'Any' : p.charAt(0).toUpperCase() + p.slice(1)} {p !== 'any' && `(${p === 'cheap' ? '$' : p === 'moderate' ? '$$' : '$$$'})`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}



                                    {/* EXTRA INSTRUCTIONS (Unified Support) */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Additional Details / Requests</label>
                                        <textarea
                                            value={customInputs['extraInstructions'] || ''}
                                            onChange={(e) => setCustomInputs(prev => ({ ...prev, extraInstructions: e.target.value }))}
                                            placeholder="e.g. Make it kid frendly, or 'We love spicy food'..."
                                            className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 ${theme.ring} bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 min-h-[80px] resize-none`}
                                        />
                                    </div>

                                    <div className="py-2">
                                        <Button
                                            type="button"
                                            onClick={handleGetRecommendations}
                                            disabled={isLoading}
                                            className={`w-full text-white shadow-lg ${theme.button}`}
                                        >
                                            {isLoading ? (
                                                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Thinking...</>
                                            ) : (
                                                <><Sparkles className="w-5 h-5 mr-2" /> Recommendations</>
                                            )}
                                        </Button>
                                    </div>

                                    {/* RESULTS */}
                                    {recommendations.length > 0 && (
                                        <div ref={resultsRef} className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Picks for You</h3>
                                                <button
                                                    onClick={() => setIsPrivate(!isPrivate)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isPrivate ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500'}`}
                                                    aria-label={isPrivate ? "Switch to Public Mode" : "Switch to Private Mode"}
                                                >
                                                    <Lock className="w-3.5 h-3.5" />
                                                    {isPrivate ? "Secret Mode On" : "Public Mode"}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                {recommendations.map((rec, index) => {
                                                    const isHoliday = config.id === 'holiday_concierge';
                                                    const isExpanded = expandedRecIndex === index;

                                                    return (
                                                        <ConciergeResultCard
                                                            key={index}
                                                            rec={rec}
                                                            categoryType={config.categoryType}
                                                            mainIcon={config.resultCard.mainIcon}
                                                            subtext={config.resultCard.subtextKey ? rec[config.resultCard.subtextKey] : undefined}
                                                            secondIcon={config.resultCard.secondIcon}
                                                            secondSubtext={config.resultCard.secondSubtextKey ? rec[config.resultCard.secondSubtextKey] : undefined}
                                                            isPrivate={isPrivate}
                                                            onFavorite={handleFavorite}
                                                            onAddToJar={handleAddToJar}
                                                            onGoAction={() => onGoAction(rec)}
                                                            goActionLabel={config.resultCard.goActionLabel || ACTION_LABELS.DO_THIS}
                                                            ratingClass={config.resultCard.ratingClass || "text-yellow-400"}
                                                            isAddingToJar={addingItemName === rec.name}

                                                            // Inline Expansion for Holidays
                                                            expandable={isHoliday}
                                                            isExpanded={isExpanded}
                                                            onToggleExpand={() => setExpandedRecIndex(isExpanded ? null : index)}
                                                            renderExpandedContent={isHoliday ? (
                                                                <ItineraryMarkdownRenderer
                                                                    markdown={rec.details}
                                                                    configId={config.id}
                                                                    theme={getThemeClasses(config.colorTheme)}
                                                                />
                                                            ) : undefined}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {showTrialUsedPrompt && demoConcierge && demoConcierge.triesRemaining === 0 && (
                                        <div className="mt-6">
                                            <DemoUpgradePrompt
                                                reason="premium"
                                                message={`Loved the ${config.title}? Sign up for unlimited access to ALL 11 premium concierge tools!`}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </motion.div >
                </div >
            )
            }


            <RichDetailsModal
                isOpen={!!viewingItem}
                onClose={() => setViewingItem(null)}
                data={viewingItem}
                configId={config.id}
                onAddToJar={() => {
                    if (viewingItem) handleAddToJar(viewingItem, config.categoryType, isPrivate);
                    setViewingItem(null);
                }}
                onGoAction={() => {
                    if (viewingItem) handleGoTonightFromHook(viewingItem, config.categoryType, isPrivate);
                    setViewingItem(null);
                }}
            />
        </AnimatePresence >
    );
}
