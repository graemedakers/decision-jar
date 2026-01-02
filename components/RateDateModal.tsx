"use client";

import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Save, Camera, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { GooglePhotosPicker } from "./GooglePhotosPicker";
import { useRouter } from "next/navigation";

interface RateDateModalProps {
    isOpen: boolean;
    onClose: () => void;
    idea: any;
    isPro?: boolean;
}

export function RateDateModal({ isOpen, onClose, idea, isPro }: RateDateModalProps) {
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [notes, setNotes] = useState("");
    const [photoUrls, setPhotoUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (idea) {
            setRating(0);
            setNotes("");

            // Handle Photos
            if (idea.photoUrls && Array.isArray(idea.photoUrls)) {
                setPhotoUrls(idea.photoUrls);
            } else if (idea.photoUrl) {
                // Graceful fallback if migration kept old data
                setPhotoUrls([idea.photoUrl]);
            } else {
                setPhotoUrls([]);
            }

            fetch(`/api/ideas/${idea.id}/rate`)
                .then(res => res.json())
                .then((data: any[]) => {
                    console.log("Fetched ratings:", data);
                    const myRating = data.find(r => r.isMe);
                    if (myRating) {
                        setRating(myRating.value);
                        setNotes(myRating.comment || "");
                    }
                })
                .catch(err => console.error(err));
        }
    }, [idea]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (photoUrls.length >= 3) {
            alert("Maximum 3 photos allowed.");
            return;
        }

        if (file.size > 4 * 1024 * 1024) {
            alert("File is too large. Please choose an image under 4MB.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Updated to use Cloudinary endpoint
            const res = await fetch('/api/upload-cloudinary', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || `Upload failed with status ${res.status}`);
            }

            const data = await res.json();
            if (data.success) {
                setPhotoUrls(prev => [...prev, data.url]);
            } else {
                throw new Error(data.error || "Upload failed");
            }
        } catch (error) {
            console.error('Upload failed', error);
            let errorMessage = "Failed to upload photo";
            if (error instanceof Error) {
                errorMessage += `: ${error.message}`;
            }
            alert(errorMessage);
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    const handleRemovePhoto = (index: number) => {
        setPhotoUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`/api/ideas/${idea.id}/rate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, notes, photoUrls }),
                credentials: 'include',
            });

            if (res.ok) {
                onClose();
                router.refresh();
            } else {
                if (res.status === 401) {
                    alert("Session expired. Please log in again.");
                    router.push('/login');
                    return;
                }
                const data = await res.json();
                alert(`Failed to save rating: ${data.details || data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error saving rating");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card w-full max-w-md relative h-[calc(100vh-2rem)] md:h-auto md:max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Rate Experience</h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-6 font-medium text-lg">"{idea?.description}"</p>

                        <form onSubmit={handleSubmit} className="space-y-6 pb-20 md:pb-6" autoComplete="off">
                            <div className="space-y-2 text-center">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">How was it?</label>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-400 dark:text-slate-500"}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Private Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="What did you love? What would you do differently?"
                                    className="w-full h-32 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-primary/50 resize-none"
                                    autoComplete="off"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Capture the Moment ({photoUrls.length}/3)</label>

                                <div className="grid grid-cols-3 gap-3">
                                    {photoUrls.map((url, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group bg-black/40">
                                            <img src={url} alt={`Memory ${index + 1}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePhoto(index)}
                                                    className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="w-4 h-4 text-white" />
                                                </button>
                                                <label className="p-1.5 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors cursor-pointer" title="Replace">
                                                    <Camera className="w-4 h-4 text-white" />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                if (file.size > 4 * 1024 * 1024) {
                                                                    alert("File is too large. Please choose an image under 4MB.");
                                                                    return;
                                                                }
                                                                // Handle replace logic inline or separate function
                                                                setIsUploading(true);
                                                                const formData = new FormData();
                                                                formData.append('file', file);
                                                                fetch('/api/upload-cloudinary', { method: 'POST', body: formData })
                                                                    .then(async res => {
                                                                        if (!res.ok) {
                                                                            const errorText = await res.text();
                                                                            throw new Error(errorText || `Upload failed with status ${res.status}`);
                                                                        }
                                                                        return res.json();
                                                                    })
                                                                    .then(data => {
                                                                        if (data.success) {
                                                                            setPhotoUrls(prev => {
                                                                                const newUrls = [...prev];
                                                                                newUrls[index] = data.url;
                                                                                return newUrls;
                                                                            });
                                                                        } else {
                                                                            throw new Error(data.error || "Upload failed");
                                                                        }
                                                                        setIsUploading(false);
                                                                    })
                                                                    .catch((error) => {
                                                                        console.error('Upload failed', error);
                                                                        let errorMessage = "Failed to upload photo";
                                                                        if (error instanceof Error) {
                                                                            errorMessage += `: ${error.message}`;
                                                                        }
                                                                        alert(errorMessage);
                                                                        setIsUploading(false);
                                                                    });
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    ))}

                                    {photoUrls.length < 3 && (
                                        <div className="relative aspect-square flex flex-col gap-2">
                                            <div className="relative flex-1 rounded-lg border-2 border-dashed border-slate-200 dark:border-white/10 overflow-hidden">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileSelect}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    disabled={isUploading}
                                                />
                                                <div className={`w-full h-full flex flex-col items-center justify-center gap-2 transition-colors ${isUploading ? 'bg-white/5' : 'hover:bg-white/5 hover:border-white/20'}`}>
                                                    {isUploading ? (
                                                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                                    ) : (
                                                        <Camera className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                                                    )}
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                                        {isUploading ? "..." : "Add"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <GooglePhotosPicker
                                                    onPhotoSelected={(url) => setPhotoUrls(prev => [...prev, url])}
                                                    onLoading={setIsUploading}
                                                    isPro={isPro}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Entry
                            </Button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
