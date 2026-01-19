"use client";

import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Save, Camera, Loader2, Trash2, Utensils, Calendar, Moon, Activity, Clock, DollarSign, MapPin } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { GooglePhotosPicker } from "./GooglePhotosPicker";
import { useRouter } from "next/navigation";
import imageCompression from 'browser-image-compression';
import { showError, showSuccess } from "@/lib/toast";

interface RateDateModalProps {
    isOpen: boolean;
    onClose: () => void;
    idea: any;
    isPro?: boolean;
    initialMode?: 'rate' | 'photos';
}

export function RateDateModal({ isOpen, onClose, idea, isPro, initialMode = 'rate' }: RateDateModalProps) {
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [notes, setNotes] = useState("");
    const [photoUrls, setPhotoUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const photosRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && initialMode === 'photos' && photosRef.current) {
            // Small timeout to allow render
            setTimeout(() => {
                photosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [isOpen, initialMode]);

    useEffect(() => {
        if (idea && isOpen) {
            setRating(idea.rating || 0);
            setNotes(idea.notes || "");

            // Handle Photos - Filter out empty strings immediately
            if (idea.photoUrls && Array.isArray(idea.photoUrls)) {
                setPhotoUrls(idea.photoUrls.filter((url: string) => url && url.trim() !== ""));
            } else if (idea.photoUrl && idea.photoUrl.trim() !== "") {
                // Graceful fallback if migration kept old data
                setPhotoUrls([idea.photoUrl]);
            } else {
                setPhotoUrls([]);
            }

            fetch(`/api/ideas/${idea.id}/rate`)
                .then(res => res.json())
                .then((data) => {
                    console.log("Fetched ratings:", data);
                    if (Array.isArray(data)) {
                        const myRating = data.find((r: any) => r.isMe);
                        if (myRating) {
                            setRating(myRating.value);
                            setNotes(myRating.comment || "");
                        }
                    }
                })
                .catch(err => console.error(err));
        }
    }, [idea, isOpen]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (photoUrls.length >= 3) {
            showError("Maximum 3 photos allowed.");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showError("File is too large. Please choose an image under 10MB.");
            return;
        }

        setIsUploading(true);

        try {
            // Compress image before upload
            const compressionOptions = {
                maxSizeMB: 0.5, // Compress to max 500KB
                maxWidthOrHeight: 1920, // Max dimension
                useWebWorker: true,
                fileType: file.type as any,
            };

            const compressedFile = await imageCompression(file, compressionOptions);
            const originalSizeKB = (file.size / 1024).toFixed(0);
            const compressedSizeKB = (compressedFile.size / 1024).toFixed(0);

            const formData = new FormData();
            formData.append('file', compressedFile);

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
                showSuccess(`Image compressed (${originalSizeKB}KB → ${compressedSizeKB}KB)`);
            } else {
                throw new Error(data.error || "Upload failed");
            }
        } catch (error) {
            console.error('Upload failed', error);
            let errorMessage = "Failed to upload photo";
            if (error instanceof Error) {
                errorMessage += `: ${error.message}`;
            }
            showError(errorMessage);
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
            // Only save valid (non-empty) URLs
            const validUrls = photoUrls.filter(url => url && url.trim() !== "");

            const res = await fetch(`/api/ideas/${idea.id}/rate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, notes, photoUrls: validUrls }),
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

    const formattedDate = idea && (idea.selectedAt || idea.selectedDate)
        ? new Date(idea.selectedAt || idea.selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : "Unknown Date";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card w-full max-w-md relative max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-0"
                    >
                        {/* Premium Header - Consistent with ViewMemoryModal */}
                        <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 relative">
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 rounded-full p-2 bg-black/20 hover:bg-black/40 text-white transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl bg-white/20 backdrop-blur-md shadow-lg
                                    ${idea.category === 'MEAL' ? 'text-orange-100' :
                                        idea.category === 'EVENT' ? 'text-purple-100' :
                                            idea.category === 'PLANNED_DATE' ? 'text-pink-100' :
                                                'text-blue-100'
                                    }`}
                                >
                                    {idea.category === 'MEAL' && <Utensils className="w-6 h-6" />}
                                    {idea.category === 'EVENT' && <Calendar className="w-6 h-6" />}
                                    {idea.category === 'PLANNED_DATE' && <Moon className="w-6 h-6" />}
                                    {(!idea.category || idea.category === 'ACTIVITY') && <Activity className="w-6 h-6" />}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-white mb-1 leading-snug">{idea.description}</h2>
                                    <div className="flex items-center gap-2 text-white/80 text-xs">
                                        <Calendar className="w-3 h-3" />
                                        <span>{formattedDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6" autoComplete="off">
                            {/* Stats Grid - Minimal version */}
                            <div className="grid grid-cols-4 gap-2">
                                <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-2 text-center border border-slate-100 dark:border-white/5">
                                    <Clock className="w-3 h-3 text-blue-500 dark:text-blue-400 mx-auto mb-1" />
                                    <div className="text-[10px] text-slate-500 uppercase font-bold truncate">{idea.duration}h</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-2 text-center border border-slate-100 dark:border-white/5">
                                    <DollarSign className="w-3 h-3 text-green-500 dark:text-green-400 mx-auto mb-1" />
                                    <div className="text-[10px] text-slate-500 uppercase font-bold truncate">{idea.cost}</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-2 text-center border border-slate-100 dark:border-white/5">
                                    <Activity className="w-3 h-3 text-red-500 dark:text-red-400 mx-auto mb-1" />
                                    <div className="text-[10px] text-slate-500 uppercase font-bold truncate capitalize">{idea.activityLevel?.toLowerCase()}</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-2 text-center border border-slate-100 dark:border-white/5">
                                    <MapPin className="w-3 h-3 text-purple-500 dark:text-purple-400 mx-auto mb-1" />
                                    <div className="text-[10px] text-slate-500 uppercase font-bold truncate">{idea.indoor ? 'Indoor' : 'Outdoor'}</div>
                                </div>
                            </div>

                            <div className="space-y-4 text-center py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                <label className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">How was it?</label>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-125 active:scale-95"
                                        >
                                            <Star
                                                className={`w-8 h-8 transition-colors ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300 dark:text-slate-600"}`}
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

                            <div className="space-y-2" ref={photosRef}>
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
