
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Helper to load env
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        for (const line of envContent.split('\n')) {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        }
    } catch (e) {
        console.error("Could not load .env.local", e);
    }
}

loadEnv();

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
    console.error("No API KEY found");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
// Try the model we think is right

async function test() {
    console.log(`Key loaded: ${apiKey ? apiKey.substring(0, 4) + '...' : 'NO'}`);

    try {
        console.log("Trying gemini-1.5-flash-latest...");
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
        const result = await model.generateContent("Test");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.error("Error:", e.message); // Print message to avoid full stack noise
    }
}

test();
