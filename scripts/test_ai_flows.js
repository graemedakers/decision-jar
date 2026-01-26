
const { writeFileSync } = require('fs');
const fetch = require('node-fetch'); // Ensure node-fetch is available or use built-in if node 18+

async function testFlow() {
    console.log("=== TEST 1: Classification ===");
    const inputs = ["Budget Friendly meal recipes", "Lentil Soup"];

    for (const input of inputs) {
        console.log(`\nInput: "${input}"`);
        try {
            const res = await fetch('http://localhost:3000/api/ai/classify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: input })
            });
            const data = await res.json();
            const result = Array.isArray(data) ? data[0] : data;

            console.log("Intent:", result.intent);
            console.log("Topic:", result.classification?.topic);

            if (result.intent === 'GENERATE_IDEAS' && result.classification?.topic === 'RECIPE') {
                console.log("✅ Correctly identified as RECIPE generation.");
                await testConcierge('recipe_discovery', input);
            } else {
                // Try dining to see the difference
                if (result.classification?.topic === 'DINING') {
                    await testConcierge('dining_concierge', input);
                }
            }

        } catch (e) {
            console.error(e);
        }
    }
}

async function testConcierge(configId, initialPrompt) {
    console.log(`\n=== TEST 2: Concierge (${configId}) ===`);
    try {
        const body = {
            configId: configId,
            inputs: { extraInstructions: initialPrompt },
            location: "New York", // Mock location
            useMockData: false,
            isDemo: false
        };

        const res = await fetch('http://localhost:3000/api/concierge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        const recs = data.recommendations || [];
        console.log(`Received ${recs.length} recommendations.`);

        if (recs.length > 0) {
            const first = recs[0];
            console.log("Sample Item:", JSON.stringify(first, null, 2));

            if (first.ideaType === 'recipe') {
                console.log("✅ Item has ideaType: 'recipe'");
            } else {
                console.warn("⚠️ Item MISSING ideaType: 'recipe'");
                // Check if it looks like an establishment
                if (first.address && first.address !== 'At Home') {
                    console.warn("⚠️ Item has real address (Establishment-like):", first.address);
                }
            }
        }

    } catch (e) {
        console.error("Concierge failed:", e);
    }
}

// Check if fetch is available (Node 18+)
if (!globalThis.fetch) {
    console.error("This script requires Node 18+ or node-fetch");
} else {
    testFlow();
}
