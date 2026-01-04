'use client';

import { JAR_TEMPLATES, type JarTemplate } from '@/lib/jar-templates';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface TemplateGalleryProps {
    isAuthenticated?: boolean;
}

export function TemplateGallery({ isAuthenticated = false }: TemplateGalleryProps) {
    const router = useRouter();
    const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null);

    const handleUseTemplate = async (templateId: string) => {
        if (!isAuthenticated) {
            // Redirect to signup with template ID
            router.push(`/signup?template=${templateId}`);
            return;
        }

        setCreatingTemplate(templateId);

        try {
            const response = await fetch('/api/jar/from-template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId })
            });

            if (!response.ok) throw new Error('Failed to create jar');

            const jar = await response.json();

            // Navigate to the new jar
            router.push(`/dashboard?jar=${jar.id}`);
        } catch (error) {
            console.error('Error creating jar from template:', error);
            alert('Failed to create jar. Please try again.');
        } finally {
            setCreatingTemplate(null);
        }
    };

    return (
        <section className="py-20 px-4 md:px-6 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                            Start with a Template
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Get instant value with our pre-filled jar templates. Just pick one, customize it, and start spinning!
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {JAR_TEMPLATES.map((template, index) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onUse={() => handleUseTemplate(template.id)}
                            isCreating={creatingTemplate === template.id}
                            delay={index * 0.1}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

interface TemplateCardProps {
    template: JarTemplate;
    onUse: () => void;
    isCreating: boolean;
    delay: number;
}

function TemplateCard({ template, onUse, isCreating, delay }: TemplateCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="glass-card p-6 flex flex-col h-full hover:shadow-xl transition-all group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="text-4xl mb-3">{template.icon}</div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {template.name.replace(/^[^\w\s]+\s*/, '')}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {template.description}
                    </p>
                </div>
            </div>

            {/* Idea Count */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                <Check className="w-4 h-4 text-green-500" />
                <span>{template.ideas.length} ideas included</span>
            </div>

            {/* Preview Ideas */}
            {isExpanded && (
                <div className="mb-4 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {template.ideas.slice(0, 5).map((idea, idx) => (
                        <div key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>{idea.description}</span>
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
            <div className="mt-auto pt-4 flex flex-col gap-2">
                <Button
                    onClick={onUse}
                    disabled={isCreating}
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 border-none"
                >
                    {isCreating ? 'Creating...' : 'Use This Template'}
                    {!isCreating && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                    {isExpanded ? 'Show Less' : 'Preview Ideas'}
                </button>
            </div>
        </motion.div>
    );
}
