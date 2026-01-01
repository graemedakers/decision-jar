"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Loader2, Sparkles, ExternalLink, Plus, Footprints, Beer, Navigation, Search } from "lucide-react";
import { Button } from "./ui/Button";
import { useConciergeActions } from "@/hooks/useConciergeActions";
import { getCurrentLocation } from "@/lib/utils";

interface BarCrawlPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: string;
    onIdeaAdded?: () => void;
    onFavoriteUpdated?: () => void;
}

export function BarCrawlPlannerModal({ isOpen, onClose, userLocation, onIdeaAdded, onFavoriteUpdated }: BarCrawlPlannerModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState(userLocation || "");
    const [stopCount, setStopCount] = useState(3);
    const [barType, setBarType] = useState("Any");
    const [itinerary, setItinerary] = useState<any[]>([]);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Using a ref to track if we have initialized for this open session
    const [prevOpen, setPrevOpen] = useState(false);

    if (isOpen && !prevOpen) {
        setLocation(userLocation || "");
        setItinerary([]);
        setStopCount(3);
        setBarType("Any");
        setPrevOpen(true);
    } else if (!isOpen && prevOpen) {
        setPrevOpen(false);
    }

    useEffect(() => {
        if (itinerary.length > 0 && resultsRef.current) {
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [itinerary]);

    const { handleAddToJar } = useConciergeActions({
        onIdeaAdded,
        onFavoriteUpdated,
        onClose,
        setRecommendations: setItinerary
    });

    const handlePlanCrawl = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/bar-crawl-planner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location,
                    count: stopCount,
                    type: barType
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setItinerary(data.itinerary || []);
            } else {
                const data = await res.json().catch(() => ({}));
                alert(`Error ${res.status}: ${data.error || "Failed to plan crawl."}`);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenGoogleMaps = () => {
        if (itinerary.length === 0) return;

        // Construct Google Maps URL with waypoints
        // Format: https://www.google.com/maps/dir/?api=1&origin=start&destination=end&waypoints=w1|w2&travelmode=walking

        const origin = encodeURIComponent(`${itinerary[0].name}, ${itinerary[0].address}`);
        const destination = encodeURIComponent(`${itinerary[itinerary.length - 1].name}, ${itinerary[itinerary.length - 1].address}`);

        // Waypoints are everything between first and last
        const waypoints = itinerary.slice(1, -1).map(stop => encodeURIComponent(`${stop.name}, ${stop.address}`)).join('|');

        let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
        if (waypoints) {
            url += `&waypoints=${waypoints}`;
        }

        window.open(url, '_blank');
    };

    const handleSaveCrawl = async () => {
        if (itinerary.length === 0) return;

        // Construct JSON for ItineraryPreview to ensure consistency with DateReveal
        const itineraryData = {
            neighborhood: location || "City",
            schedule: itinerary.map(stop => ({
                time: `Stop ${stop.sequence}`,
                venue_name: stop.name,
                description: stop.description + (stop.walking_time_to_next ? `\n(Walk ~${stop.walking_time_to_next} to next stop)` : ""),
                address: stop.address,
                cost_estimate: "$$",
                activity_type: "Drinks",
                booking_link: stop.website || `https://www.google.com/search?q=${encodeURIComponent(stop.name + " " + stop.address)}`
            }))
        };

        const firstStop = itinerary[0];

        try {
            const res = await fetch('/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: `Bar Crawl: ${stopCount} Stops in ${location}`,
                    details: JSON.stringify(itineraryData), // Store as JSON string for automated parsing
                    indoor: true,
                    duration: stopCount * 1.5,
                    activityLevel: "MEDIUM",
                    cost: "$$$",
                    timeOfDay: "EVENING",
                    category: "ACTIVITY",
                    address: firstStop.address,
                    isPrivate: true
                }),
            });

            if (res.ok) {
                if (onIdeaAdded) onIdeaAdded();
                alert("Bar Crawl Itinerary added to your Jar!");
                onClose();
            } else {
                const err = await res.json();
                alert(`Failed to save crawl: ${err.error || 'Server error'}`);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to save crawl.");
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
                        className="glass-card w-full max-w-2xl relative max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10"
                    >
                        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                                    <Footprints className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bar Crawl Planner</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Design the perfect night out route</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-6 px-7 pb-32 md:pb-6 custom-scrollbar">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Location / Area</label>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    const currentLoc = await getCurrentLocation();
                                                    setLocation(currentLoc);
                                                } catch (err) {
                                                    alert("Could not get location. Check permissions.");
                                                }
                                            }}
                                            className="text-[10px] uppercase tracking-wider font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-colors flex items-center gap-1"
                                        >
                                            <MapPin className="w-3 h-3" />
                                            Use GPS
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. Downtown, Soho, or specific address"
                                        className="glass-input w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Number of Stops</label>
                                        <select
                                            value={stopCount}
                                            onChange={(e) => setStopCount(Number(e.target.value))}
                                            className="glass-input w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white cursor-pointer"
                                        >
                                            {[2, 3, 4, 5, 6, 7, 8].map(num => (
                                                <option key={num} value={num}>{num} Bars</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bar Type (Optional)</label>
                                        <select
                                            value={barType}
                                            onChange={(e) => setBarType(e.target.value)}
                                            className="glass-input w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white cursor-pointer"
                                        >
                                            <option value="Any">Any Type</option>
                                            <option value="Pub">Pub / Tavern</option>
                                            <option value="Cocktail Bar">Cocktail Bar</option>
                                            <option value="Dive Bar">Dive Bar</option>
                                            <option value="Rooftop">Rooftop Bar</option>
                                            <option value="Wine Bar">Wine Bar</option>
                                            <option value="Brewery">Brewery</option>
                                            <option value="Sports Bar">Sports Bar</option>
                                            <option value="Club">Club / Dance</option>
                                            <option value="Speakeasy">Speakeasy</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="py-2">
                                <Button
                                    type="button"
                                    onClick={handlePlanCrawl}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/20"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Planning Route...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5 mr-2" /> Generate Itinerary</>
                                    )}
                                </Button>
                            </div>

                            {itinerary.length > 0 && (
                                <div ref={resultsRef} className="space-y-6 pt-4 border-t border-slate-200 dark:border-white/10">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Itinerary</h3>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-2 border-slate-200 dark:border-white/20 text-slate-700 dark:text-slate-200"
                                                onClick={handleSaveCrawl}
                                            >
                                                <Plus className="w-4 h-4" /> Save Crawl
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-2 border-slate-200 dark:border-white/20 text-slate-700 dark:text-slate-200"
                                                onClick={handleOpenGoogleMaps}
                                            >
                                                <Navigation className="w-4 h-4" /> View Route Map
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="relative space-y-0">
                                        {/* Connecting Line */}
                                        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-white/10 z-0" />

                                        {itinerary.map((stop, index) => (
                                            <div key={index} className="relative z-10 flex gap-4">
                                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-900 flex items-center justify-center font-bold text-lg text-slate-300 shadow-sm">
                                                    <span className="text-orange-500">{stop.sequence}</span>
                                                </div>
                                                <div className="flex-1 pb-8 last:pb-0">
                                                    <div className="glass p-4 rounded-xl relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">{stop.name}</h4>
                                                        </div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{stop.description}</p>
                                                        <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                                                            <MapPin className="w-3 h-3" /> {stop.address}
                                                        </div>

                                                        {stop.walking_time_to_next && (
                                                            <div className="absolute -bottom-8 left-0 text-xs text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/5 transform -translate-x-2">
                                                                <Footprints className="w-3 h-3" /> Walk ~{stop.walking_time_to_next}
                                                            </div>
                                                        )}

                                                        <div className="flex gap-2 justify-end mt-2">
                                                            <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.name + " " + stop.address)}`, '_blank')}>
                                                                <MapPin className="w-3 h-3 mr-1" /> Map
                                                            </Button>
                                                            {stop.website ? (
                                                                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => window.open(stop.website, '_blank')}>
                                                                    <ExternalLink className="w-3 h-3 mr-1" /> Website
                                                                </Button>
                                                            ) : (
                                                                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(stop.name + " " + stop.address)}`, '_blank')}>
                                                                    <Search className="w-3 h-3 mr-1" /> Web Search
                                                                </Button>
                                                            )}
                                                            <Button size="sm" onClick={() => handleAddToJar(stop, "BAR", true)} className="text-xs bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 h-7">
                                                                <Plus className="w-3 h-3 mr-1" /> Add to Jar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-center pt-4">
                                        <p className="text-xs text-slate-400">Remember to drink responsibly and plan a safe ride home! 🚕</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
