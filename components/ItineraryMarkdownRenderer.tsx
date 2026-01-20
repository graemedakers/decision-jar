import React, { useState } from 'react';
import { Calendar, ArrowRight, ChevronDown, ChevronUp, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { downloadShoppingListPdf } from "@/lib/pdf-utils";

interface ItineraryMarkdownRendererProps {
    markdown: string;
    configId?: string;
    theme?: any;
    variant?: 'accordion' | 'sections';
}

export function ItineraryMarkdownRenderer({ markdown, configId, theme, variant }: ItineraryMarkdownRendererProps) {
    const [openCards, setOpenCards] = useState<Record<number, boolean>>({ 0: true });

    const toggleCard = (idx: number) => {
        setOpenCards(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    // Special handling for Itineraries (Day 1, Day 2...) to create cards
    const isItinerary = variant === 'accordion' || configId === 'holiday_concierge';

    // Split by H3 (###) which we use for Day headers in prompts
    const sections = markdown.split(/^### /gm);

    const handleDownloadShoppingList = () => {
        downloadShoppingListPdf(markdown);
    };

    return (
        <div className="space-y-4">
            {configId === 'chef_concierge' && (
                <div className="flex justify-end mb-2">
                    <button
                        onClick={handleDownloadShoppingList}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Download Shopping List (PDF)
                    </button>
                </div>
            )}
            {sections.map((section, idx) => {
                if (!section.trim()) return null;

                // Helper function to detect and render plain URLs as clickable links
                const renderTextWithLinks = (text: string) => {
                    if (!text) return text;

                    // Regex to match URLs (http, https) - capture everything, then clean trailing punctuation
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const parts = text.split(urlRegex);

                    return parts.map((part, idx) => {
                        if (part.match(urlRegex)) {
                            // Clean up any trailing punctuation (but not alphanumeric chars)
                            let cleanUrl = part;
                            let trailingPunctuation = '';

                            // Only remove trailing punctuation characters (not letters/numbers/colons)
                            // Exclude colon since it's part of https://
                            while (cleanUrl.length > 0 && /[).,;!?]$/.test(cleanUrl)) {
                                trailingPunctuation = cleanUrl.slice(-1) + trailingPunctuation;
                                cleanUrl = cleanUrl.slice(0, -1);
                            }

                            return (
                                <React.Fragment key={idx}>
                                    <a
                                        href={cleanUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 dark:text-blue-400 hover:underline font-medium break-all"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {cleanUrl}
                                    </a>
                                    {trailingPunctuation}
                                </React.Fragment>
                            );
                        }
                        return part;
                    });
                };

                const renderBody = (text: string) => {
                    return text.split('\n').map((line, i) => {
                        const trimmed = line.trim();
                        if (!trimmed) return <div key={i} className="h-2" />;

                        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                            // Sub-headers like **Morning:**
                            return <div key={i} className="font-bold text-slate-800 dark:text-slate-100 mt-2 mb-1 text-sm">{trimmed.replace(/\*\*/g, '')}</div>;
                        }
                        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                            // List items - also need to handle URLs within them
                            const listContent = trimmed.replace(/^[-*] /, '');
                            return <li key={i} className="ml-4 list-disc pl-1 text-slate-600 dark:text-slate-300 text-sm">{renderTextWithLinks(listContent)}</li>;
                        }

                        // Link parsing (e.g. Map links)
                        const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
                        if (linkMatch) {
                            const [full, text, url] = linkMatch;
                            const parts = line.split(full);
                            return (
                                <p key={i} className="mb-1 text-sm">
                                    {renderTextWithLinks(parts[0])}
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium inline-flex items-center gap-0.5">
                                        {text} <ArrowRight className="w-3 h-3" />
                                    </a>
                                    {renderTextWithLinks(parts[1])}
                                </p>
                            );
                        }

                        return <p key={i} className="mb-1 text-sm text-slate-600 dark:text-slate-300">{renderTextWithLinks(line)}</p>;
                    });
                };

                // If it's the first chunk and doesn't start with a header (intro text)
                if (idx === 0 && !markdown.startsWith('### ')) {
                    return (
                        <div key={idx} className="mb-4 text-slate-600 dark:text-slate-300 italic text-sm">
                            {renderBody(section)}
                        </div>
                    );
                }

                const [titleLine, ...contentLines] = section.split('\n');
                const body = contentLines.join('\n').trim();


                // Itinerary Card Style with Accordion
                if (isItinerary) {
                    const isOpen = openCards[idx];
                    // If no openCards logic yet, default first one open? Logic handled in init state {0:true}
                    // Note: idx might be messed up if 0 was intro. 
                    // If we have an intro at 0, then real cards start at 1. Initialize logic handled above.

                    return (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-white/5 overflow-hidden">
                            <button
                                onClick={() => toggleCard(idx)}
                                className="w-full bg-slate-100 dark:bg-slate-700/30 px-4 py-2 border-b border-transparent data-[open=true]:border-slate-200 dark:data-[open=true]:border-white/5 flex items-center justify-between gap-2 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors"
                                data-open={isOpen}
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{titleLine.trim()}</h3>
                                </div>
                                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </button>

                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="p-3 bg-white/50 dark:bg-transparent">
                                            {renderBody(body)}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                }

                // Default Style (Chef etc)
                return (
                    <div key={idx} className="mb-4">
                        <h3 className={`text-base font-bold mb-2 flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-1 ${theme?.sectionHeaderColor || 'text-slate-800'}`}>
                            {titleLine.trim()}
                        </h3>
                        <div className="leading-relaxed">
                            {renderBody(body)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
