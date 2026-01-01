export const COST_LEVELS = [
    { id: 'FREE', label: 'Free', value: 0 },
    { id: '$', label: '$ (Cheap)', value: 1 },
    { id: '$$', label: '$$ (Moderate)', value: 2 },
    { id: '$$$', label: '$$$ (Expensive)', value: 3 },
];

export const ACTIVITY_LEVELS = [
    { id: 'LOW', label: 'Chill', value: 0 },
    { id: 'MEDIUM', label: 'Moderate', value: 1 },
    { id: 'HIGH', label: 'Active', value: 2 },
];

export const TIME_OF_DAY = [
    { id: 'ANY', label: 'Anytime' },
    { id: 'DAY', label: 'Day' },
    { id: 'EVENING', label: 'Evening' },
];

export const WEATHER_TYPES = [
    { id: 'ANY', label: 'Any' },
    { id: 'SUNNY', label: 'Sunny' },
    { id: 'RAINY', label: 'Rainy' },
    { id: 'COLD', label: 'Cold' },
];

export const COST_VALUES: Record<string, number> = Object.fromEntries(COST_LEVELS.map(c => [c.id, c.value]));
export const ACTIVITY_VALUES: Record<string, number> = Object.fromEntries(ACTIVITY_LEVELS.map(a => [a.id, a.value]));
