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

const AdminControlsModal = dynamic(() => import("@/components/AdminControlsModal").then(m => m.AdminControlsModal), { ssr: false });
const TemplateBrowserModal = dynamic(() => import("@/components/TemplateBrowserModal").then(m => m.TemplateBrowserModal), { ssr: false });



const RateDateModal = dynamic(() => import("@/components/RateDateModal").then(m => m.RateDateModal), { ssr: false });
const DateReveal = dynamic(() => import("@/components/DateReveal").then(m => m.DateReveal), { ssr: false });
const FavoritesModal = dynamic(() => import("@/components/FavoritesModal").then(m => m.FavoritesModal), { ssr: false });
const AddIdeaModal = dynamic(() => import("@/components/AddIdeaModal").then(m => m.AddIdeaModal), { ssr: false });
const SurpriseMeModal = dynamic(() => import("@/components/SurpriseMeModal").then(m => m.SurpriseMeModal), { ssr: false });
const SpinFiltersModal = dynamic(() => import("@/components/SpinFiltersModal").then(m => m.SpinFiltersModal), { ssr: false });
// ... (imports)
const SettingsModal = dynamic(() => import("@/components/SettingsModal").then(m => m.SettingsModal), { ssr: false });

const JarMembersModal = dynamic(() => import("@/components/JarMembersModal").then(m => m.JarMembersModal), { ssr: false });
const JarQuickStartModal = dynamic(() => import("@/components/JarQuickStartModal").then(m => m.JarQuickStartModal), { ssr: false });
const MoveIdeaModal = dynamic(() => import("@/components/MoveIdeaModal").then(m => m.MoveIdeaModal), { ssr: false });
const ToolsModal = dynamic(() => import("@/components/ToolsModal").then(m => m.ToolsModal), { ssr: false });
const AddMemoryModal = dynamic(() => import("@/components/AddMemoryModal").then(m => m.AddMemoryModal), { ssr: false });
const CreateJarModal = dynamic(() => import("@/components/CreateJarModal").then(m => m.CreateJarModal), { ssr: false });
const JoinJarModal = dynamic(() => import("@/components/JoinJarModal").then(m => m.JoinJarModal), { ssr: false });
const GiftJarModal = dynamic(() => import("@/components/GiftJarModal").then(m => m.GiftJarModal), { ssr: false });
const MyGiftsModal = dynamic(() => import("@/components/MyGiftsModal").then(m => m.MyGiftsModal), { ssr: false });
const BulkIdeaPreviewModal = dynamic(() => import("@/components/BulkIdeaPreviewModal").then(m => m.BulkIdeaPreviewModal), { ssr: false });

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

    const { activeModal, modalProps, closeModal, openModal, isModalOpen, getModalProps } = useModalSystem();

    // ... helper functions

    return (
        <>
            <PremiumModal
                isOpen={isModalOpen('PREMIUM')}
                onClose={closeModal}
            />

            {isModalOpen('GIFT_JAR') && (
                <GiftJarModal
                    jarId={getModalProps('GIFT_JAR').jarId}
                    jarName={getModalProps('GIFT_JAR').jarName}
                    ideaCount={getModalProps('GIFT_JAR').ideaCount}
                />
            )}

            {isModalOpen('MY_GIFTS') && <MyGiftsModal />}

            <ReviewAppModal
                isOpen={isModalOpen('REVIEW_APP')}
                onClose={closeModal}
            />

            <HelpModal
                isOpen={isModalOpen('HELP')}
                onClose={closeModal}
                initialSection="dashboard"
            />

            <FavoritesModal
                isOpen={isModalOpen('FAVORITES')}
                topic={jarTopic}
                onClose={() => {
                    closeModal();
                    fetchFavorites();
                }}
            />

            <AddIdeaModal
                isOpen={isModalOpen('ADD_IDEA')}
                jarTopic={jarTopic}
                customCategories={userData?.customCategories}
                onClose={closeModal}
                initialData={getModalProps('ADD_IDEA')?.initialData}
                isPremium={isPremium}
                onUpgrade={() => {
                    closeModal();
                    openModal('PREMIUM');
                }}
                currentUser={userData}
                onSuccess={handleContentUpdate}
                initialMode={getModalProps('ADD_IDEA')?.initialMode}
                availableJars={availableJars}
            />

            {/* Surprise Me - Using original modal (reverted from WizardFrame) */}
            <SurpriseMeModal
                isOpen={isModalOpen('SURPRISE_ME')}
                onClose={closeModal}
                onIdeaAdded={fetchIdeas}
                initialLocation={userLocation || ""}
                jarTopic={jarTopic}
                customCategories={userData?.customCategories}
                defaultIdeaPrivate={userData?.defaultIdeaPrivate}
            />

            <SpinFiltersModal
                isOpen={isModalOpen('FILTERS')}
                onClose={closeModal}
                onSpin={handleSpinJar}
                jarTopic={jarTopic}
                ideas={ideas}
                customCategories={userData?.customCategories}
            />

            <SettingsModal
                isOpen={isModalOpen('SETTINGS')}
                onClose={closeModal}
                currentLocation={userLocation ?? undefined}
                onRestartTour={onRestartTour}
                onSettingsChanged={refreshUser}
            />

            <SpinFiltersModal
                isOpen={isModalOpen('SPIN_FILTERS')}
                onClose={closeModal}
                onSpin={handleSpinJar}
                jarTopic={jarTopic}
                ideas={ideas}
                customCategories={userData?.customCategories}
            />



            {isModalOpen('WEEKEND_PLANNER') && (
                <GenericConciergeModal
                    isOpen={true}
                    onClose={closeModal}
                    config={CONCIERGE_CONFIGS.WEEKEND_EVENTS}
                    userLocation={userLocation || undefined}
                    availableJars={availableJars}
                    currentJarId={userData?.activeJarId || null}
                    onIdeaAdded={handleContentUpdate}
                    onGoTonight={(idea) => {
                        closeModal();
                        openModal('DATE_REVEAL', { idea, isDirectSelection: true });
                    }}
                    onFavoriteUpdated={fetchFavorites}
                    onUpdateUserLocation={(newLoc) => setUserLocation(newLoc)}
                    isPremium={isPremium}
                />
            )}

            {/* Generic Concierge Modal - Now supports skill picker when no toolId */}
            {isModalOpen('CONCIERGE') && (
                <GenericConciergeModal
                    key={getModalProps('CONCIERGE')?.toolId || 'unified'}
                    isOpen={true}
                    onClose={closeModal}
                    config={getModalProps('CONCIERGE')?.toolId ? CONCIERGE_CONFIGS[getModalProps('CONCIERGE').toolId] : undefined}
                    skillId={getModalProps('CONCIERGE')?.toolId}
                    userLocation={userLocation || undefined}
                    initialPrompt={getModalProps('CONCIERGE')?.initialPrompt}
                    isPremium={isPremium}
                    availableJars={availableJars}
                    currentJarId={userData?.activeJarId || null}
                    onIdeaAdded={() => {
                        fetchIdeas();
                        refreshUser();
                    }}
                    onGoTonight={(idea) => {
                        closeModal();
                        if (idea.ideaType === 'recipe' || getModalProps('CONCIERGE')?.toolId === 'RECIPE') {
                            openModal('ADD_IDEA', {
                                initialData: { ...idea, ideaType: 'recipe' }, // Explicitly force type to be safe
                                initialMode: 'default'
                            });
                        } else {
                            openModal('DATE_REVEAL', { idea, isDirectSelection: true });
                        }
                    }}
                    onFavoriteUpdated={fetchFavorites}
                    onUpdateUserLocation={(newLoc) => setUserLocation(newLoc)}
                />
            )}

            {isModalOpen('BAR_CRAWL_PLANNER') && (
                <GenericConciergeModal
                    isOpen={true}
                    onClose={closeModal}
                    config={CONCIERGE_CONFIGS.BAR_CRAWL}
                    userLocation={userLocation || undefined}
                    availableJars={availableJars}
                    currentJarId={userData?.activeJarId || null}
                    onIdeaAdded={handleContentUpdate}
                    onGoTonight={(idea) => {
                        closeModal();
                        openModal('DATE_REVEAL', { idea, isDirectSelection: true });
                    }}
                    onFavoriteUpdated={fetchFavorites}
                    onUpdateUserLocation={(newLoc) => setUserLocation(newLoc)}
                    isPremium={isPremium}
                />
            )}

            <AdminControlsModal
                isOpen={isModalOpen('ADMIN_CONTROLS')}
                onClose={closeModal}
                jarId={userData?.activeJarId || ""}
                onAllocated={handleContentUpdate}
            />

            <TemplateBrowserModal
                isOpen={isModalOpen('TEMPLATE_BROWSER')}
                onClose={closeModal}
                currentJarId={userData?.activeJarId}
                currentJarName={userData?.jarName || null}
                hasJars={!!userData?.activeJarId || (userData?.memberships?.length || 0) > 0}
                currentJarIdeaCount={ideas.length} // ✅ NEW: Pass idea count
                onSuccess={handleContentUpdate}
            />

            {isModalOpen('DATE_NIGHT_PLANNER') && (
                <GenericConciergeModal
                    isOpen={true}
                    onClose={closeModal}
                    config={CONCIERGE_CONFIGS.DATE_NIGHT}
                    userLocation={userLocation || undefined}
                    availableJars={availableJars}
                    currentJarId={userData?.activeJarId || null}
                    onIdeaAdded={handleContentUpdate}
                    onGoTonight={(idea) => {
                        closeModal();
                        openModal('DATE_REVEAL', { idea, isDirectSelection: true });
                    }}
                    onFavoriteUpdated={fetchFavorites}
                    onUpdateUserLocation={(newLoc) => setUserLocation(newLoc)}
                    isPremium={isPremium}
                />
            )}

            {isModalOpen('DINNER_PARTY_CHEF') && (
                <GenericConciergeModal
                    isOpen={true}
                    onClose={closeModal}
                    config={CONCIERGE_CONFIGS.CHEF}
                    userLocation={undefined}
                    availableJars={availableJars}
                    currentJarId={userData?.activeJarId || null}
                    onIdeaAdded={handleContentUpdate}
                    onGoTonight={(idea) => {
                        closeModal();
                        openModal('DATE_REVEAL', { idea, isDirectSelection: true });
                    }}
                    onFavoriteUpdated={fetchFavorites}
                    isPremium={isPremium}
                />
            )}



            <RateDateModal
                isOpen={isModalOpen('RATE_DATE')}
                onClose={() => {
                    closeModal();
                    handleContentUpdate();
                }}
                idea={isModalOpen('RATE_DATE') ? getModalProps('RATE_DATE')?.idea : null}
                isPro={isPremium}
            />

            <DateReveal
                idea={isModalOpen('DATE_REVEAL') ? getModalProps('DATE_REVEAL')?.idea : null}
                onClose={closeModal}
                userLocation={userLocation ?? undefined}
                jarTopic={jarTopic}
                isViewOnly={getModalProps('DATE_REVEAL')?.viewOnly}
                onSkip={getModalProps('DATE_REVEAL')?.onSkip}
                onFindDining={(location) => {
                    if (location) setUserLocation(location);
                    // Open Concierge Dining
                    openModal('CONCIERGE', { toolId: 'DINING' });
                }}
            />

            <DeleteConfirmModal
                isOpen={isModalOpen('DELETE_CONFIRM')}
                onClose={closeModal}
                onConfirm={getModalProps('DELETE_CONFIRM')?.onConfirm}
            />

            {/* Trial Expired Modal - triggered via modal system */}
            <TrialExpiredModal
                isOpen={isModalOpen('TRIAL_EXPIRED')}
                onClose={closeModal}
                onUpgrade={() => {
                    closeModal();
                    openModal('PREMIUM');
                }}
                onContinueFree={closeModal}
            />

            <LevelUpModal
                isOpen={isModalOpen('LEVEL_UP')}
                level={getModalProps('LEVEL_UP')?.level || level}
                onClose={() => {
                    closeModal();
                    onCloseLevelUp?.();
                }}
            />

            <PremiumWelcomeTip
                show={getModalProps('PREMIUM_WELCOME_TIP')?.showPremiumTip || false}
                onClose={closeModal}
            />

            {userData?.activeJarId && (
                <JarMembersModal
                    isOpen={isModalOpen('JAR_MEMBERS')}
                    onClose={closeModal}
                    jarId={userData.activeJarId}
                    jarName={userData.jarName || "Your Jar"}
                    currentUserRole={userData.isCreator ? 'ADMIN' : 'MEMBER'}
                    onRoleUpdated={refreshUser}
                />
            )}

            {isModalOpen('JAR_QUICKSTART') && (
                <JarQuickStartModal
                    isOpen={true}
                    onClose={closeModal}
                    jarId={getModalProps('JAR_QUICKSTART')?.jarId || ''}
                    jarName={getModalProps('JAR_QUICKSTART')?.jarName || ''}
                    jarTopic={getModalProps('JAR_QUICKSTART')?.jarTopic || 'General'}
                />
            )}

            {isModalOpen('MOVE_IDEA') && (
                <MoveIdeaModal
                    isOpen={true}
                    onClose={closeModal}
                    idea={getModalProps('MOVE_IDEA')?.idea}
                    availableJars={availableJars}
                    onMoveComplete={handleContentUpdate}
                />
            )}

            {isModalOpen('TOOLS') && (
                <ToolsModal
                    isOpen={true}
                    onClose={closeModal}
                    isPremium={isPremium}
                    jarTopic={jarTopic}
                    activityPlannerTitle={jarTopic === 'Cooking & Recipes' ? 'Dinner Party Chef' : 'Night Out Planner'}
                />
            )}

            {isModalOpen('ADD_MEMORY') && (
                <AddMemoryModal
                    isOpen={true}
                    onClose={closeModal}
                    initialData={getModalProps('ADD_MEMORY')?.initialData}
                    isPro={isPremium}
                    onSuccess={handleContentUpdate}
                />
            )}

            {isModalOpen('CREATE_JAR') && (
                <CreateJarModal
                    isOpen={true}
                    onClose={closeModal}
                    hasRomanticJar={false}
                    isPro={isPremium}
                    currentJarCount={userData?.memberships?.filter((m: any) => m.role === 'OWNER').length || 0}
                    onSuccess={() => {
                        closeModal();
                        refreshUser();
                    }}
                />
            )}

            {isModalOpen('JOIN_JAR') && (
                <JoinJarModal
                    isOpen={true}
                    onClose={closeModal}
                    onSuccess={() => {
                        closeModal();
                        refreshUser();
                    }}
                />
            )}

            {isModalOpen('BULK_IDEA_PREVIEW') && (
                <BulkIdeaPreviewModal
                    isOpen={true}
                    onClose={closeModal}
                    ideas={getModalProps('BULK_IDEA_PREVIEW')?.ideas || []}
                    onConfirm={getModalProps('BULK_IDEA_PREVIEW')?.onConfirm}
                    onRegenerate={getModalProps('BULK_IDEA_PREVIEW')?.onRegenerate}
                    isRegenerating={getModalProps('BULK_IDEA_PREVIEW')?.isRegenerating}
                    isSaving={getModalProps('BULK_IDEA_PREVIEW')?.isSaving}
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

