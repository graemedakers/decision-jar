"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Loader2, Plus, RefreshCw, Trash2, Check, Edit2, X, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export interface GeneratedIdea {
    title: string;
    description: string;
    category: string;
    indoor: boolean;
    duration: number;
    cost: string;
    activityLevel: string;
    timeOfDay?: string;
    jarId?: string;
    details?: string; // Markdown content (e.g. Recipe)
}

interface BulkIdeaPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    ideas: GeneratedIdea[];
    onConfirm: (selectedIdeas: GeneratedIdea[]) => void;
    onRegenerate: () => void;
    isRegenerating?: boolean;
    isSaving?: boolean;
}

export function BulkIdeaPreviewModal({
    isOpen,
    onClose,
    ideas: initialIdeas,
    onConfirm,
    onRegenerate,
    isRegenerating,
    isSaving
}: BulkIdeaPreviewModalProps) {
    const [ideas, setIdeas] = useState<GeneratedIdea[]>(initialIdeas);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set(initialIdeas.map((_, i) => i)));
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<GeneratedIdea | null>(null);

    // Sync state when props change
    if (initialIdeas !== ideas && !editingIndex && !isRegenerating) {
        setIdeas(initialIdeas);
        setSelectedIndices(new Set(initialIdeas.map((_, i) => i)));
    }

    const toggleSelection = (index: number) => {
        const newSet = new Set(selectedIndices);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        setSelectedIndices(newSet);
    };

    const handleRemove = (index: number) => {
        const newIdeas = ideas.filter((_, i) => i !== index);
        setIdeas(newIdeas);
        // Adjust selection indices
        const newSet = new Set<number>();
        selectedIndices.forEach(i => {
            if (i < index) newSet.add(i);
            if (i > index) newSet.add(i - 1);
        });
        setSelectedIndices(newSet);
    };

    const startEdit = (index: number) => {
        setEditingIndex(index);
        setEditForm({ ...ideas[index] });
    };

    const saveEdit = () => {
        if (editingIndex === null || !editForm) return;
        const newIdeas = [...ideas];
        newIdeas[editingIndex] = editForm;
        setIdeas(newIdeas);
        setEditingIndex(null);
        setEditForm(null);
    };

    const handleConfirm = () => {
        const selected = ideas.filter((_, i) => selectedIndices.has(i));
        onConfirm(selected);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isSaving && !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DialogHeader className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Wand2 className="w-5 h-5 text-purple-500" />
                            Generated Ideas
                        </DialogTitle>
                        <div className="text-sm text-slate-500">
                            {selectedIndices.size} selected
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {ideas.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            No ideas generated. Try regenerating or changing your prompt.
                        </div>
                    ) : (
                        ideas.map((idea, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "relative group border rounded-xl p-3 transition-all",
                                    selectedIndices.has(index)
                                        ? "bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-800/30 shadow-sm"
                                        : "bg-slate-50 dark:bg-slate-900/50 border-transparent opacity-60 hover:opacity-100"
                                )}
                            >
                                {editingIndex === index && editForm ? (
                                    <div className="space-y-3">
                                        <Input
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            className="font-semibold"
                                            placeholder="Title"
                                        />
                                        <Textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="text-sm"
                                            placeholder="Description"
                                            rows={2}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => setEditingIndex(null)}>Cancel</Button>
                                            <Button size="sm" onClick={saveEdit}>Save</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3">
                                        <div className="pt-1">
                                            <button
                                                onClick={() => toggleSelection(index)}
                                                className={cn(
                                                    "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                    selectedIndices.has(index)
                                                        ? "bg-purple-500 border-purple-500 text-white"
                                                        : "border-slate-300 dark:border-slate-600 hover:border-purple-400"
                                                )}
                                            >
                                                {selectedIndices.has(index) && <Check className="w-3 h-3" />}
                                            </button>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-0.5 truncate pr-8">
                                                {idea.title}
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                                {idea.description}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="text-[10px] uppercase font-medium tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                    {idea.cost}
                                                </span>
                                                <span className="text-[10px] uppercase font-medium tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                    {idea.duration}h
                                                </span>
                                                <span className="text-[10px] uppercase font-medium tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                    {idea.category}
                                                </span>
                                                {idea.details && (
                                                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                                        Details
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEdit(index)}
                                                className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleRemove(index)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <DialogFooter className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 gap-2 sm:gap-0">
                    <div className="flex items-center gap-2 mr-auto w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={onRegenerate}
                            disabled={isRegenerating || isSaving}
                            className="w-full sm:w-auto"
                        >
                            {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                            Regenerate
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="ghost" onClick={onClose} disabled={isSaving} className="flex-1 sm:flex-none">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={selectedIndices.size === 0 || isSaving}
                            className="bg-purple-600 hover:bg-purple-700 text-white flex-1 sm:flex-none"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Plus className="w-4 h-4 mr-2" />
                            )}
                            Add {selectedIndices.size} Ideas
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
