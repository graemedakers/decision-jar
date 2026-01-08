"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OnboardingStep } from "@/lib/onboarding-steps";

interface OnboardingTourProps {
    steps: OnboardingStep[];
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export function OnboardingTour({ steps, isOpen, onClose, onComplete }: OnboardingTourProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
    const [tooltipSize, setTooltipSize] = useState({ width: 0, height: 400 });
    const tooltipRef = useRef<HTMLDivElement>(null);

    const currentStep = steps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;

    // Reset tour on open
    useEffect(() => {
        if (isOpen) setCurrentStepIndex(0);
    }, [isOpen]);

    // Monitor tooltip size changes dynamically
    useEffect(() => {
        if (!isOpen || !tooltipRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setTooltipSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });

        observer.observe(tooltipRef.current);
        return () => observer.disconnect();
    }, [isOpen, currentStepIndex]);

    // Element selection and scroll
    useEffect(() => {
        if (!isOpen || !currentStep.targetElement) {
            setHighlightedElement(null);
            return;
        }

        const selectors = currentStep.targetElement.split(',').map((s: string) => s.trim());
        let element: HTMLElement | null = null;

        for (const selector of selectors) {
            const el = document.querySelector(selector) as HTMLElement;
            if (el && el.offsetParent !== null) {
                element = el;
                break;
            }
        }

        if (element) {
            setHighlightedElement(element);
            // Smaller timeout to ensure layout is settled
            setTimeout(() => {
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } else {
            setHighlightedElement(null);
        }
    }, [currentStepIndex, isOpen, currentStep]);

    // Track scroll/resize to keep highlight in sync
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
    useEffect(() => {
        if (!highlightedElement) {
            setHighlightRect(null);
            return;
        }

        const updateRect = () => {
            setHighlightRect(highlightedElement.getBoundingClientRect());
        };

        updateRect();
        window.addEventListener('scroll', updateRect, true);
        window.addEventListener('resize', updateRect);

        return () => {
            window.removeEventListener('scroll', updateRect, true);
            window.removeEventListener('resize', updateRect);
        };
    }, [highlightedElement, currentStepIndex]);

    const handleNext = () => isLastStep ? handleComplete() : setCurrentStepIndex(prev => prev + 1);
    const handlePrevious = () => !isFirstStep && setCurrentStepIndex(prev => prev - 1);
    const handleComplete = () => { onComplete(); onClose(); setCurrentStepIndex(0); };
    const handleSkip = () => { onClose(); setCurrentStepIndex(0); };

    const getTooltipPosition = () => {
        if (!isOpen) return {};

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const pad = 24;
        const spacing = 12;
        const isMobile = vw < 768;

        // Determine dimensions - use measured size or conservative defaults
        const boxW = tooltipSize.width > 0 ? tooltipSize.width : (isMobile ? (vw - pad * 2) : 400);
        const boxH = tooltipSize.height > 0 ? tooltipSize.height : 300;

        // Center position for Welcome/Complete
        if (!highlightedElement || currentStep.position === 'center') {
            return {
                width: `${boxW}px`,
                top: `${vh / 2 - boxH / 2}px`,
                left: `${vw / 2 - boxW / 2}px`,
                zIndex: 400
            };
        }

        const rect = highlightedElement.getBoundingClientRect();

        // 1. Calculate Horizontal (Simple Pixel Center + Clamping)
        let left = rect.left + rect.width / 2 - boxW / 2;
        left = Math.max(pad, Math.min(vw - boxW - pad, left));

        // 2. Calculate Vertical
        let top: number;
        const elementMidY = rect.top + rect.height / 2;
        const screenMidY = vh / 2;
        const preferSide = currentStep.position || (elementMidY > screenMidY ? 'top' : 'bottom');

        if (preferSide === 'top') {
            top = rect.top - boxH - spacing;
            // Flip to bottom if it literally can't fit at the top
            if (top < pad) {
                top = rect.bottom + spacing;
            }
        } else {
            top = rect.bottom + spacing;
            // Flip to top if it doesn't fit at the bottom
            if (top + boxH > vh - pad) {
                top = rect.top - boxH - spacing;
            }
        }

        // Final screen bounding check
        top = Math.max(pad, Math.min(vh - boxH - pad, top));

        return {
            width: `${boxW}px`,
            top: `${top}px`,
            left: `${left}px`,
            zIndex: 400
        };
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[350] pointer-events-none">
                <div className="absolute inset-0 bg-slate-950/50 pointer-events-auto" onClick={handleSkip} />

                {highlightRect && (
                    <motion.div
                        className="absolute pointer-events-none"
                        animate={{
                            top: highlightRect.top - 4,
                            left: highlightRect.left - 4,
                            width: highlightRect.width + 8,
                            height: highlightRect.height + 8,
                        }}
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 40px rgba(236, 72, 153, 0.4)',
                            border: '2px solid rgba(236, 72, 153, 0.5)',
                            zIndex: 351
                        }}
                    />
                )}

                <motion.div
                    ref={tooltipRef}
                    key={currentStepIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed pointer-events-auto"
                    style={getTooltipPosition()}
                >
                    <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 relative max-h-[85vh] overflow-y-auto scrollbar-hide">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -z-10" />

                        <div className="relative z-10">
                            <button onClick={handleSkip} className="absolute -top-1 -right-1 p-2 rounded-full hover:bg-white/10 transition-colors">
                                <X className="w-4 h-4 text-slate-500" />
                            </button>

                            <div className="flex gap-1 mb-4">
                                {steps.map((_, i) => (
                                    <div key={i} className={`h-1 rounded-full transition-all ${i === currentStepIndex ? 'w-8 bg-pink-500' : i < currentStepIndex ? 'w-4 bg-pink-500/40' : 'w-4 bg-slate-800'}`} />
                                ))}
                            </div>

                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 pr-6 leading-tight">{currentStep.title}</h3>
                            <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed">{currentStep.description}</p>

                            <div className="flex justify-between items-center pt-2">
                                <div className="flex gap-2">
                                    {!isFirstStep && (
                                        <Button onClick={handlePrevious} variant="ghost" className="text-slate-400 hover:text-white h-9 px-3">
                                            <ChevronLeft className="w-4 h-4 mr-1" /> Back
                                        </Button>
                                    )}
                                </div>
                                <Button onClick={handleNext} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 h-10 px-6 font-bold text-white shadow-lg">
                                    {isLastStep ? <><Sparkles className="w-4 h-4 mr-2" /> Finish</> : <>Next <ChevronRight className="w-4 h-4 ml-2" /></>}
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
