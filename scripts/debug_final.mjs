
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (!fs.existsSync(envPath)) {
            console.log("❌ .env.local file NOT found at:", envPath);
            return;
        }
        const envContent = fs.readFileSync(envPath, 'utf-8');
        console.log("✅ .env.local found. Parsing...");
        for (const line of envContent.split('\n')) {
            const [key, value] = line.split('=');
            if (key && value) {
                const cleanKey = key.trim();
                const cleanVal = value.trim().replace(/^["']|["']$/g, '');
                process.env[cleanKey] = cleanVal;
                if (cleanKey === 'GOOGLE_API_KEY') {
                    console.log(`🔑 GOOGLE_API_KEY loaded: ${cleanVal.substring(0, 8)}... (Length: ${cleanVal.length})`);
                }
            }
        }
    } catch (e) {
        console.error("❌ Error loading .env.local", e);
    }
}

loadEnv();

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.error("❌ No GOOGLE_API_KEY found in process.env!");
    process.exit(1);
}

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    console.log(`\n📡 Requesting: ${url.replace(apiKey, 'HIDDEN')}`);

    try {
        const res = await fetch(url);
        console.log(`Global Status: ${res.status} ${res.statusText}`);

        const data = await res.json();

        if (res.ok) {
            console.log("✅ SUCCESS! The API Key is VALID and connected to an enabled project.");
            const modelNames = data.models.map(m => m.name); // e.g. models/gemini-1.5-flash
            const hasFlash = modelNames.some(n => n.includes('gemini-1.5-flash'));
            console.log(`\n🔎 Checking for 'gemini-1.5-flash': ${hasFlash ? 'FOUND ✅' : 'NOT FOUND ❌'}`);

            if (!hasFlash) {
                console.log("Available Models:");
                modelNames.forEach(n => console.log(` - ${n}`));
            }
        } else {
            console.log("❌ REQUEST FAILED.");
            console.log("Error Code:", data.error.code);
            console.log("Error Message:", data.error.message);
            console.log("\nINTERPRETATION:");
            if (res.status === 403 || res.status === 400 || data.error.message.includes('API key not valid')) {
                console.log("👉 The API Key itself is invalid or deleted.");
            } else if (res.status === 404) {
                console.log("👉 The API Key is valid, but the user project does not exist or API is disabled.");
            }
        }
    } catch (err) {
        console.error("❌ Network Error:", err);
    }
}

listModels();
