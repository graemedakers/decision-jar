export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    targetElement?: string; // CSS selector for element to highlight
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    action?: {
        label: string;
        onClick: () => void;
    };
}

// Common steps used across all modes
const COMMON_WELCOME_STEPS: OnboardingStep[] = [
    {
        id: 'welcome',
        title: '👋 Welcome to Decision Jar!',
        description: 'Your personal idea jar for dates, activities, and adventures. Let\'s take a quick tour to get you started!',
        position: 'center'
    },
    {
        id: 'add-idea',
        title: '💡 Add Your First Idea',
        description: 'Start by adding date ideas to your jar. Click here to add anything from simple coffee dates to epic adventures!',
        targetElement: '[data-tour="add-idea-button"]',
        position: 'top'
    },
    {
        id: 'surprise-me',
        title: '✨ AI-Powered Ideas',
        description: 'Stuck for ideas? Click this Sparkles button to let our AI surprise you with personalized suggestions based on your preferences!',
        targetElement: '[data-tour="surprise-me-button"]',
        position: 'top'
    },
    {
        id: 'jar-visual',
        title: '🎲 Your Jar',
        description: 'This shows how many ideas are ready to be selected. The number grows as you add more ideas!',
        targetElement: '[data-tour="jar-visual"]',
        position: 'bottom'
    }
];

const COMMON_ENDING_STEPS: OnboardingStep[] = [
    {
        id: 'open-jar',
        title: '📂 Browse All Ideas',
        description: 'View, edit, or delete all your ideas. You can also mark favorites and see idea details.',
        targetElement: '[data-tour="list-tab"], [data-tour="list-tab-mobile"]',
        position: 'bottom'
    },
    {
        id: 'explore-menu',
        title: '🧭 Explore AI Tools',
        description: 'Discover specialized AI concierges and finders to help you plan the perfect experience.',
        targetElement: '[data-tour="explore-tab"], [data-tour="explore-tab-mobile"]',
        position: 'bottom'
    },
    {
        id: 'vault',
        title: '🏆 Your Vault',
        description: 'After completing a date, ideas move here. Rate your experiences and build your memory collection!',
        targetElement: '[data-tour="vault-tab"], [data-tour="vault-tab-mobile"], [data-tour="vault-button"]',
        position: 'bottom'
    },
    {
        id: 'gamification',
        title: '⭐ Level Up Your Romance',
        description: 'Earn XP for adding ideas and completing dates. Unlock achievements and track your progress!',
        targetElement: '[data-tour="trophy-case"]',
        position: 'bottom'
    },
    {
        id: 'jar-selector',
        title: '🏺 Multi-Jar Mastery',
        description: 'Need separate jars for work, home, or different hobbies? Click the jar name to switch between jars or create a brand new one!',
        targetElement: '[data-tour="jar-selector"]',
        position: 'bottom'
    },
    {
        id: 'complete',
        title: '🎉 You\'re All Set!',
        description: 'Start adding ideas and spinning your jar! You can always access this tutorial again from the settings menu.',
        position: 'center'
    }
];

// Mode-specific selection steps
const RANDOM_MODE_STEP: OnboardingStep = {
    id: 'spin-jar',
    title: '🎯 Spin the Jar',
    description: 'Ready to decide? Click here to randomly select an idea from your jar. You can filter by budget, duration, and more!',
    targetElement: '[data-tour="spin-button-desktop"], [data-tour="spin-button"]',
    position: 'top'
};

const ADMIN_PICK_MODE_STEP: OnboardingStep = {
    id: 'admin-pick',
    title: '👤 Admin Pick Mode',
    description: 'As the admin, you manually select which idea to use next. Browse your list and pick what feels right!',
    targetElement: '[data-tour="list-tab"], [data-tour="list-tab-mobile"]',
    position: 'bottom'
};

const VOTING_MODE_STEP: OnboardingStep = {
    id: 'voting',
    title: '🗳️ Voting Mode',
    description: 'Everyone in your jar can vote on ideas! Start a voting round to let the group decide together what to do next.',
    targetElement: '[data-tour="admin-controls"], [data-tour="voting-button"]',
    position: 'top'
};

const ALLOCATION_MODE_STEP: OnboardingStep = {
    id: 'allocation',
    title: '📋 Task Allocation',
    description: 'Assign ideas to specific team members. Perfect for managing tasks and responsibilities in group projects!',
    targetElement: '[data-tour="list-tab"], [data-tour="list-tab-mobile"]',
    position: 'bottom'
};

// Default steps for RANDOM mode (backward compatible)
export const ONBOARDING_STEPS: OnboardingStep[] = [
    ...COMMON_WELCOME_STEPS,
    RANDOM_MODE_STEP,
    ...COMMON_ENDING_STEPS
];

/**
 * Get mode-specific onboarding steps
 * @param mode - The jar's selection mode
 * @returns Array of onboarding steps tailored to the mode
 */
export function getOnboardingSteps(mode?: string): OnboardingStep[] {
    let modeStep: OnboardingStep;

    switch (mode) {
        case 'ADMIN_PICK':
            modeStep = ADMIN_PICK_MODE_STEP;
            break;
        case 'VOTING':
            modeStep = VOTING_MODE_STEP;
            break;
        case 'ALLOCATION':
            modeStep = ALLOCATION_MODE_STEP;
            break;
        case 'RANDOM':
        default:
            modeStep = RANDOM_MODE_STEP;
            break;
    }

    return [
        ...COMMON_WELCOME_STEPS,
        modeStep,
        ...COMMON_ENDING_STEPS
    ];
}
