"use client";

import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Save, Camera, Loader2, Trash2, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { GooglePhotosPicker } from "./GooglePhotosPicker";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface AddMemoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    isPro?: boolean;
    initialData?: any;
}

export function AddMemoryModal({ isOpen, onClose, onSuccess, isPro, initialData }: AddMemoryModalProps) {
    const router = useRouter();
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [rating, setRating] = useState(0);
    const [notes, setNotes] = useState("");
    const [category, setCategory] = useState("");
    const [allowedCategories, setAllowedCategories] = useState<{ id: string, label: string }[]>([]);
    const [photoUrls, setPhotoUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Better: Import and use directly
    const fetchCategories = async (initialCat?: string) => {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) {
            const { getCategoriesForTopic } = await import('@/lib/categories');
            const cats = getCategoriesForTopic(data.user.jarTopic, data.user.customCategories);
            setAllowedCategories(cats);

            // Priority: provided initial category, else current category if valid, else first available
            if (initialCat && cats.some(c => c.id === initialCat)) {
                setCategory(initialCat);
            } else if (!category && cats.length > 0) {
                setCategory(cats[0].id);
            }
        }
    };

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setDescription(initialData.description || "");
                setDate(new Date(initialData.selectedDate || initialData.selectedAt || new Date()).toISOString().split('T')[0]);
                setRating(initialData.rating || 0);
                setNotes(initialData.notes || "");
                setPhotoUrls(initialData.photoUrls || []);
                fetchCategories(initialData.category);
            } else {
                setDescription("");
                setDate(new Date().toISOString().split('T')[0]);
                setRating(0);
                setNotes("");
                setPhotoUrls([]);
                fetchCategories();
            }
        }
    }, [isOpen, initialData]);

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
        if (!description) {
            alert("Please enter a description of the date.");
            return;
        }

        setIsLoading(true);

        try {
            const url = initialData?.id ? `/api/ideas/${initialData.id}` : '/api/ideas';
            const method = initialData?.id ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description,
                    selectedAt: method === 'POST' ? new Date(date).toISOString() : undefined,
                    selectedDate: new Date(date).toISOString(),
                    rating,
                    notes,
                    photoUrls,
                    category: category || undefined,
                    // Defaults for new entries
                    cost: 'FREE',
                    duration: 2,
                    indoor: false,
                    activityLevel: 'MEDIUM',
                    timeOfDay: 'ANY'
                }),
                credentials: 'include',
            });

            if (res.ok) {
                // Reset form
                setDescription("");
                setDate(new Date().toISOString().split('T')[0]);
                setRating(0);
                setNotes("");
                setPhotoUrls([]);

                onClose();
                if (onSuccess) onSuccess();
                router.refresh();
            } else {
                const data = await res.json();
                alert(`Failed to save memory: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error saving memory");
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
                        className="glass-card w-full max-w-md relative max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 pb-32 md:pb-6"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            {initialData ? "Edit Memory" : "Add Past Memory"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-400">What did you do?</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Picnic at the park, Dinner at Mario's"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-400">When was it?</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 pl-10 text-slate-900 dark:text-white focus:outline-none focus:border-primary/50" // pl-10 for icon
                                        style={{ colorScheme: "light dark" }}
                                    />
                                    <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2 text-center">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-400">How was it?</label>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {allowedCategories.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-400">Category</label>
                                    <div className="relative">
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white appearance-none focus:outline-none focus:border-primary/50"
                                        >
                                            {allowedCategories.map(cat => (
                                                <option key={cat.id} value={cat.id} className="bg-slate-50 dark:bg-slate-900">{cat.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-400">Notes (Optional)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Any special memories?"
                                    className="w-full h-24 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-primary/50 resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-400">Photos ({photoUrls.length}/3)</label>

                                <div className="grid grid-cols-3 gap-3">
                                    {photoUrls.map((url, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group bg-black/40">
                                            <img src={url} alt={`Memory ${index + 1}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
                                                                setIsUploading(true);
                                                                const formData = new FormData();
                                                                formData.append('file', file);
                                                                fetch('/api/upload-cloudinary', { method: 'POST', body: formData })
                                                                    .then(res => res.json())
                                                                    .then(data => {
                                                                        if (data.success) {
                                                                            setPhotoUrls(prev => {
                                                                                const newUrls = [...prev];
                                                                                newUrls[index] = data.url;
                                                                                return newUrls;
                                                                            });
                                                                        }
                                                                        setIsUploading(false);
                                                                    })
                                                                    .catch(() => setIsUploading(false));
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    ))}

                                    {photoUrls.length < 3 && (
                                        <div className="relative aspect-square flex flex-col gap-2">
                                            <div className="relative flex-1 rounded-lg border-2 border-dashed border-slate-300 dark:border-white/10 overflow-hidden">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileSelect}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    disabled={isUploading}
                                                />
                                                <div className={`w-full h-full flex flex-col items-center justify-center gap-2 transition-colors ${isUploading ? 'bg-slate-100 dark:bg-white/5' : 'hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-400 dark:hover:border-white/20'}`}>
                                                    {isUploading ? (
                                                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                                    ) : (
                                                        <Camera className="w-6 h-6 text-slate-400" />
                                                    )}
                                                    <span className="text-xs text-slate-400">
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
                                {initialData ? "Update Memory" : "Save to History"}
                            </Button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
