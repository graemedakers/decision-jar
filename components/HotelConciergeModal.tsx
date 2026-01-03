"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bed, MapPin, Loader2, Sparkles, ExternalLink, Plus, Zap, Star, Heart, Wifi, Car, Waves, Dumbbell, Coffee, Martini, Lock } from "lucide-react";
import { Button } from "./ui/Button";
import { useConciergeActions } from "@/hooks/useConciergeActions";
import { getCurrentLocation } from "@/lib/utils";
import { LocationInput } from "./LocationInput";
import { ConciergeResultCard } from "@/components/ConciergeResultCard";

interface HotelConciergeModalProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: string;
    onIdeaAdded?: () => void;
    onGoTonight?: (idea: any) => void;
    onFavoriteUpdated?: () => void;
}

export function HotelConciergeModal({ isOpen, onClose, userLocation, onIdeaAdded, onGoTonight, onFavoriteUpdated }: HotelConciergeModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isStandardizing, setIsStandardizing] = useState(false);

    // Filters
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
    const [selectedType, setSelectedType] = useState<string>("any");
    const [budget, setBudget] = useState("any");
    const [location, setLocation] = useState(userLocation || "");
    const [isPrivate, setIsPrivate] = useState(true);

    const [recommendations, setRecommendations] = useState<any[]>([]);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Constants for selection options
    const FACILITY_OPTIONS = [
        { id: "Pool", icon: Waves },
        { id: "Gym", icon: Dumbbell },
        { id: "Spa", icon: Sparkles },
        { id: "Parking", icon: Car },
        { id: "WiFi", icon: Wifi },
        { id: "Breakfast", icon: Coffee },
        { id: "Bar/Lounge", icon: Martini },
        { id: "Pet Friendly", icon: Heart },
    ];

    const TYPE_OPTIONS = [
        "Any", "Hotel", "Resort", "B&B", "Boutique", "Motel", "Hostel"
    ];

    // Using a ref to track if we have initialized for this open session
    const [prevOpen, setPrevOpen] = useState(false);

    if (isOpen && !prevOpen) {
        setLocation(userLocation || "");
        setSelectedFacilities([]);
        setRecommendations([]);
        setIsPrivate(true);
        setPrevOpen(true);
    } else if (!isOpen && prevOpen) {
        setPrevOpen(false);
    }

    useEffect(() => {
        if (recommendations.length > 0 && resultsRef.current) {
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [recommendations]);

    const { handleAddToJar, handleGoTonight, handleFavorite, toggleSelection } = useConciergeActions({
        onIdeaAdded,
        onGoTonight,
        onFavoriteUpdated,
        onClose,
        setRecommendations
    });

    const handleGetRecommendations = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/hotel-concierge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    facilities: selectedFacilities,
                    location: location,
                    budget,
                    type: selectedType
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setRecommendations(data.recommendations);
            } else {
                const data = await res.json().catch(() => ({}));
                alert(`Error ${res.status}: ${data.error || "Failed to get recommendations. Please try again."}`);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setIsLoading(false);
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
                                <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center">
                                    <Bed className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hotel Concierge</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Find the perfect stay for your getaway</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-6 px-7">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Destination</label>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    const currentLoc = await getCurrentLocation();
                                                    setLocation(currentLoc);
                                                } catch (err) {
                                                    alert("Could not get location. Please check permissions.");
                                                }
                                            }}
                                            className="text-[10px] uppercase tracking-wider font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 transition-colors flex items-center gap-1"
                                        >
                                            <MapPin className="w-3 h-3" />
                                            Use GPS
                                        </button>
                                    </div>
                                    <LocationInput
                                        value={location}
                                        onChange={setLocation}
                                        placeholder="City, Region, or Neighborhood"
                                        isStandardizing={isStandardizing}
                                        updateProfileLocation={true}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Facilities / Amenities</label>
                                        <div className="flex flex-wrap gap-2">
                                            {FACILITY_OPTIONS.map((fac) => (
                                                <button
                                                    key={fac.id}
                                                    onClick={() => toggleSelection(fac.id, selectedFacilities, setSelectedFacilities)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${selectedFacilities.includes(fac.id)
                                                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                                                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200'
                                                        }`}
                                                >
                                                    <fac.icon className="w-3.5 h-3.5" />
                                                    {fac.id}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Stay Type</label>
                                            <select
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                                className="w-full h-10 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md text-slate-900 dark:text-white"
                                            >
                                                {TYPE_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Budget Range</label>
                                            <select
                                                value={budget}
                                                onChange={(e) => setBudget(e.target.value)}
                                                className="w-full h-10 px-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md text-slate-900 dark:text-white"
                                            >
                                                <option value="any">Any Price</option>
                                                <option value="cheap">$ (Budget)</option>
                                                <option value="moderate">$$ (Standard)</option>
                                                <option value="expensive">$$$ (High End)</option>
                                                <option value="luxury">$$$$ (Luxury)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="py-2">
                                <Button
                                    type="button"
                                    onClick={() => handleGetRecommendations()}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Searching Hotels...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5 mr-2" /> Find Stays</>
                                    )}
                                </Button>
                            </div>

                            {recommendations.length > 0 && (
                                <div ref={resultsRef} className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Picks for You</h3>
                                        <button
                                            onClick={() => setIsPrivate(!isPrivate)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isPrivate ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500'}`}
                                        >
                                            <Lock className="w-3.5 h-3.5" />
                                            {isPrivate ? "Secret Mode On" : "Public Mode"}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {recommendations.map((rec, index) => (
                                            <ConciergeResultCard
                                                key={index}
                                                rec={rec}
                                                categoryType="HOTEL"
                                                mainIcon={Bed}
                                                subtext={rec.speciality}
                                                isPrivate={isPrivate}
                                                onFavorite={handleFavorite}
                                                onAddToJar={handleAddToJar}
                                                onGoAction={handleGoTonight}
                                                goActionLabel="Book Now"
                                                goActionClass="hidden" // Hiding goAction as there isn't one in the original
                                                ratingClass="text-orange-500 dark:text-yellow-400"
                                            />
                                        ))}
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
