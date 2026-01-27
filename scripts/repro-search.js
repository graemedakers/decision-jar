
const { findPlaceUrl } = require('../lib/google-places.ts'); // Wait, I need to compile ts or use ts-node. 
// Simulating via simple JS since I can't rely on ts-node for import paths easily without config.
// I'll copy the logic of google-places.ts here.

const https = require('https');
const fs = require('fs');
const path = require('path');

let API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/NEXT_PUBLIC_GOOGLE_API_KEY=(.*)/) || envContent.match(/GEMINI_API_KEY=(.*)/);
        if (match) {
            API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
        }
    } catch (e) { }
}

async function searchPlace(query) {
    if (!API_KEY) return null;
    return new Promise((resolve) => {
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.status === 'OK' && json.results.length > 0) resolve(json.results[0]);
                    else {
                        console.log("Search failed:", json.status);
                        resolve(null);
                    }
                } catch (e) { console.error(e); resolve(null); }
            });
        });
    });
}

async function getPlaceDetails(placeId) {
    if (!API_KEY) return null;
    return new Promise((resolve) => {
        // Use basic fields to avoid API errors
        const fields = 'name,website,url,formatted_address,rating';
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.status === 'OK' && json.result) resolve(json.result);
                    else {
                        console.log("Details failed:", json.status);
                        resolve(null);
                    }
                } catch (e) { resolve(null); }
            });
        });
    });
}

async function run() {
    const query = process.argv[2] || "RACV City Club 501 Bourke St, Melbourne VIC 3000";
    console.log(`Searching for: "${query}"`);

    const place = await searchPlace(query);
    if (place) {
        console.log("Found Place ID:", place.place_id);
        const details = await getPlaceDetails(place.place_id);
        if (details) {
            console.log("Website:", details.website);
            console.log("Google Maps URL:", details.url);
        } else {
            console.log("No details found.");
        }
    } else {
        console.log("Place search found nothing.");
    }
}

run();
