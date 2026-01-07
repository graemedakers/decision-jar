export type JarTopic = 'Dates' | 'Romantic' | 'Restaurants' | 'Bars' | 'Nightclubs' | 'Movies' | 'Wellness' | 'Fitness' | 'Travel' | string;

export function getJarLabels(topic: string | undefined) {
    const isRomantic = topic === 'Dates' || topic === 'Romantic';

    return {
        memberLabel: isRomantic ? 'Partner' : 'Member',
        memberLabelPlural: isRomantic ? 'Partners' : 'Members',
        jarBranding: isRomantic ? 'Date Jar' : 'Decision Jar',
        connectionAction: isRomantic ? 'Invite Partner' : 'Invite Member',
        connectionActionShort: isRomantic ? 'Pair' : 'Join',
        plannerTitle: isRomantic ? 'Date Night Planner' : `${topic && topic !== 'General' ? topic : 'Activity'} Planner`,
        welcomeContext: isRomantic ? 'your partner' : 'friends or family',
        sharedLabel: isRomantic ? 'Shared with partner' : 'Shared with group',
        ratingsLabel: isRomantic ? 'Couple Ratings' : 'Member Ratings',
        emptyJarAction: isRomantic ? 'Empty Jar (Delete All Dates)' : 'Empty Jar (Delete All Ideas)',
    };
}
