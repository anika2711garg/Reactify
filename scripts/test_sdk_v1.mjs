
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

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

const apiKey = (process.env.GOOGLE_API_KEY || '').trim().replace(/^["']|["']$/g, '');
const genAI = new GoogleGenerativeAI(apiKey);

async function testV1() {
    console.log("Testing gemini-1.5-flash with apiVersion: 'v1'");
    try {
        // Attempt to pass apiVersion if the SDK supports it in RequestOptions
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            apiVersion: 'v1'
        }, {
            apiVersion: 'v1' // Try here too just in case
        });

        const result = await model.generateContent("Hello");
        console.log("Success! ", result.response.text());
    } catch (e) {
        console.error("FAILED.");
        console.error(e.message);
    }
}

testV1();
