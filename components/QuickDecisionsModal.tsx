"use client";

import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, RefreshCcw } from "lucide-react";
import { useState } from "react";

interface QuickDecisionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tool = "COIN" | "DICE";

export function QuickDecisionsModal({ isOpen, onClose }: QuickDecisionsModalProps) {
    const [activeTool, setActiveTool] = useState<Tool>("COIN");
    const [result, setResult] = useState<string | number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [rotation, setRotation] = useState(0);

    const flipCoin = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setResult(null);

        // Randomize outcome
        const outcome = Math.random() > 0.5 ? "HEADS" : "TAILS";
        const totalRotation = 1800 + (outcome === "HEADS" ? 0 : 180); // 5 full spins + outcome

        setRotation(prev => prev + totalRotation);

        setTimeout(() => {
            setResult(outcome);
            setIsAnimating(false);
        }, 1500); // Animation duration
    };

    const rollDice = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setResult(null);

        // Simple shake animation trigger
        setTimeout(() => {
            const outcome = Math.floor(Math.random() * 6) + 1;
            setResult(outcome);
            setIsAnimating(false);
        }, 1000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 overflow-hidden relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex border-b border-slate-200 dark:border-white/10">
                            <button
                                onClick={() => { setActiveTool("COIN"); setResult(null); }}
                                className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTool === "COIN" ? "text-primary border-b-2 border-primary" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"}`}
                            >
                                Coin Flip
                            </button>
                            <button
                                onClick={() => { setActiveTool("DICE"); setResult(null); }}
                                className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTool === "DICE" ? "text-primary border-b-2 border-primary" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"}`}
                            >
                                Dice Roll
                            </button>
                        </div>

                        <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                            {activeTool === "COIN" && (
                                <div className="perspective-1000 w-full flex flex-col items-center gap-8">
                                    <motion.div
                                        animate={{ rotateY: isAnimating ? rotation : 0 }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        style={{ transformStyle: "preserve-3d" }}
                                        className="w-32 h-32 relative"
                                    >
                                        {/* Front (Heads) */}
                                        <div className="absolute inset-0 w-full h-full rounded-full bg-yellow-400 border-4 border-yellow-500 shadow-xl flex items-center justify-center backface-hidden">
                                            <span className="text-4xl font-bold text-yellow-700">Heads</span>
                                        </div>
                                        {/* Back (Tails) */}
                                        <div
                                            className="absolute inset-0 w-full h-full rounded-full bg-slate-300 border-4 border-slate-400 shadow-xl flex items-center justify-center backface-hidden"
                                            style={{ transform: "rotateY(180deg)" }}
                                        >
                                            <span className="text-4xl font-bold text-slate-600">Tails</span>
                                        </div>
                                    </motion.div>

                                    {!isAnimating && result && activeTool === "COIN" && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-slate-800 dark:text-white">
                                            {result}
                                        </motion.div>
                                    )}

                                    <Button onClick={flipCoin} disabled={isAnimating} className="w-full">
                                        {isAnimating ? "Flipping..." : "Flip Coin"}
                                    </Button>
                                </div>
                            )}

                            {activeTool === "DICE" && (
                                <div className="w-full flex flex-col items-center gap-8">
                                    <motion.div
                                        animate={isAnimating ? {
                                            rotate: [0, 10, -10, 10, -10, 0],
                                            x: [0, 5, -5, 5, -5, 0],
                                            transition: { duration: 0.5, repeat: 1 }
                                        } : {}}
                                        className="w-32 h-32 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-2 border-slate-200 dark:border-white/10 flex items-center justify-center relative"
                                    >
                                        {result === null ? (
                                            <span className="text-6xl font-bold text-slate-200">?</span>
                                        ) : (
                                            <motion.span
                                                key={result as number}
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="text-6xl font-bold text-primary"
                                            >
                                                {result}
                                            </motion.span>
                                        )}
                                    </motion.div>

                                    {!isAnimating && result && activeTool === "DICE" && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-slate-800 dark:text-white">
                                            Rolled a {result}
                                        </motion.div>
                                    )}

                                    <Button onClick={rollDice} disabled={isAnimating} className="w-full">
                                        {isAnimating ? "Rolling..." : "Roll Dice"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
