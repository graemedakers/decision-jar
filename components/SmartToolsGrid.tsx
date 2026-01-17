"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { DASHBOARD_TOOLS, DashboardTool } from "@/lib/constants/tools";
import { useModalSystem } from "@/components/ModalProvider";

interface SmartToolsGridProps {
    isPremium: boolean;
    jarTopic: string;
    activityPlannerTitle: string;
}

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

    return (
        <div>
            <h3 className="text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-8">Executive Decision Suite</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {DASHBOARD_TOOLS.filter(t => t.showInDashboard).map((tool) => {
                    const color = tool.color;
                    const Icon = tool.icon;

                    return (
                        <motion.div
                            key={tool.id}
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative h-full"
                            onClick={() => handleToolClick(tool)}
                        >
                            <div className={`absolute -inset-0.5 bg-gradient-to-b from-${color}-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500`} />
                            <div className={`relative h-full bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col gap-6 cursor-pointer hover:shadow-2xl hover:shadow-${color}-500/10 transition-all`}>
                                <div className="flex items-center justify-between">
                                    <div className={`w-14 h-14 rounded-2xl bg-${color}-500/10 flex items-center justify-center text-${color}-600 dark:text-${color}-400 ring-1 ring-${color}-500/20 group-hover:bg-${color}-500 group-hover:text-white transition-all duration-500 shadow-inner`}>
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    {!isPremium && tool.requiresPremium && <Lock className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                                </div>
                                <div>
                                    <span className="block text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                                        {getToolTitle(tool)}
                                    </span>
                                    <span className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed block">
                                        {tool.description}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
