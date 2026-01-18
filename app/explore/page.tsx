"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { PremiumModal } from "@/components/PremiumModal";
import { useRouter } from "next/navigation";





import { getApiUrl } from "@/lib/utils";
import { GenericConciergeModal } from "@/components/GenericConciergeModal";
import { CONCIERGE_CONFIGS } from "@/lib/concierge-configs";
import { DASHBOARD_TOOLS, DashboardTool } from "@/lib/constants/tools";
// import { useModal } from "@/hooks/useModal";
import { DashboardModals } from "@/components/DashboardModals";
import { useModalSystem } from "@/components/ModalProvider";

export default function ExplorePage() {
    const [isPremium, setIsPremium] = useState(false);
    const [jarType, setJarType] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<string | null>(null);

    // Modals
    const { openModal } = useModalSystem();
    const router = useRouter();

    // Generic Concierge State
    // const [activeConciergeTool, setActiveConciergeTool] = useState<string | null>(null); // Removed in favor of modal system


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
                    setUserData(data.user);
                }
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

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

        fetchUser();
    }, []);

    const [userData, setUserData] = useState<any>(null);

    const handleToolClick = (tool: DashboardTool) => {
        if (tool.requiresPremium && !isPremium) {
            openModal('PREMIUM');
            return;
        }

        if (tool.actionType === 'link' && tool.linkHref) {
            router.push(tool.linkHref);
            return;
        }

        if (tool.actionType === 'concierge' && tool.conciergeId) {
            openModal('CONCIERGE', { toolId: tool.conciergeId });
            return;
        }

        if (tool.actionType === 'modal') {
            switch (tool.modalId) {
                case 'weekend_planner':
                    openModal('WEEKEND_PLANNER');
                    break;
                case 'catering':
                    openModal('CATERING_PLANNER');
                    break;
                case 'bar_crawl':
                    openModal('BAR_CRAWL_PLANNER');
                    break;
                case 'date_night':
                    openModal('DATE_NIGHT_PLANNER');
                    break;
                case 'surprise_me':
                    openModal('SURPRISE_ME');
                    break;
            }
        }
    };

    const getColorClasses = (color: string) => {
        const map: Record<string, any> = {
            purple: { border: "border-purple-200 dark:border-purple-500/20", bgIcons: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300", hover: "hover:bg-purple-50 dark:hover:bg-purple-900/20", iconHover: "group-hover:bg-purple-500 group-hover:text-white", ring: "ring-1 ring-purple-500/20" },
            blue: { border: "border-blue-200 dark:border-blue-500/20", bgIcons: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300", hover: "hover:bg-blue-50 dark:hover:bg-blue-900/20", iconHover: "group-hover:bg-blue-500 group-hover:text-white", ring: "ring-1 ring-blue-500/20" },
            orange: { border: "border-orange-200 dark:border-orange-500/20", bgIcons: "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300", hover: "hover:bg-orange-50 dark:hover:bg-orange-900/20", iconHover: "group-hover:bg-orange-500 group-hover:text-white", ring: "ring-1 ring-orange-500/20" },
            pink: { border: "border-pink-200 dark:border-pink-500/20", bgIcons: "bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300", hover: "hover:bg-pink-50 dark:hover:bg-pink-900/20", iconHover: "group-hover:bg-pink-500 group-hover:text-white", ring: "ring-1 ring-pink-500/20" },
            rose: { border: "border-rose-200 dark:border-rose-500/20", bgIcons: "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300", hover: "hover:bg-rose-50 dark:hover:bg-rose-900/20", iconHover: "group-hover:bg-rose-500 group-hover:text-white", ring: "ring-1 ring-rose-500/20" },
            indigo: { border: "border-indigo-200 dark:border-indigo-500/20", bgIcons: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300", hover: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20", iconHover: "group-hover:bg-indigo-500 group-hover:text-white", ring: "ring-1 ring-indigo-500/20" },
            violet: { border: "border-violet-200 dark:border-violet-500/20", bgIcons: "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300", hover: "hover:bg-violet-50 dark:hover:bg-violet-900/20", iconHover: "group-hover:bg-violet-500 group-hover:text-white", ring: "ring-1 ring-violet-500/20" },
            red: { border: "border-red-200 dark:border-red-500/20", bgIcons: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300", hover: "hover:bg-red-50 dark:hover:bg-red-900/20", iconHover: "group-hover:bg-red-500 group-hover:text-white", ring: "ring-1 ring-red-500/20" },
            cyan: { border: "border-cyan-200 dark:border-cyan-500/20", bgIcons: "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300", hover: "hover:bg-cyan-50 dark:hover:bg-cyan-900/20", iconHover: "group-hover:bg-cyan-500 group-hover:text-white", ring: "ring-1 ring-cyan-500/20" },
            emerald: { border: "border-emerald-200 dark:border-emerald-500/20", bgIcons: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300", hover: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20", iconHover: "group-hover:bg-emerald-500 group-hover:text-white", ring: "ring-1 ring-emerald-500/20" },
            amber: { border: "border-amber-200 dark:border-amber-500/20", bgIcons: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300", hover: "hover:bg-amber-50 dark:hover:bg-amber-900/20", iconHover: "group-hover:bg-amber-500 group-hover:text-white", ring: "ring-1 ring-amber-500/20" },
            teal: { border: "border-teal-200 dark:border-teal-500/20", bgIcons: "bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-300", hover: "hover:bg-teal-50 dark:hover:bg-teal-900/20", iconHover: "group-hover:bg-teal-500 group-hover:text-white", ring: "ring-1 ring-teal-500/20" },
            green: { border: "border-green-200 dark:border-green-500/20", bgIcons: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300", hover: "hover:bg-green-50 dark:hover:bg-green-900/20", iconHover: "group-hover:bg-green-500 group-hover:text-white", ring: "ring-1 ring-green-500/20" },
        };
        return map[color] || map.purple;
    };

    const visibleTools = DASHBOARD_TOOLS.filter(t => {
        if (!t.showInExplore) return false;
        // In original: return jarType !== 'SOCIAL' || t.title !== 'Date Night Planner';
        // Now using id:
        if (jarType === 'SOCIAL' && t.id === 'date_night_planner') return false;

        return true;
    });

    return (
        <main className="page-with-nav min-h-screen pt-4 pb-24 px-4 md:px-8 relative w-full max-w-2xl mx-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Explore</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Discover ideas to fill your jar or do right now.</p>

            <motion.div
                className="grid grid-cols-1 gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.04 },
                    },
                }}
            >
                {visibleTools.map((tool) => {
                    const styles = getColorClasses(tool.color);
                    const Icon = tool.icon;
                    return (
                        <motion.button
                            key={tool.id}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                            }}
                            whileHover={{ scale: 1.01, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleToolClick(tool)}
                            className={`group w-full text-left bg-white dark:bg-slate-900/50 backdrop-blur-sm border rounded-2xl p-5 flex items-start gap-4 transition-all shadow-sm hover:shadow-lg ${styles.border} ${styles.hover}`}
                        >
                            <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 shadow-inner ${styles.bgIcons} ${styles.ring} ${styles.iconHover}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-slate-900 dark:text-white text-lg">{tool.title}</span>
                                    {!isPremium && tool.requiresPremium && <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug">{tool.description}</p>
                            </div>
                        </motion.button>
                    )
                })}
            </motion.div>

            {/* Modals via DashboardModals */}
            <DashboardModals
                isPremium={isPremium}
                userData={userData}
                ideas={[]}
                userLocation={userLocation}
                setUserLocation={setUserLocation}
                combinedLocation={userLocation || ""}
                jarTopic={jarType || "General"}
                level={userData?.level || 1}
                favoritesCount={0}
                hasPaid={userData?.hasPaid || false}
                coupleCreatedAt={userData?.coupleCreatedAt || ""}
                isTrialEligible={userData?.isTrialEligible !== false}
                handleContentUpdate={fetchUser}
                fetchFavorites={() => { }}
                fetchIdeas={() => { }}
                refreshUser={fetchUser}
                handleSpinJar={() => { }}
                showConfetti={false}
                setShowConfetti={() => { }}
            />
        </main>
    );
}

