"use client";

import { useState, useEffect } from "react";
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

    const currentStep = steps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;

    // Reset to first step whenever the tour is opened
    useEffect(() => {
        if (isOpen) {
            setCurrentStepIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !currentStep.targetElement) {
            setHighlightedElement(null);
            return;
        }

        // Try to find the element - handle multiple selectors for responsive elements
        let element: HTMLElement | null = null;

        // Split by comma to support multiple selectors
        const selectors = currentStep.targetElement.split(',').map(s => s.trim());

        for (const selector of selectors) {
            const el = document.querySelector(selector) as HTMLElement;
            // Check if element exists and is visible
            if (el && el.offsetParent !== null) {
                element = el;
                break;
            }
        }

        if (element) {
            setHighlightedElement(element);
            // Scroll element into view smoothly
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // If no element found, clear highlight but keep tooltip centered
            setHighlightedElement(null);
        }
    }, [currentStepIndex, isOpen, currentStep]);

    const handleNext = () => {
        if (isLastStep) {
            handleComplete();
        } else {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (!isFirstStep) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        onComplete();
        onClose();
        setCurrentStepIndex(0);
    };

    const handleSkip = () => {
        onClose();
        setCurrentStepIndex(0);
    };

    const getTooltipPosition = () => {
        if (!highlightedElement || currentStep.position === 'center') {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            };
        }

        const rect = highlightedElement.getBoundingClientRect();
        const tooltipOffset = 20;
        const tooltipWidth = 400; // Approximate max-width
        const tooltipHeight = 300; // Approximate height
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const padding = 20; // Padding from viewport edges

        let position: { top?: string; left?: string; bottom?: string; right?: string; transform: string } = {
            transform: 'translate(0, 0)'
        };

        switch (currentStep.position) {
            case 'top':
                // Check if there's room above
                if (rect.top - tooltipHeight - tooltipOffset >= padding) {
                    position.top = `${rect.top - tooltipOffset}px`;
                    position.left = `${rect.left + rect.width / 2}px`;
                    position.transform = 'translate(-50%, -100%)';
                } else {
                    // Fallback to bottom
                    position.top = `${rect.bottom + tooltipOffset}px`;
                    position.left = `${rect.left + rect.width / 2}px`;
                    position.transform = 'translate(-50%, 0)';
                }
                break;
            case 'bottom':
                // Check if there's room below
                if (rect.bottom + tooltipHeight + tooltipOffset <= viewportHeight - padding) {
                    position.top = `${rect.bottom + tooltipOffset}px`;
                    position.left = `${rect.left + rect.width / 2}px`;
                    position.transform = 'translate(-50%, 0)';
                } else {
                    // Fallback to top
                    position.top = `${rect.top - tooltipOffset}px`;
                    position.left = `${rect.left + rect.width / 2}px`;
                    position.transform = 'translate(-50%, -100%)';
                }
                break;
            case 'left':
                // Check if there's room on the left
                if (rect.left - tooltipWidth - tooltipOffset >= padding) {
                    position.top = `${rect.top + rect.height / 2}px`;
                    position.left = `${rect.left - tooltipOffset}px`;
                    position.transform = 'translate(-100%, -50%)';
                } else {
                    // Fallback to right
                    position.top = `${rect.top + rect.height / 2}px`;
                    position.left = `${rect.right + tooltipOffset}px`;
                    position.transform = 'translate(0, -50%)';
                }
                break;
            case 'right':
                // Check if there's room on the right
                if (rect.right + tooltipWidth + tooltipOffset <= viewportWidth - padding) {
                    position.top = `${rect.top + rect.height / 2}px`;
                    position.left = `${rect.right + tooltipOffset}px`;
                    position.transform = 'translate(0, -50%)';
                } else {
                    // Fallback to left
                    position.top = `${rect.top + rect.height / 2}px`;
                    position.left = `${rect.left - tooltipOffset}px`;
                    position.transform = 'translate(-100%, -50%)';
                }
                break;
            default:
                position.top = '50%';
                position.left = '50%';
                position.transform = 'translate(-50%, -50%)';
        }

        // Ensure horizontal position stays within viewport
        if (position.left) {
            const leftValue = parseInt(position.left);
            const adjustedLeft = Math.max(padding + tooltipWidth / 2, Math.min(viewportWidth - padding - tooltipWidth / 2, leftValue));
            position.left = `${adjustedLeft}px`;
        }

        // Ensure vertical position stays within viewport
        if (position.top) {
            const topValue = parseInt(position.top);
            const adjustedTop = Math.max(padding, Math.min(viewportHeight - padding - tooltipHeight, topValue));
            position.top = `${adjustedTop}px`;
        }

        return position;
    };

    const getSpotlightStyle = () => {
        if (!highlightedElement) return {};

        const rect = highlightedElement.getBoundingClientRect();
        const padding = 8;

        return {
            top: `${rect.top - padding}px`,
            left: `${rect.left - padding}px`,
            width: `${rect.width + padding * 2}px`,
            height: `${rect.height + padding * 2}px`,
            borderRadius: '1rem'
        };
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] pointer-events-none">
                {/* Backdrop Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm pointer-events-auto"
                    onClick={handleSkip}
                />

                {/* Spotlight on highlighted element */}
                {highlightedElement && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute pointer-events-none"
                        style={{
                            ...getSpotlightStyle(),
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)',
                            border: '3px solid rgba(236, 72, 153, 0.5)',
                            zIndex: 201
                        }}
                    />
                )}

                {/* Tooltip */}
                <motion.div
                    key={currentStepIndex}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute pointer-events-auto max-w-md"
                    style={getTooltipPosition()}
                >
                    <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-pink-500/30 rounded-3xl shadow-2xl shadow-pink-500/20 overflow-hidden">
                        {/* Decorative accents */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />

                        <div className="relative z-10 p-6">
                            {/* Close button */}
                            <button
                                onClick={handleSkip}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>

                            {/* Progress indicator */}
                            <div className="flex items-center gap-1 mb-4">
                                {steps.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-1 rounded-full transition-all ${index === currentStepIndex
                                            ? 'w-8 bg-pink-500'
                                            : index < currentStepIndex
                                                ? 'w-4 bg-pink-500/50'
                                                : 'w-4 bg-slate-700'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Content */}
                            <h3 className="text-2xl font-black text-white mb-3 pr-8">
                                {currentStep.title}
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                {currentStep.description}
                            </p>

                            {/* Navigation */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex gap-2">
                                    {!isFirstStep && (
                                        <Button
                                            onClick={handlePrevious}
                                            variant="outline"
                                            className="border-slate-700 hover:bg-slate-800"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    {!isLastStep && (
                                        <Button
                                            onClick={handleSkip}
                                            variant="outline"
                                            className="border-slate-700 hover:bg-slate-800 text-slate-400"
                                        >
                                            Skip Tour
                                        </Button>
                                    )}
                                    <Button
                                        onClick={handleNext}
                                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 border-none shadow-lg shadow-pink-500/20"
                                    >
                                        {isLastStep ? (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Get Started
                                            </>
                                        ) : (
                                            <>
                                                Next
                                                <ChevronRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
