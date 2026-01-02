"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Utensils, Wine, Moon, Lock, Disc, Clapperboard, Bed, Leaf, Dumbbell, Ticket, Users, Gamepad2, Footprints } from "lucide-react";
import { PremiumModal } from "@/components/PremiumModal";
import { useRouter } from "next/navigation";
import { WeekendPlannerModal } from "@/components/WeekendPlannerModal";
import { DiningConciergeModal } from "@/components/DiningConciergeModal";
import { BarConciergeModal } from "@/components/BarConciergeModal";
import { BarCrawlPlannerModal } from "@/components/BarCrawlPlannerModal";
import { DateNightPlannerModal } from "@/components/DateNightPlannerModal";
import { NightClubConciergeModal } from "@/components/NightClubConciergeModal";
import { MovieConciergeModal } from "@/components/MovieConciergeModal";
import { HotelConciergeModal } from "@/components/HotelConciergeModal";
import { WellnessConciergeModal } from "@/components/WellnessConciergeModal";
import { FitnessConciergeModal } from "@/components/FitnessConciergeModal";
import { TheatreConciergeModal } from "@/components/TheatreConciergeModal";
import { GameConciergeModal } from "@/components/GameConciergeModal";
import { getApiUrl } from "@/lib/utils";

export default function ExplorePage() {
    const [isPremium, setIsPremium] = useState(false);
    const [jarType, setJarType] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<string | null>(null);

    // Modals
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);
    const [isDiningModalOpen, setIsDiningModalOpen] = useState(false);
    const router = useRouter();
    const [isBarModalOpen, setIsBarModalOpen] = useState(false);
    const [isBarCrawlOpen, setIsBarCrawlOpen] = useState(false);
    const [isDateNightOpen, setIsDateNightOpen] = useState(false);
    const [isNightClubModalOpen, setIsNightClubModalOpen] = useState(false);
    const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
    const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
    const [isWellnessModalOpen, setIsWellnessModalOpen] = useState(false);
    const [isFitnessModalOpen, setIsFitnessModalOpen] = useState(false);
    const [isTheatreModalOpen, setIsTheatreModalOpen] = useState(false);
    const [isGameModalOpen, setIsGameModalOpen] = useState(false);

    useEffect(() => {
        // Optimistically load premium status and location from cache
        try {
            const cachedPremium = localStorage.getItem('datejar_is_premium');
            if (cachedPremium) {
                setIsPremium(cachedPremium === 'true');
            }
            const cachedLocation = localStorage.getItem('datejar_user_location');
            if (cachedLocation) {
                setUserLocation(cachedLocation);
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
                        if (data.user.location) {
                            setUserLocation(data.user.location);
                            localStorage.setItem('datejar_user_location', data.user.location);
                        }
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
            title: "Community Finder",
            desc: "Join public jars and find your squad.",
            icon: Users,
            action: () => router.push('/community'),
            color: "blue"
        },
        {
            title: "Weekend Planner",
            desc: "Discover great ideas of what to do in your area this weekend",
            icon: Calendar,
            action: () => isPremium ? setIsPlannerOpen(true) : setIsPremiumModalOpen(true),
            color: "purple"
        },
        {
            title: "Game Finder",
            desc: "Find online digital games to play solo or with friends.",
            icon: Gamepad2,
            action: () => isPremium ? setIsGameModalOpen(true) : setIsPremiumModalOpen(true),
            color: "indigo"
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
            title: "Bar Crawl Planner",
            desc: "Design a walking route of top-rated bars.",
            icon: Footprints,
            action: () => isPremium ? setIsBarCrawlOpen(true) : setIsPremiumModalOpen(true),
            color: "orange"
        },
        {
            title: "Night Out Planner",
            desc: "Plan a complete evening: Drinks, Dinner & Event.",
            icon: Moon,
            action: () => isPremium ? setIsDateNightOpen(true) : setIsPremiumModalOpen(true),
            color: "rose"
        },
        {
            title: "Nightclub Scout",
            desc: "Discover the hottest clubs and dance venues.",
            icon: Disc,
            action: () => isPremium ? setIsNightClubModalOpen(true) : setIsPremiumModalOpen(true),
            color: "indigo"
        },
        {
            title: "Theatre Scout",
            desc: "Find plays, musicals, and live performances.",
            icon: Ticket,
            action: () => isPremium ? setIsTheatreModalOpen(true) : setIsPremiumModalOpen(true),
            color: "violet"
        },
        {
            title: "Movie Scout",
            desc: "Find best movies and cinemas playing near you.",
            icon: Clapperboard,
            action: () => isPremium ? setIsMovieModalOpen(true) : setIsPremiumModalOpen(true),
            color: "red"
        },
        {
            title: "Hotel Finder",
            desc: "Find the perfect stay for your getaway.",
            icon: Bed,
            action: () => isPremium ? setIsHotelModalOpen(true) : setIsPremiumModalOpen(true),
            color: "cyan"
        },
        {
            title: "Wellness & Spa",
            desc: "Find spas, yoga, and relaxation spots.",
            icon: Leaf,
            action: () => isPremium ? setIsWellnessModalOpen(true) : setIsPremiumModalOpen(true),
            color: "emerald"
        },
        {
            title: "Fitness Finder",
            desc: "Gyms, trails, and classes to get you moving.",
            icon: Dumbbell,
            action: () => isPremium ? setIsFitnessModalOpen(true) : setIsPremiumModalOpen(true),
            color: "amber"
        },
    ].filter(t => jarType !== 'SOCIAL' || t.title !== 'Date Night Planner');

    const getColorClasses = (color: string) => {
        const map: Record<string, any> = {
            purple: { border: "border-purple-200 dark:border-purple-500/20", bgIcons: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300", hover: "hover:bg-purple-50 dark:hover:bg-purple-900/20" },
            blue: { border: "border-blue-200 dark:border-blue-500/20", bgIcons: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300", hover: "hover:bg-blue-50 dark:hover:bg-blue-900/20" },
            orange: { border: "border-orange-200 dark:border-orange-500/20", bgIcons: "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300", hover: "hover:bg-orange-50 dark:hover:bg-orange-900/20" },
            pink: { border: "border-pink-200 dark:border-pink-500/20", bgIcons: "bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300", hover: "hover:bg-pink-50 dark:hover:bg-pink-900/20" },
            rose: { border: "border-rose-200 dark:border-rose-500/20", bgIcons: "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300", hover: "hover:bg-rose-50 dark:hover:bg-rose-900/20" },
            indigo: { border: "border-indigo-200 dark:border-indigo-500/20", bgIcons: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300", hover: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20" },
            violet: { border: "border-violet-200 dark:border-violet-500/20", bgIcons: "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300", hover: "hover:bg-violet-50 dark:hover:bg-violet-900/20" },
            red: { border: "border-red-200 dark:border-red-500/20", bgIcons: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300", hover: "hover:bg-red-50 dark:hover:bg-red-900/20" },
            cyan: { border: "border-cyan-200 dark:border-cyan-500/20", bgIcons: "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300", hover: "hover:bg-cyan-50 dark:hover:bg-cyan-900/20" },
            emerald: { border: "border-emerald-200 dark:border-emerald-500/20", bgIcons: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300", hover: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20" },
            amber: { border: "border-amber-200 dark:border-amber-500/20", bgIcons: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300", hover: "hover:bg-amber-50 dark:hover:bg-amber-900/20" },
        };
        return map[color] || map.purple;
    };

    return (
        <main className="min-h-screen p-4 pb-24 relative w-full max-w-2xl mx-auto bg-slate-50 dark:bg-slate-950">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Explore</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Discover ideas to fill your jar or do right now.</p>

            <div className="grid grid-cols-1 gap-4">
                {tools.map((tool) => {
                    const styles = getColorClasses(tool.color);
                    return (
                        <motion.button
                            key={tool.title}
                            whileTap={{ scale: 0.98 }}
                            onClick={tool.action}
                            className={`w-full text-left bg-white dark:bg-slate-900 border rounded-2xl p-5 flex items-start gap-4 transition-all shadow-sm hover:shadow-md ${styles.border} ${styles.hover}`}
                        >
                            <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${styles.bgIcons}`}>
                                <tool.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-slate-900 dark:text-white text-lg">{tool.title}</span>
                                    {!isPremium && <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug">{tool.desc}</p>
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
            <BarCrawlPlannerModal
                isOpen={isBarCrawlOpen}
                onClose={() => setIsBarCrawlOpen(false)}
                userLocation={userLocation || undefined}
            />
            <DateNightPlannerModal
                isOpen={isDateNightOpen}
                onClose={() => setIsDateNightOpen(false)}
                userLocation={userLocation || undefined}
            />
            <NightClubConciergeModal
                isOpen={isNightClubModalOpen}
                onClose={() => setIsNightClubModalOpen(false)}
                userLocation={userLocation || undefined}
            />
            <TheatreConciergeModal
                isOpen={isTheatreModalOpen}
                onClose={() => setIsTheatreModalOpen(false)}
                userLocation={userLocation || undefined}
            />
            <MovieConciergeModal
                isOpen={isMovieModalOpen}
                onClose={() => setIsMovieModalOpen(false)}
                userLocation={userLocation || undefined}
            />
            <HotelConciergeModal
                isOpen={isHotelModalOpen}
                onClose={() => setIsHotelModalOpen(false)}
                userLocation={userLocation || undefined}
            />
            <WellnessConciergeModal
                isOpen={isWellnessModalOpen}
                onClose={() => setIsWellnessModalOpen(false)}
                userLocation={userLocation || undefined}
            />
            <FitnessConciergeModal
                isOpen={isFitnessModalOpen}
                onClose={() => setIsFitnessModalOpen(false)}
                userLocation={userLocation || undefined}
            />
            <GameConciergeModal
                isOpen={isGameModalOpen}
                onClose={() => setIsGameModalOpen(false)}
            />
        </main>
    );
}
