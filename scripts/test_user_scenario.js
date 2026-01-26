
const inputs = [
    "2 budget saving meal recipes for my family"
];

async function testClassify() {
    console.log("Testing User Scenario...");

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
            console.log("Topic:", result.classification?.topic);
            console.log("Is Bulk?", result.classification?.isBulk);
            console.log("Quantity:", result.classification?.quantity);

            if (result.intent === 'GENERATE_IDEAS' && result.classification?.topic === 'RECIPE') {
                console.log("✅ Classification: SUCCESS");
            } else {
                console.log("❌ Classification: UNEXPECTED");
            }

        } catch (err) {
            console.error(`Failed to fetch for "${input}":`, err.message);
        }
    }
}

testClassify();
