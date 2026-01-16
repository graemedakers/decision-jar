'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { JAR_TEMPLATES, type JarTemplate } from '@/lib/jar-templates';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { trackTemplateBrowsed, trackTemplateUsed, trackPathSelected, trackModalAbandoned } from '@/lib/analytics';
import { showSuccess, showError } from '@/lib/toast';

interface TemplateBrowserModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentJarId?: string | null;
    currentJarName?: string | null;
    hasJars?: boolean;
    currentJarIdeaCount?: number; // ✅ NEW: Track if current jar is empty
    onSuccess?: () => void;
}

export function TemplateBrowserModal({
    isOpen,
    onClose,
    currentJarId = null,
    currentJarName = null,
    hasJars = false,
    currentJarIdeaCount = 0, // ✅ NEW: Default to 0
    onSuccess
}: TemplateBrowserModalProps) {
    const router = useRouter();
    const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null);
    const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
    const [showChoiceDialog, setShowChoiceDialog] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<JarTemplate | null>(null);
    const [dialogChoice, setDialogChoice] = useState<'new' | 'current'>('new');

    // Abandonment tracking
    const [modalOpenTime, setModalOpenTime] = useState<number | null>(null);
    const [hadInteraction, setHadInteraction] = useState(false);
    const templateWasUsed = useRef(false);

    // Track when modal opens
    useEffect(() => {
        if (isOpen) {
            setModalOpenTime(Date.now());
            setHadInteraction(false);
            templateWasUsed.current = false;
            trackPathSelected('3_browse_templates', { trigger: 'modal_opened' });
            trackTemplateBrowsed();
        }
    }, [isOpen]);

    // Enhanced close handler with abandonment tracking
    const handleClose = () => {
        // Track abandonment if modal is being closed without using a template
        if (modalOpenTime && !templateWasUsed.current) {
            const timeOpenSeconds = (Date.now() - modalOpenTime) / 1000;
            trackModalAbandoned('template_browser', timeOpenSeconds, hadInteraction, {
                templates_expanded: expandedTemplate ? 1 : 0
            });
        }
        onClose();
    };

    const handleTemplateClick = (template: JarTemplate) => {
        setHadInteraction(true); // Mark interaction
        setSelectedTemplate(template);

        // If user has a current jar...
        if (hasJars && currentJarId) {
            // ...and it's not empty, ask them what to do
            // Explicit check for undefined to handle edge cases
            if (currentJarIdeaCount !== undefined && currentJarIdeaCount > 0) {
                setDialogChoice('new'); // Default to new jar
                setShowChoiceDialog(true);
            } else {
                // ...but if it IS empty (or count unavailable), just fill it! (Avoids creating 2nd jar limit issue)
                handleAddToCurrentJar(template.id);
            }
        } else {
            // No jars yet or not in a jar context - create new
            handleCreateNewJar(template.id);
        }
    };

    const handleConfirmChoice = () => {
        if (!selectedTemplate) return;

        setShowChoiceDialog(false);

        if (dialogChoice === 'new') {
            trackTemplateUsed(selectedTemplate.id, selectedTemplate.name, 'new_jar');
            handleCreateNewJar(selectedTemplate.id);
        } else {
            trackTemplateUsed(selectedTemplate.id, selectedTemplate.name, 'add_to_current');
            handleAddToCurrentJar(selectedTemplate.id);
        }
    };

    const handleCreateNewJar = async (templateId: string) => {
        setCreatingTemplate(templateId);

        try {
            const response = await fetch('/api/jars/from-template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId })
            });

            if (!response.ok) throw new Error('Failed to create jar');

            const jar = await response.json();

            // Mark that template was successfully used
            templateWasUsed.current = true;
            trackTemplateUsed(templateId, 'new_jar');

            // Close modal and navigate to the new jar
            handleClose();
            onSuccess?.();
            router.refresh(); // Refresh to show new jar in list

            // Small delay to allow refresh, then set active jar
            setTimeout(() => {
                window.location.href = `/dashboard?jar=${jar.id}`;
            }, 500);
        } catch (error) {
            console.error('Error creating jar from template:', error);
            showError('Failed to create jar. Please try again.');
        } finally {
            setCreatingTemplate(null);
        }
    };

    const handleAddToCurrentJar = async (templateId: string) => {
        if (!currentJarId) return;

        setCreatingTemplate(templateId);

        try {
            const response = await fetch('/api/jars/add-template-ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId, jarId: currentJarId })
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to add ideas to jar');
            }

            const result = await response.json();

            // Mark that template was successfully used
            templateWasUsed.current = true;
            trackTemplateUsed(templateId, 'add_to_jar');

            // Close modal and refresh to show new ideas
            handleClose();
            onSuccess?.();
            router.refresh();

            // Show success message
            showSuccess(`Successfully added ${result.count} ideas to your jar!`);
        } catch (error) {
            console.error('Error adding template ideas to jar:', error);
            showError('Failed to add ideas to jar. Please try again.');
        } finally {
            setCreatingTemplate(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden bg-slate-50 dark:bg-slate-900 p-0">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Browse Jar Templates
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                Get started with pre-filled jars. Pick one and customize it to your liking.
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Template Grid */}
                <div className="overflow-y-auto p-6 pb-24 max-h-[calc(90vh-120px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {JAR_TEMPLATES.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onUse={() => handleTemplateClick(template)}
                                isCreating={creatingTemplate === template.id}
                                isExpanded={expandedTemplate === template.id}
                                onToggleExpand={() => setExpandedTemplate(
                                    expandedTemplate === template.id ? null : template.id
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Choice Dialog Overlay */}
                {showChoiceDialog && selectedTemplate && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    How would you like to use this template?
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {selectedTemplate.name.replace(/^[^\w\s]+\s*/, '')} •{' '}
                                    {selectedTemplate.ideas.length} ideas
                                </p>
                            </div>

                            <div className="space-y-3">
                                {/* Option 1: Create New Jar */}
                                <label
                                    className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${dialogChoice === 'new'
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="template-choice"
                                        value="new"
                                        checked={dialogChoice === 'new'}
                                        onChange={(e) => setDialogChoice(e.target.value as 'new' | 'current')}
                                        className="sr-only"
                                    />
                                    <div className="flex items-start gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${dialogChoice === 'new'
                                            ? 'border-purple-500 bg-purple-500'
                                            : 'border-slate-300 dark:border-slate-600'
                                            }`}>
                                            {dialogChoice === 'new' && (
                                                <Check className="w-3 h-3 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900 dark:text-white mb-1">
                                                Create new jar from template
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                Recommended • Keeps your jars organized by topic
                                            </div>
                                        </div>
                                    </div>
                                </label>

                                {/* Option 2: Add to Current Jar */}
                                <label
                                    className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${dialogChoice === 'current'
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="template-choice"
                                        value="current"
                                        checked={dialogChoice === 'current'}
                                        onChange={(e) => setDialogChoice(e.target.value as 'new' | 'current')}
                                        className="sr-only"
                                    />
                                    <div className="flex items-start gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${dialogChoice === 'current'
                                            ? 'border-purple-500 bg-purple-500'
                                            : 'border-slate-300 dark:border-slate-600'
                                            }`}>
                                            {dialogChoice === 'current' && (
                                                <Check className="w-3 h-3 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900 dark:text-white mb-1">
                                                Add ideas to current jar
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                "{currentJarName || 'Current Jar'}"
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    onClick={() => {
                                        setShowChoiceDialog(false);
                                        setSelectedTemplate(null);
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConfirmChoice}
                                    className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 border-none"
                                >
                                    Continue
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

interface TemplateCardProps {
    template: JarTemplate;
    onUse: () => void;
    isCreating: boolean;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

function TemplateCard({ template, onUse, isCreating, isExpanded, onToggleExpand }: TemplateCardProps) {
    return (
        <div className="glass-card p-5 flex flex-col h-full hover:shadow-lg transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="text-3xl mb-2">{template.icon}</div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        {template.name.replace(/^[^\w\s]+\s*/, '')}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {template.description}
                    </p>
                </div>
            </div>

            {/* Idea Count */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                <Check className="w-3 h-3 text-green-500" />
                <span>{template.ideas.length} ideas included</span>
            </div>

            {/* Preview Ideas */}
            {isExpanded && (
                <div className="mb-3 space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                    {template.ideas.slice(0, 5).map((idea, idx) => (
                        <div key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span className="line-clamp-1">{idea.description}</span>
                        </div>
                    ))}
                    {template.ideas.length > 5 && (
                        <div className="text-xs text-slate-400 italic">
                            +{template.ideas.length - 5} more...
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="mt-auto pt-3 flex flex-col gap-2">
                <Button
                    onClick={onUse}
                    disabled={isCreating}
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 border-none text-sm h-9"
                >
                    {isCreating ? 'Creating...' : 'Use Template'}
                    {!isCreating && <ArrowRight className="w-3 h-3 ml-2" />}
                </Button>

                <button
                    onClick={onToggleExpand}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                    {isExpanded ? 'Hide' : 'Preview'} Ideas
                </button>
            </div>
        </div>
    );
}
