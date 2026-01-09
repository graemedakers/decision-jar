
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Dices, Check, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ONBOARDING_TEMPLATES, JarTemplate } from "@/lib/templates";
import { Confetti } from "@/components/Confetti";
import { useRouter } from "next/navigation";
import { showSuccess, showError } from "@/lib/toast";
import { JoinJarModal } from "@/components/JoinJarModal";

interface OnboardingWizardProps {
    onComplete: () => void;
    userName?: string;
}

export function OnboardingWizard({ onComplete, userName }: OnboardingWizardProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedTemplate, setSelectedTemplate] = useState<JarTemplate | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);
    const router = useRouter();

    const handleTemplateSelect = (template: JarTemplate) => {
        setSelectedTemplate(template);
        setStep(2);
    };

    const handleCreateJar = async () => {
        if (!selectedTemplate) return;

        setIsCreating(true);

        try {
            // 1. Create the Jar
            const createRes = await fetch('/api/jars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${selectedTemplate.label} Jar`,
                    type: selectedTemplate.type,
                    topic: selectedTemplate.label,
                    selectionMode: 'RANDOM'
                })
            });

            if (!createRes.ok) {
                const errorText = await createRes.text();
                console.error("Create Jar Failed:", createRes.status, errorText);
                throw new Error("Failed to create jar: " + errorText);
            }
            const newJar = await createRes.json();

            // 2. Add Starter Ideas (Parallel)
            const ideaPromises = selectedTemplate.starterIdeas.map(idea =>
                fetch('/api/ideas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        description: idea.description,
                        cost: idea.cost,
                        duration: idea.duration.toString(),
                        activityLevel: 'MEDIUM',
                        indoor: idea.tags.includes('Indoor'),
                        category: selectedTemplate.type === 'ROMANTIC' ? 'ACTIVITY' : 'GENERIC',
                        jarId: newJar.id // Explicitly attach to new jar (though backend might auto-detect active, safe to be explicit if API supports it, or rely on active switch)
                    })
                })
            );

            // Wait for creation
            await Promise.all(ideaPromises);

            // 3. Switch to it (Backend usually auto-switches on creation, but ensure it)
            // The createRes logic in backend might already set it active. 

            setStep(3); // Success!
            showSuccess("Jar created successfully!");

        } catch (error) {
            console.error(error);
            showError("Failed to set up your jar. Please try again.");
            setIsCreating(false);
        }
    };

    // Step 1: Choose Goal
    const renderStep1 = () => (
        <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <JoinJarModal
                isOpen={isJoinOpen}
                onClose={() => setIsJoinOpen(false)}
            />

            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                    Welcome{userName ? `, ${userName}` : ''}! 👋
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                    Let's get you started. What kind of decisions do you want to make?
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {ONBOARDING_TEMPLATES.map((template) => (
                    <motion.button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 relative group overflow-hidden
                            ${selectedTemplate?.id === template.id
                                ? 'border-primary ring-4 ring-primary/20 bg-primary/5 dark:bg-primary/10'
                                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-primary/50 dark:hover:border-primary/50 shadow-sm hover:shadow-xl'
                            }
                        `}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 bg-gradient-to-br transition-colors
                             ${template.theme === 'pink' ? 'from-pink-100 to-rose-100 text-pink-600 dark:from-pink-500/20 dark:to-rose-500/20 dark:text-pink-300' :
                                template.theme === 'amber' ? 'from-amber-100 to-orange-100 text-amber-600 dark:from-amber-500/20 dark:to-orange-500/20 dark:text-amber-300' :
                                    template.theme === 'purple' ? 'from-purple-100 to-indigo-100 text-purple-600 dark:from-purple-500/20 dark:to-indigo-500/20 dark:text-purple-300' :
                                        template.theme === 'green' ? 'from-green-100 to-emerald-100 text-green-600 dark:from-green-500/20 dark:to-emerald-500/20 dark:text-green-300' :
                                            'from-blue-100 to-cyan-100 text-blue-600 dark:from-blue-500/20 dark:to-cyan-500/20 dark:text-blue-300'
                            }
                        `}>
                            {template.icon}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                            {template.label}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug">
                            {template.description}
                        </p>
                    </motion.button>
                ))}
            </div>

            <div className="flex flex-col items-center gap-4 mt-8">
                <button
                    onClick={() => setIsJoinOpen(true)}
                    className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                    Have an invite code? Join a Jar
                </button>

                <button
                    onClick={onComplete} // Skip wizard
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-4"
                >
                    I'll set it up myself manually
                </button>
            </div>
        </motion.div>
    );

    // Step 2: Preview
    const renderStep2 = () => {
        if (!selectedTemplate) return null;

        return (
            <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-xl mx-auto space-y-8"
            >
                <div className="text-center space-y-2">
                    <button
                        onClick={() => setStep(1)}
                        className="text-sm text-slate-400 hover:text-primary mb-2 flex items-center justify-center gap-1 mx-auto transition-colors"
                    >
                        ← Back to choices
                    </button>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                        Great choice! {selectedTemplate.icon}
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        We'll create a <strong>{selectedTemplate.label} Jar</strong> with these starter ideas:
                    </p>
                </div>

                <div className="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-2 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    {selectedTemplate.starterIdeas.map((idea, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-white/5 last:border-0">
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                                <Check className="w-4 h-4" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-semibold text-slate-900 dark:text-white">{idea.description}</p>
                                <div className="flex gap-2 mt-1">
                                    {idea.tags.map(tag => (
                                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 font-medium">
                                        {idea.cost}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl mt-2 text-center text-sm text-slate-500 flex items-center justify-center gap-2 border border-dashed border-slate-200 dark:border-white/10">
                        <PlusIcon className="w-4 h-4" />
                        <span>You can add unlimited ideas later</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button
                        size="lg"
                        onClick={handleCreateJar}
                        disabled={isCreating}
                        className="w-full text-lg h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Setting up your jar...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2 fill-white/20" />
                                Create My Jar
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>
        );
    };

    // Step 3: Success
    const renderStep3 = () => (
        <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center space-y-8 py-10"
        >
            <Confetti />

            <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30"
            >
                <CheckCircle2 className="w-16 h-16 text-white" />
            </motion.div>

            <div className="space-y-4">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white">
                    You're All Set! 🚀
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                    Your <strong>{selectedTemplate?.label} Jar</strong> is ready. <br />
                    Spin the wheel to make your first decision!
                </p>
            </div>

            <Button
                size="lg"
                onClick={onComplete}
                className="w-full h-14 text-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
                <Dices className="w-5 h-5 mr-3" />
                Go to Dashboard
            </Button>
        </motion.div>
    );

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <AnimatePresence mode="wait">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </AnimatePresence>
        </div>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}
