const fetch = global.fetch || require('node-fetch');

async function testClassifier(query) {
    console.log(`\nTesting Query: "${query}"`);
    try {
        const res = await fetch('http://localhost:3000/api/ai/classify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        if (!res.ok) {
            console.error(`Error: ${res.status} ${res.statusText}`);
            return;
        }

        const data = await res.json();
        console.log("Result:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Failed to connect to API. Is the server running on port 3000?", e.message);
    }
}

async function run() {
    console.log("--- AI Classifier Verification ---");

    // Test 1: Explicit Action
    await testClassifier("Add a movie called Inception");

    // Test 2: Concierge / Bulk
    await testClassifier("Give me 5 romantic dinner ideas");

    // Test 3: Ambiguous / Search
    await testClassifier("Recipe for pancakes");

    // Test 4: User Reported Issue
    await testClassifier("5 budget friendly meal recipes for my family");
}

run();
