"use client";

import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Heart } from "lucide-react";
import { useState } from "react";
import { showError, showSuccess } from "@/lib/toast";

interface ReviewAppModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ReviewAppModal({ isOpen, onClose }: ReviewAppModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment }),
            });

            if (res.ok) {
                setSubmitted(true);
                showSuccess("💚 Thank you for your review!");
                setTimeout(() => {
                    onClose();
                    setSubmitted(false);
                    setComment("");
                    setRating(5);
                }, 2000);
            } else {
                showError("Failed to submit review. Please try again.");
            }
        } catch (error) {
            console.error(error);
            showError("Error submitting review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card w-full max-w-md relative overflow-hidden bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-8 text-center space-y-6">
                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="py-8"
                                >
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Heart className="w-8 h-8 text-green-400 fill-green-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Thank You!</h3>
                                    <p className="text-slate-600 dark:text-slate-300">Your love keeps us going.</p>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Heart className="w-8 h-8 text-primary fill-primary" />
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Rate Decision Jar</h2>
                                        <p className="text-slate-600 dark:text-slate-300">Enjoying the app? Leave a review to help others find us!</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="flex justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className="focus:outline-none transition-transform hover:scale-110"
                                                >
                                                    <Star
                                                        className={`w-10 h-10 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200 dark:text-slate-700"}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>

                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="What do you love about Decision Jar?"
                                            className="w-full h-32 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-primary/50 resize-none"
                                            required
                                        />

                                        <Button type="submit" className="w-full" isLoading={isSubmitting}>
                                            Submit Review
                                        </Button>
                                    </form>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
