"use client";

import { ShoppingCart, CheckCircle2 } from "lucide-react";

interface ShoppingListPreviewProps {
    plan: any;
    title: string;
}

export function ShoppingListPreview({ plan, title, markdown }: ShoppingListPreviewProps & { markdown?: string | null }) {
    if (!plan && !markdown) return null;

    let ingredients: string[] = [];

    if (plan && typeof plan === 'object') {
        const courses = plan.courses || [];
        ingredients = courses.flatMap((c: any) => c.ingredients || []);
    } else if (markdown) {
        const lines = markdown.split('\n');
        let inList = false;
        for (const line of lines) {
            if (line.includes('Shopping List')) {
                inList = true;
                continue;
            }
            if (inList && line.startsWith('###')) {
                break;
            }
            if (inList) {
                const trimmed = line.trim();
                const match = trimmed.match(/^[-*+]\s*(.*)/) || trimmed.match(/^\d+\.\s*(.*)/);
                if (match) {
                    ingredients.push(match[1]);
                } else if (trimmed && !trimmed.startsWith('#')) {
                    ingredients.push(trimmed);
                }
            }
        }
    }

    // Remove duplicates and clean up
    const uniqueIngredients = Array.from(new Set(ingredients.map((i: string) => i.trim()))).filter(Boolean);

    return (
        <div className="space-y-8 p-8 bg-white dark:bg-slate-900 min-h-[500px] border border-slate-200 dark:border-white/10 rounded-[2rem]">
            <div className="text-center space-y-2 mb-8">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-8 h-8 text-orange-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Shopping List</h1>
                <p className="text-orange-600 font-bold uppercase tracking-widest text-[10px]">{title}</p>
            </div>

            <div className="space-y-6">
                <div className="grid gap-3">
                    {uniqueIngredients.length > 0 ? (
                        uniqueIngredients.map((ingredient, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 pdf-item">
                                <div className="w-6 h-6 rounded-lg border-2 border-slate-200 dark:border-slate-700 flex-shrink-0" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{ingredient as string}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-400 italic py-8">No ingredients found in the plan.</p>
                    )}
                </div>
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-white/5 text-center">
                <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Brought to you by Decision Jar
                </div>
            </div>
        </div>
    );
}
