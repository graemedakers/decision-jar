'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { JAR_TEMPLATES, type JarTemplate } from '@/lib/jar-templates';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TemplateBrowserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TemplateBrowserModal({ isOpen, onClose }: TemplateBrowserModalProps) {
    const router = useRouter();
    const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null);
    const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

    const handleUseTemplate = async (templateId: string) => {
        setCreatingTemplate(templateId);

        try {
            const response = await fetch('/api/jar/from-template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId })
            });

            if (!response.ok) throw new Error('Failed to create jar');

            const jar = await response.json();

            // Close modal and navigate to the new jar
            onClose();
            router.refresh(); // Refresh to show new jar in list

            // Small delay to allow refresh, then set active jar
            setTimeout(() => {
                window.location.href = `/dashboard?jar=${jar.id}`;
            }, 500);
        } catch (error) {
            console.error('Error creating jar from template:', error);
            alert('Failed to create jar. Please try again.');
        } finally {
            setCreatingTemplate(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
                            onClick={onClose}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Template Grid */}
                <div className="overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {JAR_TEMPLATES.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onUse={() => handleUseTemplate(template.id)}
                                isCreating={creatingTemplate === template.id}
                                isExpanded={expandedTemplate === template.id}
                                onToggleExpand={() => setExpandedTemplate(
                                    expandedTemplate === template.id ? null : template.id
                                )}
                            />
                        ))}
                    </div>
                </div>
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
