"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useModalSystem } from "@/components/ModalProvider";
import { trackPathSelected, trackModalOpened } from "@/lib/analytics";

interface UnifiedConciergeButtonProps {
    isPremium: boolean;
}

export function UnifiedConciergeButton({ isPremium }: UnifiedConciergeButtonProps) {
    const { openModal } = useModalSystem();

    const handleClick = () => {
        if (!isPremium) {
            openModal('PREMIUM');
            return;
        }
        
        // Track path 2 selection
        trackPathSelected('2_need_inspiration', { trigger: 'unified_concierge_button' });
        trackModalOpened('concierge', { triggered_by: 'unified_concierge_button' });
        
        // Open with no toolId to show skill picker
        openModal('CONCIERGE', {});
    };

    return (
        <div className="space-y-4">
            {/* Main CTA */}
            <motion.button
                onClick={handleClick}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                className="group relative w-full overflow-hidden"
            >
                {/* Gradient Background */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-3xl opacity-75 group-hover:opacity-100 transition duration-500 blur" />
                
                {/* Content */}
                <div className="relative bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            
                            {/* Text */}
                            <div className="text-left">
                                <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                                    Ask AI Concierge
                                    {!isPremium && (
                                        <span className="px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-black uppercase rounded-full">
                                            Pro
                                        </span>
                                    )}
                                </h3>
                                <p className="text-purple-100 text-sm leading-relaxed">
                                    Get personalized suggestions for anything
                                </p>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="hidden sm:block">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>

                    {/* Example Prompts */}
                    <div className="mt-6 flex flex-wrap gap-2">
                        <span className="text-xs text-purple-200 font-medium">💡 Try:</span>
                        {[
                            '"Find dinner near me"',
                            '"Plan my weekend"',
                            '"Book recommendations"',
                            '"Best bars downtown"'
                        ].map((prompt, idx) => (
                            <span 
                                key={idx}
                                className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-xs text-white font-medium border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isPremium) {
                                        trackPathSelected('2_need_inspiration', { 
                                            trigger: 'example_prompt',
                                            previous_path: 'unified_concierge_button'
                                        });
                                        trackModalOpened('concierge', { triggered_by: 'example_prompt' });
                                        
                                        // Open with initialPrompt for intent detection, no toolId to allow auto-detection
                                        openModal('CONCIERGE', { 
                                            initialPrompt: prompt.replace(/"/g, '')
                                        });
                                    }
                                }}
                            >
                                {prompt}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.button>

            {/* Info Text */}
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                Powered by AI • Understands natural language • 18+ specialized skills
            </p>
        </div>
    );
}
