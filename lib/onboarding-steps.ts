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

export const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 'welcome',
        title: '👋 Welcome to Date Jar!',
        description: 'Your personal idea jar for dates, activities, and adventures. Let\'s take a quick tour to get you started!',
        position: 'center'
    },
    {
        id: 'add-idea',
        title: '💡 Add Your First Idea',
        description: 'Start by adding date ideas to your jar. Click here to add anything from simple coffee dates to epic adventures!',
        targetElement: '[data-tour="add-idea-button"]',
        position: 'bottom'
    },
    {
        id: 'surprise-me',
        title: '✨ AI-Powered Ideas',
        description: 'Don\'t have ideas? Let our AI surprise you with personalized suggestions based on your preferences!',
        targetElement: '[data-tour="surprise-me-button"]',
        position: 'bottom'
    },
    {
        id: 'jar-visual',
        title: '🎲 Your Jar',
        description: 'This shows how many ideas are ready to be selected. The number grows as you add more ideas!',
        targetElement: '[data-tour="jar-visual"]',
        position: 'bottom'
    },
    {
        id: 'spin-jar',
        title: '🎯 Spin the Jar',
        description: 'Ready to decide? Click here to randomly select an idea from your jar. You can filter by budget, duration, and more!',
        targetElement: '[data-tour="spin-button-desktop"], [data-tour="spin-button"]',
        position: 'top'
    },
    {
        id: 'open-jar',
        title: '📂 Browse All Ideas',
        description: 'View, edit, or delete all your ideas. You can also mark favorites and see idea details.',
        targetElement: '[data-tour="open-jar-button"]',
        position: 'right'
    },
    {
        id: 'vault',
        title: '🏆 Your Vault',
        description: 'After completing a date, ideas move here. Rate your experiences and build your memory collection!',
        targetElement: '[data-tour="vault-button"]',
        position: 'top'
    },
    {
        id: 'gamification',
        title: '⭐ Level Up Your Romance',
        description: 'Earn XP for adding ideas and completing dates. Unlock achievements and track your progress!',
        targetElement: '[data-tour="trophy-case"]',
        position: 'bottom'
    },
    {
        id: 'complete',
        title: '🎉 You\'re All Set!',
        description: 'Start adding ideas and spinning your jar! You can always access this tutorial again from the settings menu.',
        position: 'center'
    }
];
