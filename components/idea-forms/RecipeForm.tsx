import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RecipeSchema } from "@/lib/validation/idea-schemas";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";

type RecipeFormData = z.infer<typeof RecipeSchema>;

interface RecipeFormProps {
    initialData?: RecipeFormData;
    onChange: (data: RecipeFormData) => void;
}

export function RecipeForm({ initialData, onChange }: RecipeFormProps) {
    const { register, control, watch, formState: { errors } } = useForm<RecipeFormData>({
        resolver: zodResolver(RecipeSchema),
        defaultValues: initialData || {
            ingredients: [""],
            instructions: "",
            dietaryTags: [],
            tips: [],
        },
        mode: "onChange"
    });

    const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
        control,
        // @ts-ignore
        name: "ingredients"
    });

    const values = watch();
    const prevDataRef = React.useRef(JSON.stringify(values));

    useEffect(() => {
        const currentDataStr = JSON.stringify(values);
        if (currentDataStr !== prevDataRef.current) {
            prevDataRef.current = currentDataStr;
            onChange(values);
        }
    }, [values, onChange]);

    return (
        <div className="space-y-4 text-slate-800 dark:text-slate-200">
            {/* Ingredients */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ingredients</label>
                <div className="space-y-2">
                    {ingredientFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                            <input
                                {...register(`ingredients.${index}` as any)}
                                className="flex-1 rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                placeholder={`Ingredient ${index + 1}`}
                            />
                            <button
                                type="button"
                                onClick={() => removeIngredient(index)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => appendIngredient("")}
                        className="flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-600 uppercase tracking-wide py-1"
                    >
                        <Plus className="w-3 h-3" /> Add Ingredient
                    </button>
                    {errors.ingredients && <p className="text-xs text-red-500">{errors.ingredients.message}</p>}
                </div>
            </div>

            {/* Preparation Details */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Prep Time (mins)</label>
                    <input
                        type="number"
                        {...register("prepTime", { valueAsNumber: true })}
                        className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cook Time (mins)</label>
                    <input
                        type="number"
                        {...register("cookTime", { valueAsNumber: true })}
                        className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Instructions</label>
                <textarea
                    {...register("instructions")}
                    className="w-full min-h-[120px] rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-y"
                    placeholder="Step-by-step cooking instructions..."
                />
                {errors.instructions && <p className="text-xs text-red-500">{errors.instructions.message}</p>}
            </div>

            {/* Difficulty & Servings */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Difficulty</label>
                    <select
                        {...register("difficulty")}
                        className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                        <option value="">Select...</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Servings</label>
                    <input
                        type="number"
                        {...register("servings", { valueAsNumber: true })}
                        className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Source URL</label>
                <input
                    {...register("sourceUrl")}
                    className="w-full rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="https://..."
                />
                {errors.sourceUrl && <p className="text-xs text-red-500">{errors.sourceUrl.message}</p>}
            </div>
        </div>
    );
}
