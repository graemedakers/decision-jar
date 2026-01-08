import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Loader2, Sparkles, ChefHat, Plus, Lock, Check, Share2, Users, ShoppingCart, RefreshCw, ClipboardList, Heart } from "lucide-react";
import { Button } from "./ui/Button";
import { useConciergeActions } from "@/hooks/useConciergeActions";
import { trackAIToolUsed, trackEvent } from "@/lib/analytics";
import { showSuccess, showError } from "@/lib/toast";
import { generateShoppingList, regenerateMeal } from "@/app/actions/menu";
import { ShoppingListModal } from "./ShoppingListModal";

interface MenuPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onIdeaAdded?: () => void;
}

interface MealPlan {
    day: string;
    meal: string;
    description: string;
    prep_time: string;
    difficulty: string;
    ingredients?: string[];
    instructions?: string[];
}

export function MenuPlannerModal({ isOpen, onClose, onIdeaAdded }: MenuPlannerModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [numDays, setNumDays] = useState(7);
    const [numPeople, setNumPeople] = useState(2);
    const [portionSize, setPortionSize] = useState("Standard");
    const [unitSystem, setUnitSystem] = useState("Metric");
    const [audience, setAudience] = useState("Adults");
    const [dietaryPreference, setDietaryPreference] = useState("None");
    const [cookingSkill, setCookingSkill] = useState("Intermediate");
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
    const [customCuisine, setCustomCuisine] = useState("");
    const [foodStyle, setFoodStyle] = useState("Any");
    const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
    const [addedMeals, setAddedMeals] = useState<Set<number>>(new Set());
    const [isPrivate, setIsPrivate] = useState(false);
    const resultsRef = useRef<HTMLDivElement>(null);

    // New State for enhancements
    const [shoppingList, setShoppingList] = useState<any>(null);
    const [isListLoading, setIsListLoading] = useState(false);
    const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

    const { handleAddToJar, handleFavorite } = useConciergeActions({
        onIdeaAdded,
        onClose,
        setRecommendations: setMealPlans as any
    });

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setMealPlans([]);
            setAddedMeals(new Set());
            setShoppingList(null);
            setCustomCuisine("");
        }
    }, [isOpen]);

    const handleGeneratePlan = async () => {
        setIsLoading(true);
        setMealPlans([]);
        setShoppingList(null);
        setAddedMeals(new Set());

        trackAIToolUsed('menu_planner', {
            numDays,
            numPeople,
            audience,
            dietaryPreference,
            cookingSkill,
            unitSystem
        });

        const finalCuisines = selectedCuisines.filter(c => c !== 'Other');
        if (selectedCuisines.includes('Other') && customCuisine.trim()) {
            finalCuisines.push(customCuisine.trim());
        }

        try {
            const res = await fetch('/api/menu-planner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numDays,
                    numPeople,
                    portionSize,
                    audience,
                    dietaryPreference,
                    cookingSkill,
                    cuisines: finalCuisines,
                    style: foodStyle,
                    unitSystem
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setMealPlans(data.meals || []);
            } else {
                const errorData = await res.json().catch(() => ({}));
                showError(`Error: ${errorData.error || "Failed to generate meal plan."}`);
            }
        } catch (error) {
            console.error(error);
            showError("An error occurred while generating your meal plan.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerateItem = async (index: number) => {
        if (regeneratingIndex !== null) return;
        setRegeneratingIndex(index);

        try {
            const res = await regenerateMeal(mealPlans, index, {
                numPeople,
                audience,
                dietaryPreference,
                style: foodStyle,
                cookingSkill
            });

            if (res.success) {
                const updatedPlans = [...mealPlans];
                // Preserve day label if returned wrong, but trust AI usually
                updatedPlans[index] = { ...res.meal, day: mealPlans[index].day };
                setMealPlans(updatedPlans);
                showSuccess("Meal updated!");
            } else {
                showError(res.error || "Failed to replace meal.");
            }
        } catch (err) {
            showError("Error regenerating meal.");
        } finally {
            setRegeneratingIndex(null);
        }
    };

    const handleGenerateShoppingList = async () => {
        if (mealPlans.length === 0) return;
        setIsListLoading(true);
        try {
            const res = await generateShoppingList(mealPlans, numPeople);
            if (res.success) {
                setShoppingList(res.list);
            } else {
                showError(res.error || "Failed to create shopping list.");
            }
        } catch (err) {
            showError("Error creating shopping list.");
        } finally {
            setIsListLoading(false);
        }
    };

    useEffect(() => {
        if (mealPlans.length > 0 && resultsRef.current && !regeneratingIndex) {
            // Only scroll on initial gen, not single regen
            if (!shoppingList) {
                setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }, [mealPlans]);

    const handleAddMealToJar = async (meal: MealPlan, idx: number) => {
        if (addedMeals.has(idx)) return;

        const ingredientList = meal.ingredients ? `\n\nIngredients: ${meal.ingredients.join(', ')}` : '';
        const instructionList = meal.instructions ? `\n\nQuick Steps:\n${meal.instructions.join('\n')}` : '';

        await handleAddToJar({
            name: `${meal.day}: ${meal.meal}`,
            description: meal.description,
            details: `Prep Time: ${meal.prep_time}\nDifficulty: ${meal.difficulty}${ingredientList}${instructionList}`,
            price: meal.difficulty
        }, "MEAL", isPrivate);

        setAddedMeals(prev => new Set(prev).add(idx));
    };

    const handleSharePlan = async () => {
        if (mealPlans.length === 0) return;

        const header = `🍽️ My ${numDays}-Day Meal Plan\n\n`;
        const meals = mealPlans.map((meal, idx) =>
            `${idx + 1}. ${meal.day}: ${meal.meal}\n   ${meal.description}\n   ⏱️ ${meal.prep_time} | ${meal.difficulty}`
        ).join('\n\n');

        const footer = `\n\n✨ Planned with Spin the Jar\n${window.location.origin}`;
        const shareText = header + meals + footer;

        trackEvent('menu_plan_shared', {
            num_days: numDays,
            meal_count: mealPlans.length
        });

        const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

        if (hasNativeShare) {
            try {
                await navigator.share({
                    title: `My ${numDays}-Day Meal Plan`,
                    text: shareText,
                });
            } catch (err) {
                console.log('Share cancelled or failed:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareText);
                showSuccess('✅ Meal plan copied to clipboard! Paste it anywhere to share.');
            } catch (err) {
                console.error('Failed to copy:', err);
                showError('Could not copy to clipboard. Please try again.');
            }
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
                        className="glass-card w-full max-w-2xl relative max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-500/5 dark:to-emerald-500/5 rounded-t-3xl">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center shadow-inner">
                                    <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Menu Planner</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Weekly meal planning made easy</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-all hover:rotate-90"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            <div className="space-y-4">
                                {/* Number of Days & People */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-green-500" /> Days
                                        </label>
                                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-2 rounded-xl">
                                            <button onClick={() => setNumDays(Math.max(1, numDays - 1))} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg text-slate-600 font-bold">-</button>
                                            <span className="flex-1 text-center font-black text-slate-900 dark:text-white text-xl">{numDays}</span>
                                            <button onClick={() => setNumDays(Math.min(14, numDays + 1))} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg text-slate-600 font-bold">+</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-green-500" /> People
                                        </label>
                                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-2 rounded-xl">
                                            <button onClick={() => setNumPeople(Math.max(1, numPeople - 1))} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg text-slate-600 font-bold">-</button>
                                            <span className="flex-1 text-center font-black text-slate-900 dark:text-white text-xl">{numPeople}</span>
                                            <button onClick={() => setNumPeople(Math.min(20, numPeople + 1))} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg text-slate-600 font-bold">+</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Portion & Audience */}
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Portion Size</label>
                                            <select
                                                value={portionSize}
                                                onChange={(e) => setPortionSize(e.target.value)}
                                                className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-2.5 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                <option value="Light">Light / Small</option>
                                                <option value="Standard">Standard</option>
                                                <option value="Generous">Generous / Leftovers</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Units</label>
                                            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                                                {['Metric', 'Imperial'].map((unit) => (
                                                    <button
                                                        key={unit}
                                                        onClick={() => setUnitSystem(unit)}
                                                        className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${unitSystem === unit
                                                            ? 'bg-white dark:bg-white/10 shadow-sm text-green-600'
                                                            : 'text-slate-500'
                                                            }`}
                                                    >
                                                        {unit}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Audience</label>
                                        <select
                                            value={audience}
                                            onChange={(e) => setAudience(e.target.value)}
                                            className="w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-2.5 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="Adults">Adults Only</option>
                                            <option value="Kids">Kid Friendly</option>
                                            <option value="Mixed">Mixed / Family</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Dietary Preference */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Dietary Preference</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo'].map((pref) => (
                                            <button
                                                key={pref}
                                                onClick={() => setDietaryPreference(pref)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${dietaryPreference === pref
                                                    ? 'bg-green-500 text-white shadow-lg'
                                                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                {pref}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Cuisines */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Preferred Cuisines</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'Indian', 'French', 'Other'].map((cuisine) => {
                                            const isSelected = selectedCuisines.includes(cuisine);
                                            return (
                                                <button
                                                    key={cuisine}
                                                    onClick={() => setSelectedCuisines(prev =>
                                                        isSelected ? prev.filter(c => c !== cuisine) : [...prev, cuisine]
                                                    )}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isSelected
                                                        ? 'bg-green-500 text-white shadow-md'
                                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                                        }`}
                                                >
                                                    {cuisine}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {selectedCuisines.includes('Other') && (
                                        <motion.input
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            type="text"
                                            placeholder="Specify other cuisines (e.g. Thai, Greek)..."
                                            value={customCuisine}
                                            onChange={(e) => setCustomCuisine(e.target.value)}
                                            className="w-full px-4 py-2 mt-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-green-500 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400"
                                        />
                                    )}
                                </div>

                                {/* Food Style */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Food Style / Goal</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Any', 'Healthy', 'Quick (<30m)', 'Comfort', 'Budget', 'Gourmet'].map((style) => (
                                            <button
                                                key={style}
                                                onClick={() => setFoodStyle(style)}
                                                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${foodStyle === style
                                                    ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 ring-2 ring-green-500 ring-inset'
                                                    : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Cooking Skill */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Cooking Skill Level</label>
                                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                                        {['Beginner', 'Intermediate', 'Advanced'].map((skill) => (
                                            <button
                                                key={skill}
                                                onClick={() => setCookingSkill(skill)}
                                                className={`flex-1 py-2 text-sm font-black rounded-lg transition-all ${cookingSkill === skill
                                                    ? 'bg-white dark:bg-white/10 shadow-sm text-green-600 scale-105'
                                                    : 'text-slate-500'
                                                    }`}
                                            >
                                                {skill}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleGeneratePlan}
                                disabled={isLoading}
                                className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-[1.02] transition-all text-white font-black text-lg shadow-xl rounded-2xl"
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Generating Plan...</>
                                ) : (
                                    <><Sparkles className="w-5 h-5 mr-2" /> Generate Meal Plan</>
                                )}
                            </Button>

                            {/* Results */}
                            {mealPlans.length > 0 && (
                                <div ref={resultsRef} className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your {numDays}-Day Plan</h3>
                                        <button
                                            onClick={() => setIsPrivate(!isPrivate)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isPrivate ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500'}`}
                                        >
                                            <Lock className="w-3.5 h-3.5" />
                                            {isPrivate ? "Secret Mode On" : "Public Mode"}
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {mealPlans.map((meal, idx) => (
                                            <div key={idx} className="bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors relative group">
                                                {/* Action Buttons: Refresh & Favorite */}
                                                <div className="absolute top-3 right-3 flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const rec = {
                                                                name: meal.meal,
                                                                description: meal.description,
                                                                isFavorite: (meal as any).isFavorite
                                                            };
                                                            handleFavorite(rec, "MEAL");
                                                        }}
                                                        className={`p-1.5 rounded-full transition-all ${(meal as any).isFavorite
                                                            ? "text-pink-500 bg-pink-500/10"
                                                            : "text-slate-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                                                            }`}
                                                        title="Add to Favorites"
                                                    >
                                                        <Heart className={`w-4 h-4 ${(meal as any).isFavorite ? "fill-current" : ""}`} />
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRegenerateItem(idx);
                                                        }}
                                                        disabled={regeneratingIndex === idx}
                                                        className="p-1.5 text-slate-400 hover:text-green-600 dark:text-slate-500 dark:hover:text-green-400 bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-all"
                                                        title="Regenerate this meal"
                                                    >
                                                        <RefreshCw className={`w-4 h-4 ${regeneratingIndex === idx ? "animate-spin text-green-500" : ""}`} />
                                                    </button>
                                                </div>

                                                <div className="flex justify-between items-start mb-4 pr-8">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-bold px-2 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 rounded-full">{meal.day}</span>
                                                            <span className="text-xs text-slate-400">{meal.difficulty}</span>
                                                        </div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{meal.meal}</h4>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{meal.description}</p>
                                                        <p className="text-xs text-slate-400 mt-2">⏱️ {meal.prep_time}</p>
                                                    </div>
                                                </div>

                                                {/* Ingredients & Instructions (Simple View) */}
                                                {(meal.ingredients || meal.instructions) && (
                                                    <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                                        {meal.ingredients && (
                                                            <div>
                                                                <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5"><ChefHat className="w-3 h-3" /> Ingredients</h5>
                                                                <ul className="space-y-1">
                                                                    {meal.ingredients.slice(0, 5).map((ing, i) => (
                                                                        <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                                                                            <span className="w-1 h-1 bg-green-400 rounded-full mt-1.5 shrink-0" />
                                                                            <span className="leading-tight">{ing}</span>
                                                                        </li>
                                                                    ))}
                                                                    {meal.ingredients.length > 5 && (
                                                                        <li className="text-[10px] text-slate-400 italic pl-2.5">+ {meal.ingredients.length - 5} more...</li>
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {meal.instructions && (
                                                            <div>
                                                                <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5"><ClipboardList className="w-3 h-3" /> Quick Steps</h5>
                                                                <ol className="space-y-1.5">
                                                                    {meal.instructions.slice(0, 3).map((step, i) => (
                                                                        <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                                                                            <span className="font-bold text-slate-400 shrink-0 text-[10px] mt-0.5">{i + 1}.</span>
                                                                            <span className="leading-tight">{step}</span>
                                                                        </li>
                                                                    ))}
                                                                </ol>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <Button
                                                    size="sm"
                                                    variant={addedMeals.has(idx) ? "ghost" : "secondary"}
                                                    className={`w-full mt-3 text-xs ${addedMeals.has(idx) ? "text-green-600 dark:text-green-400" : ""}`}
                                                    onClick={() => handleAddMealToJar(meal, idx)}
                                                    disabled={addedMeals.has(idx)}
                                                >
                                                    {addedMeals.has(idx) ? (
                                                        <><Check className="w-3 h-3 mr-1" /> Added</>
                                                    ) : (
                                                        <><Plus className="w-3 h-3 mr-1" /> Add to Jar</>
                                                    )}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-2 pt-4">
                                        <Button
                                            onClick={handleGenerateShoppingList}
                                            disabled={isListLoading}
                                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                        >
                                            {isListLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
                                            Create Shopping List
                                        </Button>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleSharePlan}
                                                variant="outline"
                                                className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
                                            >
                                                <Share2 className="w-4 h-4 mr-2" />
                                                Share
                                            </Button>
                                            <Button
                                                onClick={handleGeneratePlan}
                                                variant="secondary"
                                                className="flex-1"
                                            >
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Regenerate All
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <ShoppingListModal
                        isOpen={!!shoppingList}
                        onClose={() => setShoppingList(null)}
                        list={shoppingList}
                    />
                </div>
            )}
        </AnimatePresence>
    );
}
