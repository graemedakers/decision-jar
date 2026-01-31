import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Sparkles, X, ExternalLink, Home, Trees, Clock, DollarSign, Activity, Car, Lock, Sun, CloudRain, Snowflake } from "lucide-react";
import { COST_LEVELS, ACTIVITY_LEVELS, TIME_OF_DAY, WEATHER_TYPES } from "@/lib/constants";
import { IdeaFormRenderer } from "@/components/idea-forms/IdeaFormRenderer";
import { suggestIdeaType, getStandardizedData } from "@/lib/idea-standardizer";
import { TOPIC_CATEGORIES } from "@/lib/categories";
import { UserData, Idea } from "@/lib/types";

interface AddIdeaFormProps {
    formData: any;
    setFormData: (updater: (prev: any) => any) => void;
    handleSubmitWithTracking: (e: React.FormEvent) => Promise<void>;
    categories: any[];
    jarTopic?: string | null;
    currentUser?: UserData | null;
    initialData?: Idea | Partial<Idea> | null;
}

export function AddIdeaForm({
    formData,
    setFormData,
    handleSubmitWithTracking,
    categories,
    jarTopic,
    currentUser,
    initialData
}: AddIdeaFormProps) {
    const isLocked = !!initialData?.id && (!currentUser || initialData.createdById !== currentUser.id);

    return (
        <form id="add-idea-form" onSubmit={handleSubmitWithTracking} className="space-y-6">
            <fieldset disabled={isLocked} className="space-y-6 disabled:opacity-80 min-w-0">
                <div className="space-y-2 min-w-0">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Idea Type (Optional)</label>
                    <div className="flex gap-2">
                        <select
                            value={formData.ideaType || ""}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, ideaType: e.target.value || undefined, typeData: undefined }))}
                            className="glass-input flex-1 text-slate-800 dark:text-white"
                        >
                            <option value="">Standard (No specific type)</option>
                            <option value="simple">Simple (Quote, Joke, Note)</option>
                            <option value="dining">Dining / Bar</option>
                            <option value="recipe">Recipe</option>
                            <option value="book">Book</option>
                            <option value="movie">Movie</option>
                            <option value="music">Music</option>
                            <option value="game">Game</option>
                            <option value="activity">Activity</option>
                            <option value="event">Event/Show</option>
                            <option value="travel">Travel/Stay</option>
                            <option value="itinerary">Itinerary</option>
                        </select>

                        {!formData.ideaType && suggestIdeaType(formData) && (
                            <button
                                type="button"
                                onClick={() => {
                                    const suggested = suggestIdeaType(formData);
                                    const data = getStandardizedData(formData);
                                    if (suggested) {
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            ideaType: suggested,
                                            typeData: data || undefined
                                        }));
                                    }
                                }}
                                className="px-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all animate-pulse"
                                title={`Standardize as ${suggestIdeaType(formData)}`}
                            >
                                <Sparkles className="w-4 h-4" />
                                Standardize
                            </button>
                        )}
                    </div>
                </div>

                {formData.ideaType && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <IdeaFormRenderer
                            ideaType={formData.ideaType}
                            typeData={formData.typeData}
                            onChange={(data) => {
                                // Prevent infinite loops
                                if (JSON.stringify(data) !== JSON.stringify(formData.typeData)) {
                                    setFormData((prev: any) => ({ ...prev, typeData: data }));
                                }
                            }}
                        />
                    </div>
                )}

                <div className="space-y-2 min-w-0">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Category</label>
                    <div className="bg-slate-200/50 dark:bg-black/20 rounded-xl p-1 border border-slate-200 dark:border-white/10 overflow-hidden w-full">
                        <div className="flex overflow-x-auto no-scrollbar gap-1 p-0.5 w-full">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setFormData((prev: any) => ({ ...prev, category: cat.id }))}
                                    className={`flex items-center justify-center gap-2 py-2 px-5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap min-w-fit flex-shrink-0 ${formData.category === cat.id
                                        ? "bg-primary text-white shadow-md scale-[1.02]"
                                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <cat.icon className="w-4 h-4" /> {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-2 min-w-0">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                        {formData.category === 'MEAL' || formData.category === 'RESTAURANT' ? "Name of place" : "Short Description"}
                    </label>
                    <Input
                        id="description-input"
                        value={formData.description}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                        placeholder={categories.find(c => c.id === formData.category)?.placeholder || "e.g. Build a blanket fort"}
                        className="w-full"
                        required
                        aria-label="Description"
                    />
                </div>

                <div className="space-y-2 min-w-0">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Photo URL (Optional)</label>
                    <Input
                        value={formData.photoUrls?.[0] || ""}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, photoUrls: e.target.value ? [e.target.value] : [] }))}
                        placeholder="https://example.com/image.jpg"
                        className="w-full font-mono text-xs"
                    />

                    {formData.photoUrls?.[0] && (
                        <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 mt-2">
                            <img
                                src={formData.photoUrls[0]}
                                alt="Preview"
                                className="w-full h-48 object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                        const errorDiv = document.createElement('div');
                                        errorDiv.className = 'w-full h-48 flex items-center justify-center text-slate-400 text-sm';
                                        errorDiv.textContent = 'Failed to load image';
                                        parent.appendChild(errorDiv);
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setFormData((prev: any) => ({ ...prev, photoUrls: [] }))}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                title="Remove image"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-2 min-w-0">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Suggested By (Optional)</label>
                    <Input
                        value={formData.suggestedBy}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, suggestedBy: e.target.value }))}
                        placeholder="e.g. Billy, Sarah (Leave blank for You)"
                        className="w-full"
                    />
                </div>
            </fieldset>

            <div className="space-y-2 min-w-0">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Details (Optional)</label>
                    {formData.details.match(/https?:\/\/[^\s]+/) && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 px-2"
                            onClick={() => {
                                const match = formData.details.match(/https?:\/\/[^\s]+/);
                                if (match) window.open(match[0], '_blank');
                            }}
                        >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Visit Website
                        </Button>
                    )}
                </div>
                <textarea
                    disabled={isLocked}
                    value={formData.details}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, details: e.target.value }))}
                    placeholder={
                        (() => {
                            const topicKey = jarTopic ? Object.keys(TOPIC_CATEGORIES).find(k => k.toLowerCase() === jarTopic.toLowerCase()) : "Activities";
                            switch (topicKey) {
                                case "Movies": return "e.g. Streaming platform, release year, or cinema location...";
                                case "Restaurants": return "e.g. Reservation time, dress code, or parking info...";
                                case "Travel": return "e.g. Flight numbers, hotel confirmation, or packing list...";
                                case "Wellness": return "e.g. What to wear, arrival time...";
                                default: return "Add more info, e.g. what to bring, specific location...";
                            }
                        })()
                    }
                    className="glass-input w-full min-h-[100px] py-2 px-3 resize-none text-slate-800 dark:text-white placeholder:text-slate-400 disabled:opacity-80"
                    aria-label="Details"
                />
            </div>

            <fieldset disabled={isLocked} className="space-y-6 disabled:opacity-80 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 min-w-0">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Setting</label>
                        <div className="flex bg-slate-200/50 dark:bg-black/20 rounded-xl p-1 border border-slate-200 dark:border-white/10">
                            <button
                                type="button"
                                onClick={() => setFormData((prev: any) => ({ ...prev, indoor: true }))}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${formData.indoor
                                    ? "bg-primary text-white shadow-lg"
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                                    }`}
                                aria-label="Indoor Setting"
                            >
                                <Home className="w-4 h-4" /> Indoor
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData((prev: any) => ({ ...prev, indoor: false }))}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${!formData.indoor
                                    ? "bg-primary text-white shadow-lg"
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                                    }`}
                                aria-label="Outdoor Setting"
                            >
                                <Trees className="w-4 h-4" /> Outdoor
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 min-w-0">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Duration</label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={formData.duration}
                                onChange={(e) => setFormData((prev: any) => ({ ...prev, duration: e.target.value }))}
                                className="glass-input pl-10 cursor-pointer w-full text-slate-800 dark:text-white"
                                aria-label="Duration"
                            >
                                <option value="0.25">15 mins</option>
                                <option value="0.5">30 mins</option>
                                <option value="1.0">1 hour</option>
                                <option value="2.0">2 hours</option>
                                <option value="4.0">Half Day</option>
                                <option value="8.0">Full Day</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 min-w-0">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Cost</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={formData.cost}
                                onChange={(e) => setFormData((prev: any) => ({ ...prev, cost: e.target.value }))}
                                className="glass-input pl-10 cursor-pointer w-full text-slate-800 dark:text-white"
                                aria-label="Cost"
                            >
                                {COST_LEVELS.map(level => (
                                    <option key={level.id} value={level.id}>{level.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 min-w-0">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Energy</label>
                        <div className="relative">
                            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={formData.activityLevel}
                                onChange={(e) => setFormData((prev: any) => ({ ...prev, activityLevel: e.target.value }))}
                                className="glass-input pl-10 cursor-pointer w-full text-slate-800 dark:text-white"
                                aria-label="Energy Level"
                            >
                                {ACTIVITY_LEVELS.map(level => (
                                    <option key={level.id} value={level.id}>{level.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 min-w-0">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Time of Day</label>
                    <div className="flex bg-slate-200/50 dark:bg-black/20 rounded-xl p-1 border border-slate-200 dark:border-white/10">
                        {TIME_OF_DAY.map((time) => (
                            <button
                                key={time.id}
                                type="button"
                                onClick={() => setFormData((prev: any) => ({ ...prev, timeOfDay: time.id }))}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.timeOfDay === time.id
                                    ? "bg-secondary text-white shadow-lg"
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                                    }`}
                                aria-label={`Time of Day: ${time.label}`}
                            >
                                {time.label}
                            </button>
                        ))}
                    </div>
                </div>
            </fieldset>

            <div className="space-y-4 pb-4">
                <div className="p-4 bg-slate-200/50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4">
                    <div className="flex items-start justify-between group cursor-pointer"
                        onClick={() => setFormData((prev: any) => ({ ...prev, requiresTravel: !prev.requiresTravel }))}
                        role="button"
                        tabIndex={0}
                        aria-pressed={formData.requiresTravel}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFormData((prev: any) => ({ ...prev, requiresTravel: !prev.requiresTravel })) }}
                    >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${formData.requiresTravel ? 'bg-blue-500 text-white' : 'bg-slate-300 dark:bg-white/5 text-slate-400'}`}>
                                <Car className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 pt-0.5">
                                <p className="font-bold text-slate-900 dark:text-white leading-tight">Requires Traveling?</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">e.g. driving/trip (This is an "Outing")</p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 shrink-0 ml-3 rounded-full relative transition-colors ${formData.requiresTravel ? 'bg-blue-500' : 'bg-slate-300 dark:bg-white/10'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.requiresTravel ? 'left-7' : 'left-1'}`} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Weather Vibe</label>
                        <div className="grid grid-cols-4 gap-1">
                            {WEATHER_TYPES.map((w) => {
                                const Icon = w.id === 'ANY' ? Sparkles : w.id === 'SUNNY' ? Sun : w.id === 'RAINY' ? CloudRain : Snowflake;
                                return (
                                    <button
                                        key={w.id}
                                        type="button"
                                        onClick={() => setFormData((prev: any) => ({ ...prev, weather: w.id }))}
                                        className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${formData.weather === w.id
                                            ? "bg-amber-500 text-white border-amber-400 shadow-md"
                                            : "bg-white/30 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400 hover:bg-white/10"
                                            }`}
                                        aria-label={`Weather: ${w.label}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {w.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex items-start justify-between p-4 bg-slate-200/50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 group cursor-pointer transition-all hover:bg-slate-200 dark:hover:bg-black/30"
                    onClick={() => setFormData((prev: any) => ({ ...prev, isPrivate: !prev.isPrivate }))}
                    role="button"
                    tabIndex={0}
                    aria-pressed={formData.isPrivate}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setFormData((prev: any) => ({ ...prev, isPrivate: !prev.isPrivate })) }}
                >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${formData.isPrivate ? 'bg-amber-500 text-white' : 'bg-slate-300 dark:bg-white/5 text-slate-400'}`}>
                            <Lock className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 pt-0.5">
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">Keep it a secret?</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Other users won't see this until it's selected.</p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 shrink-0 ml-3 rounded-full relative transition-colors ${formData.isPrivate ? 'bg-amber-500' : 'bg-slate-300 dark:bg-white/10'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isPrivate ? 'left-7' : 'left-1'}`} />
                    </div>
                </div>
            </div>
        </form>
    );
}
