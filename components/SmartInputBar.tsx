"use client";

import { useState, useRef } from "react";
import { Sparkles, BookOpen, Plus, Image as ImageIcon, Link as LinkIcon, Loader2 } from "lucide-react";
import { useModalSystem } from "@/components/ModalProvider";
import { motion, AnimatePresence } from "framer-motion";
import imageCompression from 'browser-image-compression';
import { showError, showSuccess } from "@/lib/toast";

export function SmartInputBar() {
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const { openModal } = useModalSystem();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isUrl = (text: string) => {
        try {
            new URL(text);
            return true;
        } catch {
            return false;
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type.toLowerCase())) {
            showError("Please upload a valid image file (JPG, PNG, GIF, or WebP).");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        // Check file size before compression
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showError("Image is too large. Please select an image under 10MB.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setIsUploadingImage(true);

        try {
            // Compression options
            const options = {
                maxSizeMB: 0.5, // Compress to max 500KB
                maxWidthOrHeight: 1920, // Max dimension
                useWebWorker: true,
                fileType: file.type as any,
            };

            // Compress the image
            const compressedFile = await imageCompression(file, options);

            // Convert to Base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;

                // Calculate compression ratio for user feedback
                const originalSizeKB = (file.size / 1024).toFixed(0);
                const compressedSizeKB = (compressedFile.size / 1024).toFixed(0);

                openModal('ADD_IDEA', {
                    initialData: {
                        description: "",
                        photoUrls: [result]
                    }
                });

                showSuccess(`Image compressed from ${originalSizeKB}KB to ${compressedSizeKB}KB`);

                // Reset input
                if (fileInputRef.current) fileInputRef.current.value = "";
                setIsUploadingImage(false);
            };

            reader.onerror = () => {
                showError("Failed to read image. Please try again.");
                setIsUploadingImage(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            };

            reader.readAsDataURL(compressedFile);

        } catch (error) {
            console.error('Image compression error:', error);
            showError("Failed to process image. Please try again.");
            setIsUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!inputValue.trim()) return;

        if (isUrl(inputValue)) {
            // Handle as Link
            openModal('ADD_IDEA', {
                initialData: {
                    description: "Shared Link",
                    details: inputValue
                }
            });
        } else {
            // Handle as Text
            openModal('ADD_IDEA', {
                initialData: {
                    description: inputValue
                }
            });
        }
        setInputValue("");
    };

    return (
        <div className="w-full max-w-2xl mx-auto px-4 z-20 relative">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
            />
            <motion.div
                data-tour="add-idea-button"
                className={`
                    relative group transition-all duration-300
                    ${isFocused ? 'scale-[1.02]' : 'scale-100'}
                `}
            >
                {/* Glow Effect */}
                <div className={`
                    absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl opacity-0 transition duration-500 blur
                    ${isFocused ? 'opacity-30' : 'group-hover:opacity-20'}
                `} />

                <form
                    onSubmit={handleSubmit}
                    className="relative flex items-center bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10"
                >
                    {/* Left Actions */}
                    <div className="flex items-center pl-2 space-x-1 shrink-0">
                        <button
                            type="button"
                            onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isUploadingImage ? "Processing image..." : "Upload Image"}
                        >
                            {isUploadingImage ? (
                                <Loader2 className="w-5 h-5 animate-spin text-pink-600" />
                            ) : (
                                <ImageIcon className="w-5 h-5" />
                            )}
                        </button>
                        <button
                            type="button"
                            data-tour="surprise-me-button"
                            onClick={() => {
                                openModal('CONCIERGE', {
                                    toolId: 'CONCIERGE',
                                    initialPrompt: inputValue
                                });
                                if (inputValue) setInputValue("");
                            }}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors tooltip-trigger"
                            title="Ask AI Concierge"
                        >
                            <Sparkles className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => openModal('TEMPLATE_BROWSER')}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors hidden sm:block"
                            title="Browse Templates"
                        >
                            <BookOpen className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block" />

                    {/* Main Input */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Type an idea, paste a link, upload an image, or ask AI..."
                        className="flex-1 bg-transparent border-none outline-none px-3 py-4 text-slate-800 dark:text-white placeholder:text-slate-400 text-base md:text-lg min-w-0"
                    />

                    {/* Right Action (Dynamic) */}
                    <div className="pr-2 shrink-0">
                        <AnimatePresence mode="wait">
                            {inputValue.trim() ? (
                                <motion.button
                                    key="submit"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    type="submit"
                                    className="p-2.5 bg-primary text-white rounded-xl shadow-lg hover:bg-primary/90 transition-colors"
                                >
                                    {isUrl(inputValue) ? <LinkIcon className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                </motion.button>
                            ) : (
                                <motion.div
                                    key="placeholder-icon"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="pr-2"
                                >
                                    <span className="text-[10px] uppercase font-bold text-slate-300 dark:text-slate-600 select-none hidden sm:block">
                                        Press Enter
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </form>
            </motion.div>

            {/* Helper Text / Quick Chips (Optional - can be added later) */}
        </div>
    );
}
