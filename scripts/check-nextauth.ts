import fs from 'fs';
import path from 'path';

function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const envVars: Record<string, string> = {};

        envFile.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                if (value.length > 0 &&
                    ((value.startsWith('"') && value.endsWith('"')) ||
                        (value.startsWith("'") && value.endsWith("'")))) {
                    value = value.substring(1, value.length - 1);
                }
                envVars[key] = value.trim();
            }
        });
        return envVars;
    } catch (e) {
        return {};
    }
}

const env = loadEnv();

console.log("🔍 Checking NextAuth Environment Variables...");

const nextAuthUrl = env["NEXTAUTH_URL"];
const nextAuthSecret = env["NEXTAUTH_SECRET"];
const authSecret = env["AUTH_SECRET"];

let missing = false;

if (!nextAuthUrl) {
    console.error("❌ NEXTAUTH_URL is missing.");
    console.log("   Suggestion: Add NEXTAUTH_URL=\"http://localhost:3000\" to your .env file.");
    missing = true;
} else {
    console.log(`✅ NEXTAUTH_URL found: ${nextAuthUrl}`);
    if (!nextAuthUrl.includes("localhost") && !nextAuthUrl.includes("127.0.0.1")) {
        console.warn("   ⚠️ Warning: NEXTAUTH_URL doesn't look like localhost. Ensure this matches your browser URL.");
    }
}

if (!nextAuthSecret && !authSecret) {
    console.error("❌ NEXTAUTH_SECRET (or AUTH_SECRET) is missing.");
    console.log("   Suggestion: Add NEXTAUTH_SECRET=\"your-random-secret-key\" to your .env file.");
    // Generate a random key for them
    const crypto = require('crypto');
    const randomKey = crypto.randomBytes(32).toString('base64');
    console.log(`   You can use this generated key: "${randomKey}"`);
    missing = true;
} else {
    console.log("✅ NEXTAUTH_SECRET / AUTH_SECRET found.");
}

if (!missing) {
    console.log("\n✅ Configuration variables look correct locally.");
    console.log("Next Step: The error is likely in the server logs.");
}
