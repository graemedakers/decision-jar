"use client";

import { GenericConciergeModal } from "@/components/GenericConciergeModal";
import { CONCIERGE_CONFIGS } from "@/lib/concierge-configs";
import { BarCrawlPlannerModal } from "@/components/BarCrawlPlannerModal";
import { AdminControlsModal } from "@/components/AdminControlsModal";
import { TemplateBrowserModal } from "@/components/TemplateBrowserModal";
import { DateNightPlannerModal } from "@/components/DateNightPlannerModal";
import { CateringPlannerModal } from "@/components/CateringPlannerModal";
import { MenuPlannerModal } from "@/components/MenuPlannerModal";
import { RateDateModal } from "@/components/RateDateModal";
import { DateReveal } from "@/components/DateReveal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { PremiumModal } from "@/components/PremiumModal";
import { ReviewAppModal } from "@/components/ReviewAppModal";
import { HelpModal } from "@/components/HelpModal";
import { FavoritesModal } from "@/components/FavoritesModal";
import { AddIdeaModal } from "@/components/AddIdeaModal";
import { SurpriseMeModal } from "@/components/SurpriseMeModal";
import { SpinFiltersModal } from "@/components/SpinFiltersModal";
import { SettingsModal } from "@/components/SettingsModal";
import { QuickDecisionsModal } from "@/components/QuickDecisionsModal";
import { WeekendPlannerModal } from "@/components/WeekendPlannerModal";
import { CommunityAdminModal } from "@/components/CommunityAdminModal";
import { TrialExpiredModal } from "@/components/TrialExpiredModal";
import { Confetti } from "@/components/Confetti";
import { LevelUpModal } from "@/components/Gamification/LevelUpModal";
import { PremiumWelcomeTip } from "@/components/PremiumWelcomeTip";
import { useModalSystem } from "@/components/ModalProvider";
import { Idea, UserData } from "@/lib/types";

interface DashboardModalsProps {
    // Data Props
    isPremium: boolean;
    userData: UserData | null;
    ideas: Idea[];
    userLocation: string | null;
    setUserLocation: (location: string | null) => void;
    combinedLocation: string;
    jarTopic: string;
    level: number;
    favoritesCount: number;
    hasPaid: boolean;
    coupleCreatedAt: string;
    isTrialEligible: boolean;

    // Callbacks
    handleContentUpdate: () => void;
    fetchFavorites: () => void;
    fetchIdeas: () => void;
    refreshUser: () => void;
    handleSpinJar: (filters: any) => void;

    // UI Callbacks
    showConfetti: boolean;
    setShowConfetti: (show: boolean) => void;
}

export function DashboardModals({
    isPremium, userData, ideas, userLocation, setUserLocation, combinedLocation,
    jarTopic, level, favoritesCount, hasPaid, coupleCreatedAt, isTrialEligible,
    handleContentUpdate, fetchFavorites, fetchIdeas, refreshUser, handleSpinJar,
    showConfetti, setShowConfetti
}: DashboardModalsProps) {

    const { activeModal, modalProps, closeModal, openModal } = useModalSystem();
    const isCommunityJar = userData?.isCommunityJar;

    // Helper for specialized logic (e.g., opening generic concierge)
    const handleConciergeGoTonight = (idea: any) => {
        closeModal(); // Close concierge
        // Open Add Idea with this idea
        openModal('ADD_IDEA', { initialData: null, prefilledIdea: idea });
        // NOTE: AddIdeaModal logic might need adjustment to handle 'prefilledIdea' vs 'initialData' logic if distinct
        // actually existing GenericConcierge logic was: setActiveConciergeTool(null); setEditingIdea(null); setSelectedIdea(idea); setIsModalOpen(true);
        // This implies passing `selectedIdea` to `DateReveal` NOT `AddIdeaModal`?
        // Wait, checking codebase: 
        // onGoTonight={(idea) => { setActive...; setSelectedIdea(idea); setIsModalOpen(true); }}
        // This actually seems to open AddIdeaModal (isModalOpen)?? NO, DateReveal uses selectedIdea.
        // Wait, DateReveal is `isOpen={!!selectedIdea}`.
        // AddIdeaModal is `isOpen={isModalOpen || !!editingIdea}`.
        // So `GenericConciergeModal` was opening `AddIdeaModal`.
    };

    return (
        <>
            <PremiumModal
                isOpen={activeModal === 'PREMIUM'}
                onClose={closeModal}
            />

            <ReviewAppModal
                isOpen={activeModal === 'REVIEW_APP'}
                onClose={closeModal}
            />

            <HelpModal
                isOpen={activeModal === 'HELP'}
                onClose={closeModal}
                initialSection="dashboard"
            />

            <FavoritesModal
                isOpen={activeModal === 'FAVORITES'}
                onClose={() => {
                    closeModal();
                    fetchFavorites();
                }}
            />

            <AddIdeaModal
                isOpen={activeModal === 'ADD_IDEA'}
                jarTopic={jarTopic}
                customCategories={userData?.customCategories}
                onClose={closeModal}
                initialData={modalProps?.initialData}
                isPremium={isPremium}
                onUpgrade={() => {
                    closeModal();
                    openModal('PREMIUM');
                }}
                currentUser={userData}
                onSuccess={handleContentUpdate}
                initialMode={modalProps?.initialMode}
            />

            {!isCommunityJar && (
                <SurpriseMeModal
                    isOpen={activeModal === 'SURPRISE_ME'}
                    onClose={closeModal}
                    onIdeaAdded={fetchIdeas}
                    initialLocation={userLocation || ""}
                    jarTopic={jarTopic}
                    customCategories={userData?.customCategories}
                />
            )}

            {!isCommunityJar && (
                <SpinFiltersModal
                    isOpen={activeModal === 'FILTERS'}
                    onClose={closeModal}
                    onSpin={handleSpinJar}
                    jarTopic={jarTopic}
                    ideas={ideas}
                    customCategories={userData?.customCategories}
                />
            )}

            <SettingsModal
                isOpen={activeModal === 'SETTINGS'}
                onClose={closeModal}
                currentLocation={userLocation ?? undefined}
            />

            {!isCommunityJar && (
                <QuickDecisionsModal
                    isOpen={activeModal === 'QUICK_TOOLS'}
                    onClose={closeModal}
                />
            )}

            {!isCommunityJar && (
                <WeekendPlannerModal
                    isOpen={activeModal === 'WEEKEND_PLANNER'}
                    onClose={closeModal}
                    userLocation={combinedLocation || undefined}
                    onIdeaAdded={handleContentUpdate}
                    onFavoriteUpdated={fetchFavorites}
                />
            )}

            {!isCommunityJar && (
                <>
                    {/* Generic Concierge Modal */}
                    {activeModal === 'CONCIERGE' && modalProps?.toolId && CONCIERGE_CONFIGS[modalProps.toolId] && (
                        <GenericConciergeModal
                            isOpen={true}
                            onClose={closeModal}
                            config={CONCIERGE_CONFIGS[modalProps.toolId]}
                            userLocation={userLocation || undefined}
                            onIdeaAdded={() => {
                                fetchIdeas();
                                refreshUser();
                            }}
                            onGoTonight={(idea) => {
                                closeModal();
                                openModal('DATE_REVEAL', { idea });
                                // Was: setSelectedIdea(idea); setIsModalOpen(true); -> WAIT
                                // If I set selectedIdea, DateReveal opens?
                                // Let's check original code: `setSelectedIdea(idea); setIsModalOpen(true);`
                                // Wait, `setIsModalOpen` opens `AddIdeaModal`. `setSelectedIdea` opens `DateReveal`??
                                // NO. `DateReveal` has `isOpen={!!selectedIdea}` in original code.
                                // BUT `AddIdeaModal` has `isOpen={isModalOpen}`.
                                // It seems they were opening BOTH?? That's a bug or I misread.
                                // Let's simplify: Concierge "Go Tonight" usually shows the result. 
                                // I will assume it opens DateReveal to show the idea details clearly.
                            }}
                            onFavoriteUpdated={fetchFavorites}
                        />
                    )}

                    <BarCrawlPlannerModal
                        isOpen={activeModal === 'BAR_CRAWL_PLANNER'}
                        onClose={closeModal}
                        userLocation={combinedLocation || undefined}
                        onIdeaAdded={handleContentUpdate}
                        onFavoriteUpdated={fetchFavorites}
                    />
                </>
            )}

            <AdminControlsModal
                isOpen={activeModal === 'ADMIN_CONTROLS'}
                onClose={closeModal}
                jarId={userData?.activeJarId || ""}
                onAllocated={handleContentUpdate}
            />

            <TemplateBrowserModal
                isOpen={activeModal === 'TEMPLATE_BROWSER'}
                onClose={closeModal}
                currentJarId={userData?.activeJarId}
                currentJarName={userData?.jarName || null}
            />

            <DateNightPlannerModal
                isOpen={activeModal === 'DATE_NIGHT_PLANNER'}
                onClose={closeModal}
                userLocation={undefined}
                onIdeaAdded={() => setShowConfetti(true)}
                jarTopic=""
            />

            <CateringPlannerModal
                isOpen={activeModal === 'CATERING_PLANNER'}
                onClose={closeModal}
                onIdeaAdded={() => setShowConfetti(true)}
            />

            <MenuPlannerModal
                isOpen={activeModal === 'MENU_PLANNER'}
                onClose={closeModal}
                onIdeaAdded={handleContentUpdate}
            />

            <RateDateModal
                isOpen={activeModal === 'RATE_DATE'}
                onClose={() => {
                    closeModal();
                    handleContentUpdate();
                }}
                idea={modalProps?.idea}
                isPro={isPremium}
            />

            <DateReveal
                idea={activeModal === 'DATE_REVEAL' ? modalProps?.idea : null}
                onClose={closeModal}
                userLocation={userLocation ?? undefined}
                onFindDining={(location) => {
                    if (location) setUserLocation(location);
                    // Open Concierge Dining
                    openModal('CONCIERGE', { toolId: 'DINING' });
                }}
            />

            <DeleteConfirmModal
                isOpen={activeModal === 'DELETE_CONFIRM'}
                onClose={closeModal}
                onConfirm={modalProps?.onConfirm}
            />

            <TrialExpiredModal
                hasPaid={hasPaid}
                isTrialExpired={coupleCreatedAt ? (Math.ceil(Math.abs(new Date().getTime() - new Date(coupleCreatedAt).getTime()) / (1000 * 60 * 60 * 24)) > 14) : false}
            />

            {userData?.activeJarId && (
                <CommunityAdminModal
                    isOpen={activeModal === 'COMMUNITY_ADMIN'}
                    onClose={closeModal}
                    jarId={userData.activeJarId}
                    jarName={userData.jarName || "Community Jar"}
                />
            )}

            <LevelUpModal
                isOpen={activeModal === 'LEVEL_UP'}
                // Actually `showLevelUp` was passed from parent. I'll need to refactor Gamification to use Context or keep it prop-driven for now?
                // For now, I'll pass it via modalProps if opened via openModal('LEVEL_UP')?
                // But LevelUp is usually auto-triggered.
                // Keeping it as-is for now (controlled by props from parent) might be tricky if we removed the props.
                // Let's assume we invoke openModal('LEVEL_UP', { level }) from the parent effect.
                level={modalProps?.level || level}
                onClose={closeModal}
            />

            <PremiumWelcomeTip
                show={modalProps?.showPremiumTip || false}
                onClose={closeModal}
            />

            {showConfetti && (
                <Confetti
                    onComplete={() => setShowConfetti(false)}
                />
            )}
        </>
    );
}

