'use server';

import { ActionResponse } from '@/lib/types';
import { reliableGeminiCall } from '@/lib/gemini';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { isCouplePremium, isUserPro } from '@/lib/premium';

interface MealPlan {
    day: string;
    meal: string;
    description: string;
    prep_time: string;
    difficulty: string;
}

interface ShoppingList {
    categories: {
        name: string;
        items: string[];
    }[];
}

export async function generateShoppingList(meals: MealPlan[], numPeople: number): Promise<ActionResponse<{ list: ShoppingList }>> {
    try {
        const session = await getSession();
        if (!session?.user?.id) return { success: false, error: 'Unauthorized', status: 401 };

        // Basic premium check (optional, but good practice)
        // We can skip heavy checks if we assume they already generated the plan

        const prompt = `
            Create a consolidated shopping list for the following meal plan for ${numPeople} people.
            
            MEALS:
            ${meals.map(m => `- ${m.meal}: ${m.description}`).join('\n')}
            
            INSTRUCTIONS:
            - Group items by standard grocery store categories (Produce, Meat & Seafood, Dairy, Pantry, etc.).
            - Consolidate quantities where possible (e.g. "2 onions" instead of "1 onion" twice).
            - Assume basic pantry staples like salt, pepper, oil are present, but include significant pantry items.
            - Return ONLY JSON.
            
            FORMAT:
            {
                "categories": [
                    { "name": "Produce", "items": ["2 onions", "1 bag spinach"] },
                    { "name": "Dairy", "items": ["Milk", "Cheddar Cheese"] }
                ]
            }
        `;

        const list = await reliableGeminiCall<ShoppingList>(prompt);
        return { success: true, list };

    } catch (error: any) {
        console.error("Shopping List Generation Failed:", error);
        return { success: false, error: "Failed to generate shopping list. Please try again." };
    }
}

export async function regenerateMeal(
    currentPlan: MealPlan[],
    indexToReplace: number,
    preferences: any
): Promise<ActionResponse<{ meal: MealPlan }>> {
    try {
        const session = await getSession();
        if (!session?.user?.email) return { success: false, error: 'Unauthorized', status: 401 };

        const rejectedMeal = currentPlan[indexToReplace];
        const dayLabel = rejectedMeal.day; // e.g., "Day 3"

        const prompt = `
            The user rejected a meal from their plan. Generate a REPLACEMENT meal for ${dayLabel}.
            
            CONTEXT:
            - Target Audience: ${preferences.audience} (${preferences.numPeople} people)
            - Diet: ${preferences.dietaryPreference}
            - Style: ${preferences.style}
            - Skill: ${preferences.cookingSkill}
            - Rejected Meal: "${rejectedMeal.meal}" (Do not suggest this)
            
            EXISTING PLAN (Avoid duplicates):
            ${currentPlan.map((m, i) => i === indexToReplace ? `(REPLACING THIS: ${m.meal})` : `- ${m.meal}`).join('\n')}
            
            REQUIREMENTS:
            - Must be a single distinct dinner meal.
            - Must fit the preferences.
            - Return ONLY JSON object for the single meal.
            
            FORMAT:
            {
                "day": "${dayLabel}",
                "meal": "Name",
                "description": "Description",
                "prep_time": "Time",
                "difficulty": "Level"
            }
        `;

        const newMeal = await reliableGeminiCall<MealPlan>(prompt);
        return { success: true, meal: newMeal };

    } catch (error: any) {
        console.error("Meal Regeneration Failed:", error);
        return { success: false, error: "Failed to replace meal." };
    }
}
