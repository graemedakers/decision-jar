"use client";

import { motion } from "framer-motion";
import { Lock, Sparkles, Calendar, Plane, UtensilsCrossed, Beer, Moon, ChefHat, Dumbbell, Heart, Film, Drama, BookOpen, Gamepad2, Leaf, Users } from "lucide-react";
import { DASHBOARD_TOOLS, DashboardTool } from "@/lib/constants/tools";
import { useModalSystem } from "@/components/ModalProvider";

interface SmartToolsGridProps {
    isPremium: boolean;
    jarTopic: string;
    activityPlannerTitle: string;
}

// Static color mapping for Tailwind CSS
const colorStyles: Record<string, { bg: string; text: string; ring: string; hover: string; gradient: string }> = {
    orange: {
        bg: "bg-orange-100 dark:bg-orange-500/20",
        text: "text-orange-600 dark:text-orange-400",
        ring: "ring-orange-500/30",
        hover: "group-hover:bg-orange-500 group-hover:text-white",
        gradient: "from-orange-500 to-amber-500"
    },
    purple: {
        bg: "bg-purple-100 dark:bg-purple-500/20",
        text: "text-purple-600 dark:text-purple-400",
        ring: "ring-purple-500/30",
        hover: "group-hover:bg-purple-500 group-hover:text-white",
        gradient: "from-purple-500 to-indigo-500"
    },
    blue: {
        bg: "bg-blue-100 dark:bg-blue-500/20",
        text: "text-blue-600 dark:text-blue-400",
        ring: "ring-blue-500/30",
        hover: "group-hover:bg-blue-500 group-hover:text-white",
        gradient: "from-blue-500 to-cyan-500"
    },
    pink: {
        bg: "bg-pink-100 dark:bg-pink-500/20",
        text: "text-pink-600 dark:text-pink-400",
        ring: "ring-pink-500/30",
        hover: "group-hover:bg-pink-500 group-hover:text-white",
        gradient: "from-pink-500 to-rose-500"
    },
    rose: {
        bg: "bg-rose-100 dark:bg-rose-500/20",
        text: "text-rose-600 dark:text-rose-400",
        ring: "ring-rose-500/30",
        hover: "group-hover:bg-rose-500 group-hover:text-white",
        gradient: "from-rose-500 to-pink-500"
    },
    amber: {
        bg: "bg-amber-100 dark:bg-amber-500/20",
        text: "text-amber-600 dark:text-amber-400",
        ring: "ring-amber-500/30",
        hover: "group-hover:bg-amber-500 group-hover:text-white",
        gradient: "from-amber-500 to-yellow-500"
    },
    indigo: {
        bg: "bg-indigo-100 dark:bg-indigo-500/20",
        text: "text-indigo-600 dark:text-indigo-400",
        ring: "ring-indigo-500/30",
        hover: "group-hover:bg-indigo-500 group-hover:text-white",
        gradient: "from-indigo-500 to-purple-500"
    },
    violet: {
        bg: "bg-violet-100 dark:bg-violet-500/20",
        text: "text-violet-600 dark:text-violet-400",
        ring: "ring-violet-500/30",
        hover: "group-hover:bg-violet-500 group-hover:text-white",
        gradient: "from-violet-500 to-purple-500"
    },
    red: {
        bg: "bg-red-100 dark:bg-red-500/20",
        text: "text-red-600 dark:text-red-400",
        ring: "ring-red-500/30",
        hover: "group-hover:bg-red-500 group-hover:text-white",
        gradient: "from-red-500 to-rose-500"
    },
    cyan: {
        bg: "bg-cyan-100 dark:bg-cyan-500/20",
        text: "text-cyan-600 dark:text-cyan-400",
        ring: "ring-cyan-500/30",
        hover: "group-hover:bg-cyan-500 group-hover:text-white",
        gradient: "from-cyan-500 to-teal-500"
    },
    emerald: {
        bg: "bg-emerald-100 dark:bg-emerald-500/20",
        text: "text-emerald-600 dark:text-emerald-400",
        ring: "ring-emerald-500/30",
        hover: "group-hover:bg-emerald-500 group-hover:text-white",
        gradient: "from-emerald-500 to-green-500"
    },
    teal: {
        bg: "bg-teal-100 dark:bg-teal-500/20",
        text: "text-teal-600 dark:text-teal-400",
        ring: "ring-teal-500/30",
        hover: "group-hover:bg-teal-500 group-hover:text-white",
        gradient: "from-teal-500 to-cyan-500"
    },
    green: {
        bg: "bg-green-100 dark:bg-green-500/20",
        text: "text-green-600 dark:text-green-400",
        ring: "ring-green-500/30",
        hover: "group-hover:bg-green-500 group-hover:text-white",
        gradient: "from-green-500 to-emerald-500"
    },
};

export function SmartToolsGrid({
    isPremium,
    jarTopic,
    activityPlannerTitle,
}: SmartToolsGridProps) {

    const { openModal } = useModalSystem();

    const handleToolClick = (tool: DashboardTool) => {
        if (tool.requiresPremium && !isPremium) {
            openModal('PREMIUM');
            return;
        }

        if (tool.actionType === 'concierge' && tool.conciergeId) {
            openModal('CONCIERGE', { toolId: tool.conciergeId });
        } else if (tool.actionType === 'modal') {
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
                case 'menu_planner':
                    openModal('MENU_PLANNER');
                    break;
                case 'surprise_me':
                    openModal('SURPRISE_ME');
                    break;
                case 'date_night':
                    if (jarTopic === 'Cooking & Recipes') {
                        openModal('CATERING_PLANNER');
                    } else {
                        openModal('DATE_NIGHT_PLANNER');
                    }
                    break;
            }
        }
    };

    const getToolTitle = (tool: DashboardTool) => {
        if (tool.id === 'date_night_planner') {
            return activityPlannerTitle;
        }
        return tool.title;
    };

    const visibleTools = DASHBOARD_TOOLS.filter(t => t.showInDashboard);

    return (
        <div className="space-y-8">
            {/* Compact Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {visibleTools.map((tool, index) => {
                    const styles = colorStyles[tool.color] || colorStyles.purple;
                    const Icon = tool.icon;

                    return (
                        <motion.button
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleToolClick(tool)}
                            className="group relative text-left"
                        >
                            {/* Card */}
                            <div className="relative h-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 hover:shadow-lg hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
                                {/* Icon */}
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${styles.bg} ${styles.text} ring-1 ${styles.ring} ${styles.hover} flex items-center justify-center transition-all duration-300`}>
                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-1">
                                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight line-clamp-2">
                                            {getToolTitle(tool)}
                                        </h3>
                                        {!isPremium && tool.requiresPremium && (
                                            <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-1.5 line-clamp-2 hidden sm:block">
                                        {tool.description}
                                    </p>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
