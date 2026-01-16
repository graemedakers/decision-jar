"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { CONCIERGE_CONFIGS } from "@/lib/concierge-configs";
import { ConciergeToolConfig } from "./GenericConciergeModal";

interface ConciergeSkillPickerProps {
    onSelectSkill: (config: ConciergeToolConfig) => void;
    currentSkillId?: string;
}

// Organize skills into categories
const SKILL_CATEGORIES = {
    "Food & Drink": ["DINING", "BAR", "BAR_CRAWL", "NIGHTCLUB", "CHEF"],
    "Entertainment": ["MOVIE", "BOOK", "THEATRE", "GAME", "ESCAPE_ROOM"],
    "Travel & Events": ["HOLIDAY", "HOTEL", "WEEKEND_EVENTS", "SPORTS"],
    "Wellness & Fitness": ["WELLNESS", "FITNESS"],
    "Planning": ["DATE_NIGHT", "CONCIERGE"]
};

export function ConciergeSkillPicker({ onSelectSkill, currentSkillId }: ConciergeSkillPickerProps) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                    What can I help you with?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Choose a category or just tell me what you need
                </p>
            </div>

            {Object.entries(SKILL_CATEGORIES).map(([category, skillIds]) => (
                <div key={category} className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {category}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {skillIds.map((skillId) => {
                            const config = CONCIERGE_CONFIGS[skillId];
                            if (!config) return null;

                            const Icon = config.icon;
                            const isActive = currentSkillId === skillId;

                            return (
                                <motion.button
                                    key={skillId}
                                    onClick={() => onSelectSkill(config)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`
                                        relative p-3 rounded-xl border transition-all text-left
                                        ${isActive
                                            ? `bg-${config.colorTheme}-500 text-white border-${config.colorTheme}-600 shadow-lg`
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`
                                            w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                            ${isActive 
                                                ? 'bg-white/20' 
                                                : `bg-${config.colorTheme}-100 dark:bg-${config.colorTheme}-500/20`
                                            }
                                        `}>
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : `text-${config.colorTheme}-600 dark:text-${config.colorTheme}-400`}`} />
                                        </div>
                                        <span className={`text-sm font-semibold leading-tight ${isActive ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {config.title.replace(' Concierge', '').replace(' Scout', '').replace(' Finder', '').replace(' Planner', '')}
                                        </span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
