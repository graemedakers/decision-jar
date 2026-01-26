
const inputs = [
    "Add Lentil Soup",
    "Add recipe for Lentil Soup",
    "Make Lentil Soup",
    "Lentil Soup"
];

async function testClassify() {
    console.log("Testing AI Classification Endpoint...");

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
            // Unwrap array if it is one, to see the object more clearly
            const result = Array.isArray(data) ? data[0] : data;

            console.log(`\nInput: "${input}"`);
            console.log("Intent:", result.intent);
            if (result.classification) console.log("Topic:", result.classification.topic);
            if (result.extraction) {
                console.log("Extraction Type:", result.extraction.type);
                console.log("Extraction Title:", result.extraction.title);
            }

        } catch (err) {
            console.error(`Failed to fetch for "${input}":`, err.message);
        }
    }
}

testClassify();
