// MOCK the BACKEND inferIdeaType logic
function mockBackendInferIdeaType(category, title, description) {
    const cat = category.toUpperCase();
    const t = (title || '').toLowerCase();
    const d = (description || '').toLowerCase();

    // 1. Recipe Detection (NEW Priority)
    if (cat.includes('RECIPE') || t.includes('recipe') || t.includes('cook') || d.includes('recipe') || d.includes('ingredients') || d.includes('cook time')) {
        return 'recipe';
    }

    // 2. Generic Fallbacks
    if (cat.includes('FOOD') || cat.includes('DINING')) return 'dining'; // Was erroneously catching recipes before!

    return null;
}

async function runEndToEnd() {
    console.log(`\n=== STRUCTURED DATA PASSTHROUGH SIMULATION ===`);

    // 1. Simulate AI Response with NEW format
    const aiResponseItem = {
        title: "Perfect Quesadillas",
        description: "Cheesy and crispy.",
        category: "MEAL",
        // The new field we added to the prompt
        typeData: {
            ingredients: ["Tortillas", "Cheese", "Salsa"],
            instructions: "1. Heat pan.\n2. Melt cheese.",
            prepTime: 5,
            difficulty: "Easy"
        }
    };

    console.log('AI Response Item:', JSON.stringify(aiResponseItem, null, 2));

    // 2. Simulate Backend Save Logic (from route.ts)
    const finalCategory = aiResponseItem.category;

    // Logic: const finalTypeData = idea.typeData || getStandardizedData(...)
    const finalTypeData = aiResponseItem.typeData || "FALLBACK_TO_PARSER";

    console.log('Final TypeData to Save:', finalTypeData);

    // 3. Validation
    if (finalTypeData === "FALLBACK_TO_PARSER") {
        console.log("FAILURE: System switched to fallback parser instead of using provided typeData.");
        process.exit(1);
    }

    if (finalTypeData.ingredients && Array.isArray(finalTypeData.ingredients) && finalTypeData.prepTime === 5) {
        console.log("SUCCESS: Structured typeData was preserved and ready for DB save.");
        process.exit(0);
    } else {
        console.log("FAILURE: Data corrupted or missing fields.");
        process.exit(1);
    }
}

runEndToEnd();
