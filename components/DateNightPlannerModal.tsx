import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Sparkles, MapPin, Loader2, ExternalLink, Calendar, DollarSign, Wine, Utensils, Ticket, Clock, Check, Plus, RefreshCcw, Pencil, X, Save, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { LocationInput } from "./LocationInput";

interface ScheduleItem {
    time: string;
    activity_type: string;
    venue_name: string;
    description: string;
    address: string;
    booking_link: string;
    cost_estimate: string;
}

interface Itinerary {
    neighborhood: string;
    schedule: ScheduleItem[];
}

interface DateNightPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: string;
    onIdeaAdded?: () => void;
    jarTopic?: string | null;
}

export function DateNightPlannerModal({ isOpen, onClose, userLocation, onIdeaAdded, jarTopic }: DateNightPlannerModalProps) {
    // Inputs
    const [targetLocation, setTargetLocation] = useState(userLocation || "");
    const [targetDate, setTargetDate] = useState("");
    const [targetCost, setTargetCost] = useState("Medium");
    const [isPrivate, setIsPrivate] = useState(true);

    // Dynamic Text based on Topic
    const isDateContext = jarTopic === 'Dates' || jarTopic === 'Romantic';
    const titleText = isDateContext ? "Date Night Planner" : `${jarTopic && jarTopic !== 'General' && jarTopic !== 'Activities' ? jarTopic : "Activity"} Planner`;
    const buttonText = isDateContext ? "Plan My Date Night" : "Plan My Activity";
    const resultTitle = isDateContext ? "Date Night" : "Itinerary";
    const loadingText = isDateContext ? "Curating the perfect evening..." : `Curating the perfect ${jarTopic && jarTopic !== 'General' ? jarTopic.toLowerCase() : "activity"} plan...`;

    // State
    const [itinerary, setItinerary] = useState<Itinerary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isStandardizing, setIsStandardizing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<ScheduleItem | null>(null);

    // Sync user location if it loads late
    useEffect(() => {
        if (userLocation && !targetLocation) {
            setTargetLocation(userLocation);
        }
    }, [userLocation]);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setItinerary(null);
            setError(null);
            setIsAdded(false);
            setRegeneratingIndex(null);
            setEditingIndex(null);
            setEditForm(null);
            setIsPrivate(true);
        }
    }, [isOpen]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setItinerary(null);
        setIsAdded(false);
        setEditingIndex(null);
        setEditForm(null);

        try {
            const res = await fetch('/api/date-night-planner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location: targetLocation,
                    date: targetDate, // e.g. "This Friday"
                    cost: targetCost,
                    topic: jarTopic // Pass topic to API if it supports it (it currently ignores it but good for future)
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to generate plan");
            }

            const data = await res.json();
            setItinerary(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerateItem = async (index: number) => {
        if (!itinerary) return;
        setRegeneratingIndex(index);

        try {
            const res = await fetch('/api/date-night-planner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location: targetLocation,
                    date: targetDate, // e.g. "This Friday"
                    cost: targetCost,
                    regenerateSlot: index,
                    currentSchedule: itinerary.schedule,
                    rejectedVenue: itinerary.schedule[index].venue_name,
                    topic: jarTopic
                }),
            });

            if (!res.ok) throw new Error("Failed to find alternative");

            const newItem: ScheduleItem = await res.json();

            // Update the schedule with the new item
            const newSchedule = [...itinerary.schedule];
            newSchedule[index] = newItem;
            setItinerary({
                ...itinerary,
                schedule: newSchedule
            });

        } catch (e) {
            console.error("Regenerate item error:", e);
            alert("Failed to find an alternative. Try again.");
        } finally {
            setRegeneratingIndex(null);
        }
    };

    const handleEditItem = (index: number) => {
        if (!itinerary) return;
        setEditingIndex(index);
        setEditForm({ ...itinerary.schedule[index] });
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditForm(null);
    };

    const handleSaveEdit = () => {
        if (!itinerary || editingIndex === null || !editForm) return;
        const newSchedule = [...itinerary.schedule];
        newSchedule[editingIndex] = editForm;
        setItinerary({ ...itinerary, schedule: newSchedule });
        setEditingIndex(null);
        setEditForm(null);
    };

    const handleAddToJar = async () => {
        if (!itinerary) return;
        setIsAdding(true);

        try {
            // Store structured data for rich rendering
            const detailsJson = JSON.stringify({
                type: 'ITINERARY',
                neighborhood: itinerary.neighborhood,
                schedule: itinerary.schedule
            });

            const description = `${resultTitle} in ${itinerary.neighborhood}`;

            const res = await fetch('/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: description,
                    details: detailsJson,
                    indoor: true, // Mixed usually
                    duration: 4.0, // Whole evening
                    activityLevel: "MEDIUM",
                    cost: targetCost === "Low" ? "$" : targetCost === "High" ? "$$$" : "$$",
                    timeOfDay: "EVENING",
                    category: isDateContext ? "PLANNED_DATE" : "ACTIVITY",
                    notes: targetDate ? `Planned for: ${targetDate}` : undefined,
                    isPrivate: isPrivate
                }),
            });

            if (res.ok) {
                setIsAdded(true);
                if (onIdeaAdded) onIdeaAdded();
            } else {
                alert("Failed to add to jar");
            }
        } catch (e) {
            console.error("Error adding to jar:", e);
            alert("Error adding to jar");
        } finally {
            setIsAdding(false);
        }
    };

    const isReady = targetLocation.length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto isolate pb-32 md:pb-6">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0">
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Sparkles className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                        <span className="bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">{titleText}</span>
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full h-10 w-10 p-0"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Inputs */}
                    {!itinerary && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-slate-600 dark:text-slate-400 font-medium">When?</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 [color-scheme:light] dark:[color-scheme:dark]"
                                        value={targetDate}
                                        onChange={(e) => setTargetDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-600 dark:text-slate-400 font-medium">Where?</label>
                                <LocationInput
                                    value={targetLocation}
                                    onChange={setTargetLocation}
                                    placeholder="City or Neighborhood"
                                    isStandardizing={isStandardizing}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm text-slate-600 dark:text-slate-400 font-medium">Budget</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["Low", "Medium", "High"].map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setTargetCost(c)}
                                            className={`py-2 rounded-lg border text-sm font-medium transition-all ${targetCost === c
                                                ? "bg-pink-100 dark:bg-pink-500/20 border-pink-500/50 text-pink-700 dark:text-white"
                                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Generate Button (if not generated) */}
                    {!itinerary && !isLoading && (
                        <Button
                            onClick={handleGenerate}
                            disabled={!isReady}
                            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-6 rounded-xl shadow-lg shadow-pink-900/20 transition-all transform hover:scale-[1.01]"
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            {buttonText}
                        </Button>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full animate-pulse" />
                                <Loader2 className="w-12 h-12 text-pink-400 animate-spin relative z-10" />
                            </div>
                            <p className="text-slate-400 animate-pulse font-medium">{loadingText}</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="text-center py-4 px-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-red-400 text-sm mb-3">{error}</p>
                            <Button onClick={() => setError(null)} variant="outline" size="sm" className="border-red-500/30 text-red-300 hover:bg-red-500/10">Try Again</Button>
                        </div>
                    )}

                    {/* Itinerary Result */}
                    {itinerary && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white">Date Night in {itinerary.neighborhood}</h3>
                                <div className="flex justify-center gap-4 mt-2 text-sm text-slate-400">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {targetDate || "Upcoming"}</span>
                                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {targetCost} Cost</span>
                                </div>
                            </div>

                            {/* Full Route Map Button */}
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(itinerary.schedule[0].venue_name + " " + itinerary.schedule[0].address)}&destination=${encodeURIComponent(itinerary.schedule[2].venue_name + " " + itinerary.schedule[2].address)}&waypoints=${encodeURIComponent(itinerary.schedule[1].venue_name + " " + itinerary.schedule[1].address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 bg-blue-100 dark:bg-blue-500/10 hover:bg-blue-200 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 border border-blue-200 dark:border-blue-500/20 rounded-xl text-center font-medium transition-colors flex items-center justify-center gap-2 mb-6"
                            >
                                <MapPin className="w-4 h-4" /> View Full Route on Map
                            </a>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Your Itinerary</h4>
                                    <button
                                        onClick={() => setIsPrivate(!isPrivate)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isPrivate ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500'}`}
                                    >
                                        <Lock className="w-3.5 h-3.5" />
                                        {isPrivate ? "Secret Mode On" : "Public Mode"}
                                    </button>
                                </div>

                                <div className="relative border-l-2 border-slate-700 ml-4 space-y-8 pl-8 py-2">
                                    {itinerary.schedule.map((item, idx) => {
                                        const activityType = item.activity_type || "";
                                        let Icon = Clock;
                                        if (activityType.toLowerCase().includes("drink")) Icon = Wine;
                                        if (activityType.toLowerCase().includes("dinner") || activityType.toLowerCase().includes("food")) Icon = Utensils;
                                        if (activityType.toLowerCase().includes("event") || activityType.toLowerCase().includes("show")) Icon = Ticket;

                                        const isRegenerating = regeneratingIndex === idx;
                                        const isEditing = editingIndex === idx;

                                        return (
                                            <div key={idx} className="relative">
                                                {/* Timeline Dot */}
                                                <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-pink-500 flex items-center justify-center z-10">
                                                    <div className="w-2 h-2 rounded-full bg-pink-500" />
                                                </div>

                                                <div className={`bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl transition-colors group ${isEditing ? 'bg-slate-50 dark:bg-slate-800 border-pink-500/50 ring-1 ring-pink-500/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>

                                                    {isEditing && editForm ? (
                                                        <div className="space-y-3">
                                                            <div>
                                                                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 block">Venue Name</label>
                                                                <input
                                                                    value={editForm.venue_name}
                                                                    onChange={e => setEditForm({ ...editForm, venue_name: e.target.value })}
                                                                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-pink-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 block">Description</label>
                                                                <textarea
                                                                    value={editForm.description}
                                                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-pink-500 outline-none h-20 resize-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 block">Booking / Access Link (URL)</label>
                                                                <input
                                                                    value={editForm.booking_link}
                                                                    onChange={e => setEditForm({ ...editForm, booking_link: e.target.value })}
                                                                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-blue-600 dark:text-blue-300 focus:border-pink-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 block">Address</label>
                                                                <input
                                                                    value={editForm.address}
                                                                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                                                                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-pink-500 outline-none"
                                                                />
                                                            </div>

                                                            <div className="flex gap-2 pt-2">
                                                                <Button size="sm" onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700 text-white h-8">
                                                                    <Save className="w-3 h-3 mr-1" /> Save
                                                                </Button>
                                                                <Button size="sm" onClick={handleCancelEdit} variant="ghost" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white h-8">
                                                                    <X className="w-3 h-3 mr-1" /> Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-pink-100 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300 mb-1 border border-pink-200 dark:border-pink-500/20">
                                                                        {item.time}
                                                                    </span>
                                                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                                        <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                                                        {item.venue_name}
                                                                    </h4>
                                                                </div>

                                                                <div className="flex gap-1">
                                                                    {/* Edit Button */}
                                                                    <button
                                                                        onClick={() => handleEditItem(idx)}
                                                                        disabled={isRegenerating || isAdding}
                                                                        className="p-2 rounded-full bg-slate-200 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:border-blue-200 dark:hover:border-blue-500/30 border border-transparent transition-all"
                                                                        title="Edit Details"
                                                                    >
                                                                        <Pencil className="w-4 h-4" />
                                                                    </button>
                                                                    {/* Reject / Regenerate Button */}
                                                                    <button
                                                                        onClick={() => handleRegenerateItem(idx)}
                                                                        disabled={isRegenerating || isAdding}
                                                                        className="p-2 rounded-full bg-slate-200 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-red-100 dark:hover:bg-red-500/20 hover:border-red-200 dark:hover:border-red-500/30 border border-transparent transition-all"
                                                                        title="Reject & Find Alternative"
                                                                    >
                                                                        {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 leading-relaxed">{item.description}</p>
                                                            <div className="flex flex-col sm:flex-row gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.address}</span>
                                                                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {item.cost_estimate || "N/A"}</span>
                                                            </div>
                                                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50 flex flex-wrap gap-4">
                                                                {item.booking_link && (
                                                                    <a href={item.booking_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-pink-600 dark:text-pink-300 hover:text-pink-700 dark:hover:text-pink-200 hover:underline">
                                                                        Book / Info <ExternalLink className="w-3 h-3" />
                                                                    </a>
                                                                )}
                                                                <a
                                                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.venue_name + " " + item.address)}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 hover:underline"
                                                                >
                                                                    View Map <MapPin className="w-3 h-3" />
                                                                </a>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <Button
                                    onClick={handleAddToJar}
                                    disabled={isAdding || isAdded}
                                    className={`flex-1 font-bold ${isAdded ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30" : "bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"}`}
                                >
                                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : isAdded ? (
                                        <><Check className="w-4 h-4 mr-2" /> Saved to Jar</>
                                    ) : (
                                        <><Plus className="w-4 h-4 mr-2" /> Add Selection to Jar</>
                                    )}
                                </Button>
                                <Button variant="outline" onClick={() => setItinerary(null)} className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                                    Start Over
                                </Button>
                            </div>
                        </div>
                    )
                    }
                </div >
            </DialogContent >
        </Dialog >
    );
}
