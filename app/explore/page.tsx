"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Utensils, Wine, Moon, Lock } from "lucide-react";
import { PremiumModal } from "@/components/PremiumModal";
import { WeekendPlannerModal } from "@/components/WeekendPlannerModal";
import { DiningConciergeModal } from "@/components/DiningConciergeModal";
import { BarConciergeModal } from "@/components/BarConciergeModal";
import { DateNightPlannerModal } from "@/components/DateNightPlannerModal";
import { getApiUrl } from "@/lib/utils";

export default function ExplorePage() {
    const [isPremium, setIsPremium] = useState(false);
    const [jarType, setJarType] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<string | null>(null);

    // Modals
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);
    const [isDiningModalOpen, setIsDiningModalOpen] = useState(false);
    const [isBarModalOpen, setIsBarModalOpen] = useState(false);
    const [isDateNightOpen, setIsDateNightOpen] = useState(false);

    useEffect(() => {
        // Optimistically load premium status from cache
        try {
            const cachedPremium = localStorage.getItem('datejar_is_premium');
            if (cachedPremium) {
                setIsPremium(cachedPremium === 'true');
            }
        } catch (e) {
            // Ignore cache errors
        }

        const fetchUser = async () => {
            try {
                const res = await fetch(getApiUrl('/api/auth/me'));
                if (res.ok) {
                    const data = await res.json();
                    if (data?.user) {
                        const userIsPremium = !!data.user.isPremium;
                        setIsPremium(userIsPremium);
                        localStorage.setItem('datejar_is_premium', userIsPremium.toString());
                        if (data.user.location) setUserLocation(data.user.location);
                        if (data.user.jarType) setJarType(data.user.jarType);
                    }
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        fetchUser();
    }, []);

    const tools = [
        {
            title: "Weekend Planner",
            desc: "Discover great ideas of what to do in your area this weekend",
            icon: Calendar,
            action: () => isPremium ? setIsPlannerOpen(true) : setIsPremiumModalOpen(true),
            color: "purple"
        },
        {
            title: "Dining Concierge",
            desc: "Find the perfect dining spot for breakfast, lunch or dinner",
            icon: Utensils,
            action: () => isPremium ? setIsDiningModalOpen(true) : setIsPremiumModalOpen(true),
            color: "orange"
        },
        {
            title: "Bar Scout",
            desc: "Discover top-rated bars and lounges nearby.",
            icon: Wine,
            action: () => isPremium ? setIsBarModalOpen(true) : setIsPremiumModalOpen(true),
            color: "pink"
        },
        {
            title: "Date Night Planner",
            desc: "Plan a complete evening: Drinks, Dinner & Event.",
            icon: Moon,
            action: () => isPremium ? setIsDateNightOpen(true) : setIsPremiumModalOpen(true),
            color: "rose"
        },
    ].filter(t => jarType !== 'SOCIAL' || t.title !== 'Date Night Planner');

    const getColorClasses = (color: string) => {
        const map: Record<string, any> = {
            purple: { border: "border-purple-500/20", bgIcons: "bg-purple-500/20 text-purple-300", hover: "hover:bg-purple-900/20" },
            orange: { border: "border-orange-500/20", bgIcons: "bg-orange-500/20 text-orange-300", hover: "hover:bg-orange-900/20" },
            pink: { border: "border-pink-500/20", bgIcons: "bg-pink-500/20 text-pink-300", hover: "hover:bg-pink-900/20" },
            rose: { border: "border-rose-500/20", bgIcons: "bg-rose-500/20 text-rose-300", hover: "hover:bg-rose-900/20" },
        };
        return map[color] || map.purple;
    };

    return (
        <main className="min-h-screen p-4 pb-24 relative w-full max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Explore</h1>
            <p className="text-slate-400 mb-8">Tools to plan your perfect date.</p>

            <div className="grid grid-cols-1 gap-4">
                {tools.map((tool) => {
                    const styles = getColorClasses(tool.color);
                    return (
                        <motion.button
                            key={tool.title}
                            whileTap={{ scale: 0.98 }}
                            onClick={tool.action}
                            className={`w-full text-left bg-slate-900/40 backdrop-blur-md border rounded-2xl p-5 flex items-start gap-4 transition-all shadow-lg ${styles.border} ${styles.hover}`}
                        >
                            <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${styles.bgIcons}`}>
                                <tool.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-white text-lg">{tool.title}</span>
                                    {!isPremium && <Lock className="w-4 h-4 text-slate-500" />}
                                </div>
                                <p className="text-sm text-slate-400 leading-snug">{tool.desc}</p>
                            </div>
                        </motion.button>
                    )
                })}
            </div>

            {/* Modals */}
            <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />

            <WeekendPlannerModal
                isOpen={isPlannerOpen}
                onClose={() => setIsPlannerOpen(false)}
                userLocation={userLocation || undefined}
            />
            <DiningConciergeModal
                isOpen={isDiningModalOpen}
                onClose={() => setIsDiningModalOpen(false)}
                userLocation={userLocation || undefined}
            />
            <BarConciergeModal
                isOpen={isBarModalOpen}
                onClose={() => setIsBarModalOpen(false)}
                userLocation={userLocation || undefined}
            />
            <DateNightPlannerModal
                isOpen={isDateNightOpen}
                onClose={() => setIsDateNightOpen(false)}
                userLocation={userLocation || undefined}
            />
        </main>
    );
}
