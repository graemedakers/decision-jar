"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Wand2, Sparkles, Image as ImageIcon, BookOpen, Plus, Loader2, Link as LinkIcon } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useModalSystem } from "@/components/ModalProvider";
import imageCompression from 'browser-image-compression';
import { showError, showSuccess } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";

interface SmartPromptInputProps {
    jarTopic: string;
    onGenerate: (prompt: string) => void;
    isGenerating?: boolean;
    className?: string;
    aiUsage?: {
        remaining: number | null;
        dailyLimit: number | null;
        isPro: boolean;
    };
}

const SUGGESTION_MAP: Record<string, string[]> = {
    // Core Categories
    "Food": ["5 quick weeknight dinners", "8 impressive date night recipes", "6 healthy lunch ideas", "10 local hidden gem restaurants"],
    "Restaurants": ["5 top-rated Italian spots nearby", "8 brunch places with outdoor seating", "10 cheap eats under $15", "6 romantic dinner venues"],
    "Bars": ["5 rooftop bars with a view", "8 cozy speakeasies", "6 spots for craft cocktails", "10 sports bars for game day"],
    "Nightclubs": ["5 clubs with live DJs", "8 places for salsa dancing", "6 late-night spots open now", "10 trending nightlife venues"],

    // Entertainment
    "Movies": ["10 classic sci-fi movies", "5 feel-good comedies from the 90s", "8 critically acclaimed documentaries", "6 horror movies for Halloween"],
    "Books": ["5 must-read modern classics", "8 thrillers with plot twists", "6 non-fiction books for self-growth", "10 fantasy series to get lost in"],

    // Lifestyle
    "Activities": ["5 outdoor weekend activities", "10 free things to do in the city", "6 rainy day project ideas", "8 group activities for friends"],
    "Wellness": ["5 morning mindfulness routines", "8 yoga flows for beginners", "6 spa treatments to try at home", "10 journal prompts for gratitude"],
    "Fitness": ["5 high-intensity home workouts", "8 scenic running routes", "6 stretches for flexibility", "10 healthy post-workout snacks"],

    // Travel
    "Travel": ["5 weekend getaways within 3 hours", "10 hidden gems in [City]", "6 budget-friendly vacation spots", "8 road trip essentials"],
    "Hotel Stays": ["5 boutique hotels with character", "8 resorts with great pools", "6 cozy cabins for winter", "10 unique stays (yurts, treehouses)"],

    // Niche
    "Cooking & Recipes": ["5 one-pot pasta recipes", "8 vegan desserts", "6 meal prep ideas for the week", "10 authentic Thai dishes to make"],
    "System Development": ["5 project ideas for a portfolio", "8 clean code principles", "6 VS Code extensions to try", "10 tech stack combinations"],

    // Fallback
    "General": ["5 ways to be more productive", "10 self-care ideas", "6 books to read this year", "8 random acts of kindness"]
};

export function SmartPromptInput({ jarTopic, onGenerate, isGenerating, className, aiUsage }: SmartPromptInputProps) {
    const [prompt, setPrompt] = useState("");
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const { openModal } = useModalSystem();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const suggestions = SUGGESTION_MAP[jarTopic] || SUGGESTION_MAP["General"];
    const currentPlaceholder = `Ex: "${suggestions[placeholderIndex]}..."`;

    // Rotate placeholders
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % suggestions.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [suggestions.length]);

    const { isListening, isSupported, startListening, stopListening } = useVoiceInput({
        onTranscript: (text) => setPrompt(text),
        onError: (e) => console.error("Voice input error:", e)
    });

    const handleVoiceToggle = () => {
        if (isListening) {
            stopListening();
        } else {
            setPrompt("");
            startListening();
        }
    };

    const isUrl = (text: string) => {
        try {
            new URL(text);
            return true;
        } catch {
            return false;
        }
    };

    /**
     * Detect if input is a request/question vs an actual idea
     */
    const isRequest = (text: string): boolean => {
        const lowerText = text.toLowerCase().trim();
        const questionStarters = [
            'find', 'where', 'what', 'how', 'show', 'suggest', 'recommend',
            'need', 'want', 'looking for', 'help me', 'can you', 'could you',
            'any ideas', 'give me', 'tell me', 'show me', 'i need', 'i want',
            'create', 'generate', 'idea'
        ];

        // Also check if it's purely a number + keywords (e.g. "10 ideas")
        const numberStart = /^\d+\s/.test(lowerText);

        const startsWithQuestion = questionStarters.some(starter => lowerText.startsWith(starter));
        const isQuestion = text.trim().endsWith('?');

        return startsWithQuestion || isQuestion || numberStart || lowerText.includes('ideas');
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type.toLowerCase())) {
            showError("Please upload a valid image file.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setIsUploadingImage(true);

        try {
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: file.type as any,
            };

            const compressedFile = await imageCompression(file, options);
            const reader = new FileReader();

            reader.onloadend = () => {
                const result = reader.result as string;
                openModal('ADD_IDEA', {
                    initialData: {
                        description: "",
                        photoUrls: [result]
                    }
                });
                if (fileInputRef.current) fileInputRef.current.value = "";
                setIsUploadingImage(false);
            };

            reader.onerror = () => {
                showError("Failed to read image.");
                setIsUploadingImage(false);
            };

            reader.readAsDataURL(compressedFile);

        } catch (error) {
            console.error('Image compression error:', error);
            showError("Failed to process image.");
            setIsUploadingImage(false);
        }
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!prompt.trim()) return;

        if (isRequest(prompt)) {
            // Smart Generate
            onGenerate(prompt);
        } else if (isUrl(prompt)) {
            // Add Link
            openModal('ADD_IDEA', {
                initialData: {
                    description: "Shared Link",
                    details: prompt
                }
            });
            setPrompt("");
        } else {
            // Manual Add
            openModal('ADD_IDEA', {
                initialData: {
                    description: prompt
                }
            });
            setPrompt("");
        }
    };

    // Determine button label/icon
    const showGenerate = isRequest(prompt) || prompt === ""; // Default to generate if empty?
    const showLink = isUrl(prompt);

    // Main button is different based on context
    const ButtonIcon = isGenerating ? Loader2 : (showLink ? LinkIcon : (showGenerate ? Wand2 : Plus));
    const ButtonText = isGenerating ? "Generating..." : (showLink ? "Add Link" : (showGenerate ? "Generate" : "Add Idea"));
    const ButtonColor = showGenerate ? "from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900"; // Manual add is simpler

    return (
        <div className={cn("space-y-3", className)}>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
            />

            <form onSubmit={handleSubmit} className="relative flex items-center bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-1.5 border border-slate-200 dark:border-white/10 transition-all focus-within:ring-2 focus-within:ring-purple-500/20">

                {/* Left Actions Toolbar */}
                <div className="flex items-center gap-0.5 px-1 shrink-0 border-r border-slate-100 dark:border-slate-800 mr-2">
                    {/* Image Upload */}
                    <button
                        type="button"
                        onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="p-2 rounded-xl text-slate-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                        title="Upload Image"
                    >
                        {isUploadingImage ? (
                            <Loader2 className="w-5 h-5 animate-spin text-pink-600" />
                        ) : (
                            <ImageIcon className="w-5 h-5" />
                        )}
                    </button>

                    {/* Voice Input */}
                    {isSupported && (
                        <button
                            type="button"
                            onClick={handleVoiceToggle}
                            className={cn(
                                "p-2 rounded-xl transition-all",
                                isListening
                                    ? "text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse"
                                    : "text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            )}
                            title={isListening ? "Stop listening" : "Voice input"}
                        >
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                    )}

                    {/* Templates */}
                    <button
                        type="button"
                        onClick={() => openModal('TEMPLATE_BROWSER')}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors hidden sm:block"
                        title="Browse Templates"
                    >
                        <BookOpen className="w-5 h-5" />
                    </button>

                    {/* Concierge/AI Shortcut - now redundant but nice to have? Maybe opens concierge modal directly */}
                    <button
                        type="button"
                        onClick={() => openModal('CONCIERGE', { initialPrompt: prompt })}
                        className="p-2 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                        title="Ask A.I. Concierge"
                    >
                        <Sparkles className="w-5 h-5" />
                    </button>

                </div>

                {/* Main Input */}
                <input
                    type="text"
                    placeholder={isListening ? "Listening..." : currentPlaceholder}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg text-slate-800 dark:text-white placeholder:text-slate-400 min-w-0"
                    disabled={isGenerating}
                />

                {/* Right Action Button */}
                <div className="pl-2">
                    <AnimatePresence mode="wait">
                        {(prompt.trim() || isGenerating) ? (
                            <motion.button
                                key="submit-btn"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                type="submit"
                                disabled={isGenerating}
                                className={cn(
                                    "h-10 px-4 rounded-xl font-semibold text-sm shadow-md transition-all flex items-center gap-2 text-white",
                                    showGenerate ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                                )}
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ButtonIcon className="w-4 h-4" />
                                )}
                                <span className="hidden sm:inline">{ButtonText}</span>
                            </motion.button>
                        ) : (
                            // Placeholder "Press Enter" indicator or nothing
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="pr-3 hidden sm:block text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase select-none"
                            >
                                Press Enter
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </form>

            {/* Footer Info: Suggestions + Usage Limit */}
            <div className="flex items-start justify-between gap-4 animate-in fade-in slide-in-from-top-1 duration-500">
                {/* Suggestions */}
                <div className="flex flex-wrap gap-2 flex-1">
                    {suggestions.slice(0, 3).map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => setPrompt(suggestion)}
                            className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-300 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-colors truncate max-w-[200px]"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>

                {/* AI Usage Counter */}
                <div className="shrink-0 flex flex-col items-end pt-1">
                    {!aiUsage?.isPro && aiUsage?.dailyLimit !== null && (
                        <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>
                                {aiUsage?.remaining === 0 ? (
                                    <span className="text-red-500 dark:text-red-400">Limit reached</span>
                                ) : (
                                    <span>
                                        <span className={cn(
                                            aiUsage?.remaining === 1 ? "text-amber-500 dark:text-amber-400" : "text-slate-600 dark:text-slate-300"
                                        )}>
                                            {aiUsage?.remaining ?? 0}
                                        </span>
                                        <span className="opacity-70"> / {aiUsage?.dailyLimit ?? 0} left today</span>
                                    </span>
                                )}
                            </span>
                        </div>
                    )}
                    {aiUsage?.isPro && (
                        <div className="text-[10px] font-medium text-purple-600/60 dark:text-purple-400/60 flex items-center gap-1.5" title="Premium Active">
                            <Sparkles className="w-3 h-3" />
                            <span>Unlimited</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
