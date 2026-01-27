
const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env manually
let API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/NEXT_PUBLIC_GOOGLE_API_KEY=(.*)/) || envContent.match(/GEMINI_API_KEY=(.*)/);
        if (match) {
            API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
        }
    } catch (e) {
        console.warn("Could not read .env file");
    }
}

if (!API_KEY) {
    console.error("No API KEY found.");
    process.exit(1);
}

const query = "Squash Melbourne";
const url = `https://places.googleapis.com/v1/places:searchText`;
const body = JSON.stringify({
    textQuery: query
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.websiteUri,places.rating'
    }
};

console.log(`Testing New Places API (v1)...`);

const req = https.request(url, options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", JSON.stringify(json.error, null, 2));
            } else if (json.places) {
                console.log("Success! Found", json.places.length, "results.");
                console.log("First result:", json.places[0]);
            } else {
                console.log("Result:", json);
            }
        } catch (e) {
            console.error("Parse error", e);
        }
    });
});

req.on('error', (e) => {
    console.error("Request error", e);
});

req.write(body);
req.end();
