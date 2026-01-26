
const https = require('https');
const fs = require('fs');
const path = require('path');

// 1. Load API Key
let apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);
        if (match) apiKey = match[1].trim();
    } catch (e) {
        console.error("Could not load .env file");
    }
}

if (!apiKey) {
    console.error("No API KEY found");
    process.exit(1);
}

const req = https.request(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
}, (res) => {
    let data = '';
    res.on('data', (d) => data += d);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.models) {
                console.log("Available Models:");
                parsed.models.forEach(m => {
                    if (m.supportedGenerationMethods.includes('generateContent')) {
                        console.log(`- ${m.name}`);
                    }
                });
            } else {
                console.log("Response:", JSON.stringify(parsed, null, 2));
            }
        } catch (e) {
            console.error("Failed to parse response", e);
            console.log(data);
        }
    });
});

req.on('error', (e) => console.error(e));
req.end();
