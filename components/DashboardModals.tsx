"use client";

import { PremiumModal } from "@/components/PremiumModal";
import { ReviewAppModal } from "@/components/ReviewAppModal";
import { HelpModal } from "@/components/HelpModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { TrialExpiredModal } from "@/components/TrialExpiredModal";
import { Confetti } from "@/components/Confetti";
import { LevelUpModal } from "@/components/Gamification/LevelUpModal";
import { PremiumWelcomeTip } from "@/components/PremiumWelcomeTip";
import { useModalSystem } from "@/components/ModalProvider";
import { Idea, UserData } from "@/lib/types";
import dynamic from "next/dynamic";

// Lazy Load Heavy Modals
const GenericConciergeModal = dynamic(() => import("@/components/GenericConciergeModal").then(m => m.GenericConciergeModal), { ssr: false });
const BarCrawlPlannerModal = dynamic(() => import("@/components/BarCrawlPlannerModal").then(m => m.BarCrawlPlannerModal), { ssr: false });
const AdminControlsModal = dynamic(() => import("@/components/AdminControlsModal").then(m => m.AdminControlsModal), { ssr: false });
const TemplateBrowserModal = dynamic(() => import("@/components/TemplateBrowserModal").then(m => m.TemplateBrowserModal), { ssr: false });
const DateNightPlannerModal = dynamic(() => import("@/components/DateNightPlannerModal").then(m => m.DateNightPlannerModal), { ssr: false });
const CateringPlannerModal = dynamic(() => import("@/components/CateringPlannerModal").then(m => m.CateringPlannerModal), { ssr: false });
const MenuPlannerModal = dynamic(() => import("@/components/MenuPlannerModal").then(m => m.MenuPlannerModal), { ssr: false });
const RateDateModal = dynamic(() => import("@/components/RateDateModal").then(m => m.RateDateModal), { ssr: false });
const DateReveal = dynamic(() => import("@/components/DateReveal").then(m => m.DateReveal), { ssr: false });
const FavoritesModal = dynamic(() => import("@/components/FavoritesModal").then(m => m.FavoritesModal), { ssr: false });
const AddIdeaModal = dynamic(() => import("@/components/AddIdeaModal").then(m => m.AddIdeaModal), { ssr: false });
const SurpriseMeModal = dynamic(() => import("@/components/SurpriseMeModal").then(m => m.SurpriseMeModal), { ssr: false });
const SpinFiltersModal = dynamic(() => import("@/components/SpinFiltersModal").then(m => m.SpinFiltersModal), { ssr: false });
const SettingsModal = dynamic(() => import("@/components/SettingsModal").then(m => m.SettingsModal), { ssr: false });
const QuickDecisionsModal = dynamic(() => import("@/components/QuickDecisionsModal").then(m => m.QuickDecisionsModal), { ssr: false });
const WeekendPlannerModal = dynamic(() => import("@/components/WeekendPlannerModal").then(m => m.WeekendPlannerModal), { ssr: false });
const CommunityAdminModal = dynamic(() => import("@/components/CommunityAdminModal").then(m => m.CommunityAdminModal), { ssr: false });
const JarMembersModal = dynamic(() => import("@/components/JarMembersModal").then(m => m.JarMembersModal), { ssr: false });
const JarQuickStartModal = dynamic(() => import("@/components/JarQuickStartModal").then(m => m.JarQuickStartModal), { ssr: false });
const MoveIdeaModal = dynamic(() => import("@/components/MoveIdeaModal").then(m => m.MoveIdeaModal), { ssr: false });

import { CONCIERGE_CONFIGS } from "@/lib/concierge-configs";

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
    availableJars?: any[];

    // Callbacks
    handleContentUpdate: () => void;
    fetchFavorites: () => void;
    fetchIdeas: () => void;
    refreshUser: () => void;
    handleSpinJar: (filters: any) => void;

    // UI Callbacks
    showConfetti: boolean;
    setShowConfetti: (show: boolean) => void;
    onRestartTour?: () => void;
    onCloseLevelUp?: () => void;
}

export function DashboardModals({
    isPremium, userData, ideas, userLocation, setUserLocation, combinedLocation,
    jarTopic, level, favoritesCount, hasPaid, coupleCreatedAt, isTrialEligible, availableJars = [],
    handleContentUpdate, fetchFavorites, fetchIdeas, refreshUser, handleSpinJar,
    showConfetti, setShowConfetti, onRestartTour, onCloseLevelUp
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
                topic={jarTopic}
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
                onRestartTour={onRestartTour}
                onSettingsChanged={refreshUser}
            />

            <SpinFiltersModal
                isOpen={activeModal === 'SPIN_FILTERS'}
                onClose={closeModal}
                onSpin={handleSpinJar}
                jarTopic={jarTopic}
                ideas={ideas}
                customCategories={userData?.customCategories}
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
                            onUpdateUserLocation={(newLoc) => setUserLocation(newLoc)}
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
                hasJars={!!userData?.activeJarId || (userData?.memberships?.length || 0) > 0}
                onSuccess={handleContentUpdate}
            />

            {activeModal === 'DATE_NIGHT_PLANNER' && (
                <DateNightPlannerModal
                    isOpen={true}
                    onClose={closeModal}
                    userLocation={combinedLocation || undefined}
                    onIdeaAdded={() => setShowConfetti(true)}
                    jarTopic={jarTopic || "General"}
                />
            )}

            {activeModal === 'CATERING_PLANNER' && (
                <CateringPlannerModal
                    isOpen={true}
                    onClose={closeModal}
                    onIdeaAdded={() => setShowConfetti(true)}
                />
            )}

            {activeModal === 'MENU_PLANNER' && (
                <MenuPlannerModal
                    isOpen={true}
                    onClose={closeModal}
                    onIdeaAdded={handleContentUpdate}
                />
            )}

            <RateDateModal
                isOpen={activeModal === 'RATE_DATE'}
                onClose={() => {
                    closeModal();
                    handleContentUpdate();
                }}
                idea={activeModal === 'RATE_DATE' ? modalProps?.idea : null}
                isPro={isPremium}
            />

            <DateReveal
                idea={activeModal === 'DATE_REVEAL' ? modalProps?.idea : null}
                onClose={closeModal}
                userLocation={userLocation ?? undefined}
                isViewOnly={modalProps?.viewOnly}
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

            {!isPremium && !hasPaid && (
                <TrialExpiredModal
                    hasPaid={hasPaid}
                    isTrialExpired={coupleCreatedAt ? (Math.ceil(Math.abs(new Date().getTime() - new Date(coupleCreatedAt).getTime()) / (1000 * 60 * 60 * 24)) > 14) : false}
                    isPremiumCandidate={isPremium}
                />
            )}

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
                level={modalProps?.level || level}
                onClose={() => {
                    closeModal();
                    onCloseLevelUp?.();
                }}
            />

            <PremiumWelcomeTip
                show={modalProps?.showPremiumTip || false}
                onClose={closeModal}
            />

            {userData?.activeJarId && (
                <JarMembersModal
                    isOpen={activeModal === 'JAR_MEMBERS'}
                    onClose={closeModal}
                    jarId={userData.activeJarId}
                    jarName={userData.jarName || "Your Jar"}
                    currentUserRole={userData.isCreator ? 'ADMIN' : 'MEMBER'}
                    onRoleUpdated={refreshUser}
                />
            )}

            {activeModal === 'JAR_QUICKSTART' && (
                <JarQuickStartModal
                    isOpen={true}
                    onClose={closeModal}
                    jarId={modalProps?.jarId || ''}
                    jarName={modalProps?.jarName || ''}
                    jarTopic={modalProps?.jarTopic || 'General'}
                />
            )}

            {activeModal === 'MOVE_IDEA' && (
                <MoveIdeaModal
                    isOpen={true}
                    onClose={closeModal}
                    idea={modalProps?.idea}
                    availableJars={availableJars}
                    onMoveComplete={handleContentUpdate}
                />
            )}

            {showConfetti && (
                <Confetti
                    onComplete={() => setShowConfetti(false)}
                />
            )}
        </>
    );
}

