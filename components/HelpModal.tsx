"use client";

import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, MapPin, Plus, Sparkles, History, Settings, HelpCircle, Calendar, Utensils, Wine, Compass, RefreshCcw, Pencil, ExternalLink, Trophy, Users, Disc, Bed, Clapperboard, Leaf, Dumbbell, Ticket, Brain, Gamepad2, Crown, Shield, Layers, Key, Share2, MousePointer2, Bell, Gift, Ghost } from "lucide-react";
import { useState, useEffect } from "react";

// Section Components
import { IntroSection } from "./help/sections/IntroSection";
import { GettingStartedSection } from "./help/sections/GettingStartedSection";
import { AdminRolesSection } from "./help/sections/AdminRolesSection";
import { ManageJarsSection } from "./help/sections/ManageJarsSection";
import { SelectionModesSection } from "./help/sections/SelectionModesSection";
import { OrganizeLifeSection } from "./help/sections/OrganizeLifeSection";
import { TaskAllocationSection } from "./help/sections/TaskAllocationSection";
import { ExploreTabSection } from "./help/sections/ExploreTabSection";
import { DashboardSection } from "./help/sections/DashboardSection";
import { GamificationSection } from "./help/sections/GamificationSection";
import { NotificationsSection } from "./help/sections/NotificationsSection";
import { DateNightPlannerSection } from "./help/sections/DateNightPlannerSection";
import { ActivityPlannerSection } from "./help/sections/ActivityPlannerSection";
import { DiningConciergeSection } from "./help/sections/DiningConciergeSection";
import { ConciergeListSection } from "./help/sections/ConciergeListSection";
import { AddingIdeasSection } from "./help/sections/AddingIdeasSection";
import { StructuredIdeasSection } from "./help/sections/StructuredIdeasSection";
import { WeekendPlannerSection } from "./help/sections/WeekendPlannerSection";
import { CateringPlannerSection } from "./help/sections/CateringPlannerSection";
import { JarGiftingSection } from "./help/sections/JarGiftingSection";
import { PremiumStatusSection } from "./help/sections/PremiumStatusSection";
import { PremiumShortcutsSection } from "./help/sections/PremiumShortcutsSection";
import { SpinningSection } from "./help/sections/SpinningSection";
import { HistorySection } from "./help/sections/HistorySection";
import { SettingsSection } from "./help/sections/SettingsSection";

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSection?: string;
}

export function HelpModal({ isOpen, onClose, initialSection }: HelpModalProps) {
    const [activeSection, setActiveSection] = useState(initialSection || "intro");

    useEffect(() => {
        if (isOpen && initialSection) {
            setActiveSection(initialSection);
        }
    }, [isOpen, initialSection]);

    const sections = [
        { id: "intro", title: "Introduction", icon: BookOpen },
        { id: "getting-started", title: "Getting Started", icon: MapPin },
        { id: "admin-roles", title: "Admin & Roles", icon: Crown },
        { id: "community", title: "Manage Jars", icon: Users },
        { id: "selection-modes", title: "Selection Modes", icon: RefreshCcw },
        { id: "organize-life", title: "Organizing Your Life", icon: Layers },
        { id: "task-allocation", title: "Task Allocation", icon: Shield },
        { id: "explore", title: "The Explore Tab", icon: Compass },
        { id: "dashboard", title: "The Dashboard", icon: History },
        { id: "gamification", title: "Levels & XP", icon: Trophy },
        { id: "notifications", title: "Notifications", icon: Bell },
        { id: "date-night-planner", title: "Night Out Planner", icon: Compass },
        { id: "activity-planner", title: "Activity Planner", icon: Brain },
        { id: "dining-concierge", title: "Dining Concierge", icon: Utensils },
        { id: "bar-concierge", title: "Bar Scout", icon: Wine },
        { id: "nightclub-concierge", title: "Nightclub Scout", icon: Disc },
        { id: "theatre-concierge", title: "Theatre Scout", icon: Ticket },
        { id: "movie-concierge", title: "Movie Scout", icon: Clapperboard },
        { id: "hotel-concierge", title: "Hotel Finder", icon: Bed },
        { id: "game-concierge", title: "Game Scout", icon: Gamepad2 },
        { id: "escape-room-concierge", title: "Escape Room Scout", icon: Key },
        { id: "sports-concierge", title: "Sports Scout", icon: Trophy },
        { id: "wellness-concierge", title: "Wellness & Spa", icon: Leaf },
        { id: "fitness-concierge", title: "Fitness Finder", icon: Dumbbell },
        { id: "premium-shortcuts", title: "Premium Shortcuts", icon: Share2 },
        { id: "adding-ideas", title: "Adding Ideas", icon: Plus },
        { id: "structured-ideas", title: "Structured Ideas", icon: Layers },
        { id: "weekend-planner", title: "Weekend Planner", icon: Calendar },
        { id: "catering-planner", title: "Dinner Party Chef", icon: Utensils },
        { id: "jar-gifting", title: "Jar Gifting", icon: Gift },
        { id: "premium-status", title: "Premium & Support", icon: Sparkles },
        { id: "spinning", title: "Spinning the Jar", icon: Sparkles },
        { id: "history", title: "Archive & History", icon: History },
        { id: "settings", title: "Settings", icon: Settings },
    ];

    const renderContent = () => {
        const commonProps = {};

        switch (activeSection) {
            case "intro": return <IntroSection />;
            case "getting-started": return <GettingStartedSection />;
            case "admin-roles": return <AdminRolesSection />;
            case "community": return <ManageJarsSection />;
            case "selection-modes": return <SelectionModesSection />;
            case "organize-life": return <OrganizeLifeSection />;
            case "task-allocation": return <TaskAllocationSection />;
            case "explore": return <ExploreTabSection />;
            case "dashboard": return <DashboardSection />;
            case "gamification": return <GamificationSection />;
            case "notifications": return <NotificationsSection />;
            case "date-night-planner": return <DateNightPlannerSection />;
            case "activity-planner": return <ActivityPlannerSection />;
            case "dining-concierge": return <DiningConciergeSection />;
            case "bar-concierge":
            case "nightclub-concierge":
            case "theatre-concierge":
            case "movie-concierge":
            case "hotel-concierge":
            case "game-concierge":
            case "escape-room-concierge":
            case "sports-concierge":
            case "wellness-concierge":
            case "fitness-concierge":
                return <ConciergeListSection />;
            case "premium-shortcuts": return <PremiumShortcutsSection />;
            case "adding-ideas": return <AddingIdeasSection onNavigate={setActiveSection} />;
            case "structured-ideas": return <StructuredIdeasSection />;
            case "weekend-planner": return <WeekendPlannerSection />;
            case "catering-planner": return <CateringPlannerSection />;
            case "jar-gifting": return <JarGiftingSection />;
            case "premium-status": return <PremiumStatusSection />;
            case "spinning": return <SpinningSection />;
            case "history": return <HistorySection />;
            case "settings": return <SettingsSection />;
            default: return null;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card w-full max-w-4xl h-[90vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:text-white/50 dark:hover:text-white transition-colors z-20"
                            aria-label="Close Help"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Sidebar */}
                        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 py-4 md:p-4 shrink-0 flex flex-col md:overflow-y-auto custom-scrollbar">
                            <div className="flex items-center gap-2 mb-4 md:mb-6 px-6 md:px-2 pr-14 md:pr-2 shrink-0">
                                <HelpCircle className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white whitespace-nowrap">Help Center</h2>
                            </div>
                            <nav className="flex flex-row md:flex-col gap-2 md:gap-0 md:space-y-1 overflow-x-auto md:overflow-y-visible px-6 md:px-0 pb-2 md:pb-0 min-h-0 no-scrollbar snap-x">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-full md:rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 snap-start border ${activeSection === section.id
                                            ? "bg-primary text-white border-primary shadow-md"
                                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 border-transparent"
                                            }`}
                                        aria-label={`View ${section.title} section`}
                                        aria-current={activeSection === section.id ? 'true' : undefined}
                                    >
                                        <section.icon className="w-4 h-4" />
                                        {section.title}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-white/80 to-transparent dark:from-white/5 dark:to-transparent">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
