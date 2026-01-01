import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Sparkles, Calendar, MapPin, Loader2, ExternalLink, Plus, Check, ArrowRight, X, Heart, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { getCurrentLocation } from "@/lib/utils";

interface Suggestion {
    title: string;
    description: string;
    day: string;
    cost: string;
    url?: string;
    isFavorite?: boolean;
}

interface WeekendPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: string;
    onIdeaAdded?: () => void;
    onFavoriteUpdated?: () => void;
}

export function WeekendPlannerModal({ isOpen, onClose, userLocation, onIdeaAdded, onFavoriteUpdated }: WeekendPlannerModalProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<string | null>(null);
    const [addedIdeas, setAddedIdeas] = useState<Set<number>>(new Set());
    const [isPrivate, setIsPrivate] = useState(true);

    // New state for location override
    const [customLocation, setCustomLocation] = useState(userLocation || "");
    const [hasGenerated, setHasGenerated] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset state on open
            setCustomLocation(userLocation || "");
            setHasGenerated(false);
            setSuggestions([]);
            setAddedIdeas(new Set());
            setError(null);
            setIsPrivate(true);
        }
    }, [isOpen, userLocation]);

    const [addingId, setAddingId] = useState<number | null>(null);

    const generatePlan = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setError(null);
        setDebugInfo(null);
        setAddedIdeas(new Set()); // Reset added ideas on new generation
        try {
            const res = await fetch('/api/ai/weekend-planner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location: customLocation })
            });
            const data = await res.json();

            if (res.ok) {
                setSuggestions(data.suggestions);
                setHasGenerated(true);
                if (data.debugInfo) {
                    setDebugInfo(data.debugInfo);
                }
            } else {
                setError(data.details ? `${data.error}: ${data.details}` : (data.error || "Failed to generate plan"));
            }
        } catch (err: any) {
            console.error("Planner error:", err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToJar = async (item: Suggestion) => {
        const idx = suggestions.indexOf(item);
        if (addedIdeas.has(idx)) return; // Prevent double add

        setAddingId(idx);

        // Normalize cost
        let cost = "$";
        const lowerCost = item.cost.toLowerCase();
        if (lowerCost.includes("free")) cost = "FREE";
        else if (lowerCost.includes("$$$")) cost = "$$$";
        else if (lowerCost.includes("$$")) cost = "$$";

        try {
            const res = await fetch('/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: item.title,
                    details: item.description + (item.url ? `\n\nMore info: ${item.url}` : ""),
                    indoor: false, // Default to outdoor for weekend plans usually
                    duration: 2.0,
                    activityLevel: "MEDIUM",
                    cost: cost,
                    timeOfDay: "ANY",
                    category: "ACTIVITY",
                    isPrivate: isPrivate
                }),
            });

            if (res.ok) {
                setAddedIdeas(prev => new Set(prev).add(idx));
                if (onIdeaAdded) onIdeaAdded();
            } else {
                alert("Failed to add to jar");
            }
        } catch (e) {
            console.error("Error adding to jar:", e);
            alert("Error adding to jar");
        } finally {
            setAddingId(null);
        }
    };

    const handleFavorite = async (item: Suggestion) => {
        try {
            if (item.isFavorite) {
                const res = await fetch(`/api/favorites?name=${encodeURIComponent(item.title)}`, {
                    method: 'DELETE',
                });
                if (res.ok) {
                    setSuggestions(prev => prev.map(s =>
                        s.title === item.title ? { ...s, isFavorite: false } : s
                    ));
                    if (onFavoriteUpdated) onFavoriteUpdated();
                } else {
                    alert("Failed to remove favorite");
                }
            } else {
                const res = await fetch('/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: item.title,
                        description: item.description,
                        address: customLocation,
                        googleRating: 0,
                        websiteUrl: item.url,
                        type: "THEATRE"
                    }),
                });

                if (res.ok) {
                    setSuggestions(prev => prev.map(s =>
                        s.title === item.title ? { ...s, isFavorite: true } : s
                    ));
                    if (onFavoriteUpdated) onFavoriteUpdated();
                } else {
                    alert("Failed to add favorite");
                }
            }
        } catch (e) {
            console.error("Error updating favorite:", e);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-h-[80vh] overflow-y-auto isolate pb-32 md:pb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-4 w-8 h-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 z-50"
                    onClick={onClose}
                >
                    <X className="w-4 h-4" />
                </Button>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-slate-900 dark:text-white">
                        <Sparkles className="w-5 h-5 text-secondary" />
                        Weekend Events
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {!hasGenerated && !isLoading ? (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center mr-1">
                                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-1">Where are you this weekend?</label>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                const currentLoc = await getCurrentLocation();
                                                setCustomLocation(currentLoc);
                                            } catch (err) {
                                                alert("Could not get location. Please check permissions.");
                                            }
                                        }}
                                        className="text-[10px] uppercase tracking-wider font-bold text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1"
                                    >
                                        <MapPin className="w-3 h-3" />
                                        Use GPS
                                    </button>
                                </div>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="text"
                                        value={customLocation}
                                        onChange={(e) => setCustomLocation(e.target.value)}
                                        placeholder="City, Neighborhood, or Zip"
                                        className="pl-10"
                                        onKeyDown={(e) => e.key === 'Enter' && generatePlan()}
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-slate-500 ml-1">We'll look for events and activities near here.</p>
                            </div>

                            <Button
                                onClick={generatePlan}
                                className="w-full h-12 text-lg font-bold bg-secondary hover:bg-secondary/90 text-white shadow-lg shadow-purple-900/20"
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                Plan My Weekend
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Result View */}
                            <div className="flex items-center justify-between bg-slate-100 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10 mb-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <MapPin className="w-4 h-4 text-secondary" />
                                    <span>Near: <span className="text-slate-900 dark:text-white font-medium">{customLocation || "Your area"}</span></span>
                                </div>
                                <Button size="sm" variant="ghost" className="h-6 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white" onClick={() => setHasGenerated(false)}>
                                    Change
                                </Button>
                            </div>

                            {debugInfo && (
                                <div className="text-xs text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20 mb-4">
                                    <p className="font-bold mb-1 flex items-center gap-2">
                                        <Loader2 className="w-3 h-3" />
                                        Offline Mode Enabled
                                    </p>
                                    <p className="opacity-90 leading-relaxed">
                                        {debugInfo.includes("429") || debugInfo.includes("quota")
                                            ? "We're experiencing unusually high traffic with our AI provider. Please wait a moment and try again, or use these offline suggestions."
                                            : "We couldn't connect to the AI service right now. Showing generic suggestions instead."}
                                    </p>
                                </div>
                            )}

                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <Loader2 className="w-10 h-10 text-secondary animate-spin" />
                                    <p className="text-slate-400 animate-pulse">Consulting the oracle...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8">
                                    <p className="text-red-400 mb-4">{error}</p>
                                    <Button onClick={generatePlan} variant="outline">Try Again</Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Weekend Picks</h3>
                                        <button
                                            onClick={() => setIsPrivate(!isPrivate)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isPrivate ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500'}`}
                                        >
                                            <Lock className="w-3.5 h-3.5" />
                                            {isPrivate ? "Secret Mode On" : "Public Mode"}
                                        </button>
                                    </div>
                                    {suggestions.map((item, idx) => (
                                        <div key={idx} className="bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-sm dark:shadow-none relative">
                                            <div className="flex justify-between items-start mb-2 pr-14">
                                                <h3 className="font-bold text-lg text-secondary leading-tight">{item.title}</h3>
                                                <span className="text-xs font-mono bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 shrink-0 ml-2 mt-0.5">{item.day}</span>
                                            </div>
                                            <button
                                                onClick={() => handleFavorite(item)}
                                                className={`absolute top-4 right-4 p-2 rounded-full transition-all ${item.isFavorite ? 'text-pink-500 bg-pink-500/10' : 'text-slate-400 hover:text-pink-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                                            >
                                                <Heart className={`w-5 h-5 ${item.isFavorite ? 'fill-current' : ''}`} />
                                            </button>
                                            <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 leading-relaxed mt-6">{item.description}</p>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-3">
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-700">{item.cost}</span>
                                                </div>
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <Button
                                                        size="sm"
                                                        variant={addedIdeas.has(idx) ? "ghost" : "secondary"}
                                                        className={`flex-1 sm:flex-none text-xs h-8 ${addedIdeas.has(idx) ? "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-400/10" : ""}`}
                                                        onClick={() => handleAddToJar(item)}
                                                        disabled={addingId === idx || addedIdeas.has(idx)}
                                                    >
                                                        {addingId === idx ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : addedIdeas.has(idx) ? (
                                                            <>
                                                                <Check className="w-3 h-3 mr-1.5" /> Added
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Plus className="w-3 h-3 mr-1.5" /> Add
                                                            </>
                                                        )}
                                                    </Button>
                                                    {item.url && (
                                                        <a
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs font-medium text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 flex-1 sm:flex-none h-8 shadow-sm"
                                                        >
                                                            Info <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                    {!isLoading && !error && hasGenerated && (
                        <Button onClick={generatePlan} variant="secondary">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Regenerate
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
