import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Users, ChefHat, ExternalLink, ListChecks, FileText, Maximize2, X, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RecipeDetailsProps {
    data: any;
    compact?: boolean;
    idea?: any;
}

export function RecipeDetails({ data, compact, idea }: RecipeDetailsProps) {
    const [isCookMode, setIsCookMode] = useState(false);

    if (!data) return null;

    if (compact) {
        return (
            <div className="text-xs text-slate-500">
                {data.prepTime && <span>{data.prepTime + (data.cookTime || 0)}m • </span>}
                {data.difficulty && <span className="capitalize">{data.difficulty} • </span>}
                <span>{data.ingredients?.length || 0} ingredients</span>
            </div>
        );
    }

    const recipeTitle = data.title || idea?.name || idea?.title || "Recipe";
    const coverImage = idea?.photoUrls?.[0];

    // Sanitize instructions/details if they contain residual markdown headers
    const sanitizedInstructions = typeof data.instructions === 'string'
        ? data.instructions.replace(/^[#*\s]+[\w\s]+\n+/, '').trim()
        : data.instructions;

    return (
        <div className="space-y-5 mt-1">
            {/* Title */}
            {!compact && (
                <div className="flex justify-between items-start gap-4">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                        {recipeTitle}
                    </h2>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setIsCookMode(true)}
                        className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 shrink-0"
                    >
                        <Maximize2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Cook Mode</span>
                        <span className="sm:hidden">Cook</span>
                    </Button>
                </div>
            )}

            {idea?.description && idea.description.toLowerCase().trim() !== recipeTitle.toLowerCase().trim() && (
                <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-lg border border-slate-200 dark:border-white/5">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        {idea.description}
                    </p>
                </div>
            )}

            {/* Cover Image */}
            {coverImage && (
                <div className="w-full h-48 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-white/10">
                    <img src={coverImage} alt="Recipe" className="w-full h-full object-cover" />
                </div>
            )}

            {/* Meta Stats */}
            <div className="flex flex-wrap gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/10">
                {(data.prepTime || data.cookTime) && (
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <div>
                            <p className="text-[10px] uppercase text-slate-500 font-bold">Time</p>
                            <p className="text-sm font-medium">{(data.prepTime || 0) + (data.cookTime || 0)} mins</p>
                        </div>
                    </div>
                )}
                {data.servings && (
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <div>
                            <p className="text-[10px] uppercase text-slate-500 font-bold">Serves</p>
                            <p className="text-sm font-medium">{data.servings}</p>
                        </div>
                    </div>
                )}
                {data.difficulty && (
                    <div className="flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-green-500" />
                        <div>
                            <p className="text-[10px] uppercase text-slate-500 font-bold">Level</p>
                            <p className="text-sm font-medium capitalize">{data.difficulty}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Prep Ahead Tips */}
            {data.prepAhead && (
                <div className="bg-orange-50/50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/20">
                    <div className="flex items-center gap-2 mb-2">
                        <CalendarClock className="w-4 h-4 text-orange-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-orange-800 dark:text-orange-400">Prep Ahead Timings</h4>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                        {data.prepAhead}
                    </p>
                </div>
            )}



            {/* Ingredients */}
            {data.ingredients && data.ingredients.length > 0 && (
                <div className="space-y-2">
                    <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        <ListChecks className="w-4 h-4 text-primary" />
                        Ingredients
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
                        {data.ingredients.map((ing: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 py-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                                <span>{ing}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Instructions */}
            {sanitizedInstructions && (
                <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        <FileText className="w-4 h-4 text-primary" />
                        Instructions
                    </h4>
                    <div className="prose prose-sm dark:prose-invert max-w-none bg-slate-50 dark:bg-black/20 p-4 rounded-xl leading-relaxed whitespace-pre-line">
                        {sanitizedInstructions}
                    </div>
                </div>
            )}

            {/* Cook Mode Overlay - Portaled to escape parent modal constraints */}
            {isCookMode && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[2000] bg-white dark:bg-slate-950 overflow-y-auto overscroll-none p-6 md:p-12 animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="flex justify-between items-start border-b dark:border-white/10 pb-6">
                            <div>
                                <p className="text-orange-500 font-bold uppercase tracking-widest text-xs mb-1">Cook Mode Active</p>
                                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">Instructions</h2>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsCookMode(false)}
                                className="rounded-full h-12 w-12 hover:bg-slate-100 dark:hover:bg-white/10"
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        {data.ingredients && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                    <ListChecks className="w-5 h-5 text-primary" />
                                    Checklist
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {data.ingredients.map((ing: string, i: number) => (
                                        <label key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 cursor-pointer active:scale-95 transition-transform">
                                            <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary h-5 w-5 bg-white dark:bg-slate-800" />
                                            <span className="text-slate-700 dark:text-slate-300 font-medium">{ing}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                <FileText className="w-5 h-5 text-primary" />
                                Steps
                            </h3>
                            <div className="text-xl leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-white/5 p-8 rounded-3xl border border-slate-100 dark:border-white/10">
                                {data.instructions}
                            </div>
                        </div>

                        <div className="text-center pt-8 border-t dark:border-white/10">
                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => setIsCookMode(false)}
                                className="w-full md:w-auto"
                            >
                                Finish Cooking & Close
                            </Button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

