
const inputs = [
    "Pizza",
    "Add Pizza",
    "Add Lentil Soup",
    "Add a burger"
];

async function testClassify() {
    console.log("Testing AI Classification Endpoint (Rule 3 Focus)...");

    for (const input of inputs) {
        try {
            const res = await fetch('http://localhost:3000/api/ai/classify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: input })
            });

            if (!res.ok) {
                console.error(`Error for "${input}": ${res.status} ${res.statusText}`);
                continue;
            }

            const data = await res.json();
            const result = Array.isArray(data) ? data[0] : data;

            console.log(`\nInput: "${input}"`);
            console.log("Intent:", result.intent);
            if (result.intent === 'EXECUTE_ACTION') {
                console.log("Extraction Type:", result.extraction?.type);
                if (result.extraction?.type?.toLowerCase() === 'recipe') {
                    console.log("✅ Correctly mapped to RECIPE via Rule 3 or Prompt.");
                } else {
                    console.warn("⚠️ Mapped to:", result.extraction?.type);
                }
            } else {
                console.log("Topic:", result.classification?.topic);
            }

        } catch (err) {
            console.error(`Failed to fetch for "${input}":`, err.message);
        }
    }
}

testClassify();
