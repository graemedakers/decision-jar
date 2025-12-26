
export const SAMPLE_IDEAS: Record<string, { description: string; categoryId: string; indoor: boolean; cost: string; activityLevel: string; timeOfDay: string; duration: string }[]> = {
    "Activities": [
        { description: "Hiking in the national park", categoryId: "OUTDOOR", indoor: false, cost: "FREE", activityLevel: "HIGH", timeOfDay: "DAY", duration: "4.0" },
        { description: "Board game night", categoryId: "INDOOR", indoor: true, cost: "FREE", activityLevel: "LOW", timeOfDay: "EVENING", duration: "2.0" },
        { description: "Visit a local museum", categoryId: "CULTURAL", indoor: true, cost: "$", activityLevel: "Them", timeOfDay: "ANY", duration: "2.0" },
        { description: "Host a dinner party", categoryId: "SOCIAL", indoor: true, cost: "$$", activityLevel: "MEDIUM", timeOfDay: "EVENING", duration: "4.0" },
        { description: "Go for a sunset picnic", categoryId: "OUTDOOR", indoor: false, cost: "$", activityLevel: "LOW", timeOfDay: "EVENING", duration: "2.0" },
        { description: "Pottery workshop", categoryId: "INDOOR", indoor: true, cost: "$$", activityLevel: "MEDIUM", timeOfDay: "ANY", duration: "2.0" },
    ],
    "Restaurants": [
        { description: "Try the new sushi place downtown", categoryId: "CASUAL", indoor: true, cost: "$$", activityLevel: "LOW", timeOfDay: "EVENING", duration: "2.0" },
        { description: "Fancy French dinner", categoryId: "FINE_DINING", indoor: true, cost: "$$$", activityLevel: "LOW", timeOfDay: "EVENING", duration: "2.5" },
        { description: "Sunday Brunch unlimited mimosas", categoryId: "BRUNCH", indoor: true, cost: "$$", activityLevel: "LOW", timeOfDay: "DAY", duration: "2.0" },
        { description: "Grab street tacos", categoryId: "FAST_FOOD", indoor: false, cost: "$", activityLevel: "LOW", timeOfDay: "ANY", duration: "0.5" },
        { description: "Authentic Thai cuisine", categoryId: "INTERNATIONAL", indoor: true, cost: "$$", activityLevel: "LOW", timeOfDay: "EVENING", duration: "1.5" },
    ],
    "Bars": [
        { description: "Craft cocktails at The Speakeasy", categoryId: "SPEAKEASY", indoor: true, cost: "$$", activityLevel: "LOW", timeOfDay: "EVENING", duration: "2.0" },
        { description: "Locals night at the Irish Pub", categoryId: "PUB", indoor: true, cost: "$", activityLevel: "MEDIUM", timeOfDay: "EVENING", duration: "3.0" },
        { description: "Wine tasting flight", categoryId: "WINE_BAR", indoor: true, cost: "$$", activityLevel: "LOW", timeOfDay: "EVENING", duration: "1.5" },
        { description: "Sunset drinks on the rooftop", categoryId: "ROOFTOP", indoor: false, cost: "$$", activityLevel: "LOW", timeOfDay: "EVENING", duration: "2.0" },
    ],
    "Nightclubs": [
        { description: "Techno bunker rave", categoryId: "RAVE", indoor: true, cost: "$$", activityLevel: "HIGH", timeOfDay: "EVENING", duration: "4.0" },
        { description: "Salsa dancing night", categoryId: "DANCE_CLUB", indoor: true, cost: "$", activityLevel: "HIGH", timeOfDay: "EVENING", duration: "3.0" },
        { description: "Jazz lounge live set", categoryId: "LIVE_MUSIC", indoor: true, cost: "$$", activityLevel: "LOW", timeOfDay: "EVENING", duration: "2.5" },
        { description: "VIP table service", categoryId: "LOUNGE", indoor: true, cost: "$$$", activityLevel: "LOW", timeOfDay: "EVENING", duration: "4.0" },
    ],
    "Movies": [
        { description: "Watch 'Inception'", categoryId: "STREAMING", indoor: true, cost: "FREE", activityLevel: "LOW", timeOfDay: "EVENING", duration: "2.5" },
        { description: "IMAX Premiere", categoryId: "CINEMA", indoor: true, cost: "$$", activityLevel: "LOW", timeOfDay: "EVENING", duration: "3.0" },
        { description: "Binge watch 'The Office'", categoryId: "SERIES", indoor: true, cost: "FREE", activityLevel: "LOW", timeOfDay: "ANY", duration: "4.0" },
        { description: "Drive-in Movie Theater", categoryId: "CINEMA", indoor: false, cost: "$", activityLevel: "LOW", timeOfDay: "EVENING", duration: "3.0" },
    ],
    "Wellness": [
        { description: "Morning meditation (30 mins)", categoryId: "MEDITATION", indoor: true, cost: "FREE", activityLevel: "LOW", timeOfDay: "DAY", duration: "0.5" },
        { description: "Full body massage", categoryId: "SPA", indoor: true, cost: "$$$", activityLevel: "LOW", timeOfDay: "ANY", duration: "1.5" },
        { description: "Digital detox nature walk", categoryId: "DETOX", indoor: false, cost: "FREE", activityLevel: "MEDIUM", timeOfDay: "DAY", duration: "2.0" },
        { description: "Aromatic bubble bath", categoryId: "SPA", indoor: true, cost: "FREE", activityLevel: "LOW", timeOfDay: "EVENING", duration: "1.0" },
    ],
    "Fitness": [
        { description: "5k Morning Run", categoryId: "CARDIO", indoor: false, cost: "FREE", activityLevel: "HIGH", timeOfDay: "DAY", duration: "1.0" },
        { description: "Heavy lifting session", categoryId: "STRENGTH", indoor: true, cost: "$", activityLevel: "HIGH", timeOfDay: "ANY", duration: "1.5" },
        { description: "Hot Yoga Class", categoryId: "YOGA", indoor: true, cost: "$$", activityLevel: "MEDIUM", timeOfDay: "ANY", duration: "1.5" },
        { description: "Tennis match", categoryId: "OUTDOOR_SPORT", indoor: false, cost: "$", activityLevel: "HIGH", timeOfDay: "DAY", duration: "2.0" },
    ],
    "Travel": [
        { description: "Weekend cabin getaway", categoryId: "WEEKEND", indoor: true, cost: "$$$", activityLevel: "MEDIUM", timeOfDay: "ANY", duration: "8.0" },
        { description: "Day trip to the coast", categoryId: "ROADTRIP", indoor: false, cost: "$$", activityLevel: "MEDIUM", timeOfDay: "DAY", duration: "8.0" },
        { description: "Staycation at a local hotel", categoryId: "STAYCATION", indoor: true, cost: "$$", activityLevel: "LOW", timeOfDay: "ANY", duration: "8.0" },
        { description: "Planning trip to Japan", categoryId: "ABROAD", indoor: true, cost: "FREE", activityLevel: "LOW", timeOfDay: "ANY", duration: "2.0" },
    ],
    "Hotel Stays": [
        { description: "Luxury suite downtown", categoryId: "LUXURY", indoor: true, cost: "$$$", activityLevel: "LOW", timeOfDay: "EVENING", duration: "2.0" },
        { description: "Cozy B&B in the country", categoryId: "BNB", indoor: true, cost: "$$", activityLevel: "LOW", timeOfDay: "ANY", duration: "2.0" },
        { description: "All-inclusive Resort", categoryId: "RESORT", indoor: false, cost: "$$$", activityLevel: "LOW", timeOfDay: "ANY", duration: "8.0" },
        { description: "Boutique Art Hotel", categoryId: "BOUTIQUE", indoor: true, cost: "$$", activityLevel: "LOW", timeOfDay: "EVENING", duration: "2.0" },
    ]
};

export const getRandomIdeaForTopic = (topic: string | null | undefined) => {
    // Normalize key
    const topicKey = topic ? Object.keys(SAMPLE_IDEAS).find(k => k.toLowerCase() === topic.toLowerCase()) : "Activities";
    const ideas = SAMPLE_IDEAS[topicKey || "Activities"] || SAMPLE_IDEAS["Activities"];

    // Pick random
    const randomIndex = Math.floor(Math.random() * ideas.length);
    return ideas[randomIndex];
};
