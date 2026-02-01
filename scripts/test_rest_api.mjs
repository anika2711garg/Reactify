
import fetch from 'node-fetch';
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

async function testRest() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    console.log("Testing REST V1 URL:", url.replace(apiKey, 'HIDDEN_KEY'));

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: "Hello"
                }]
            }]
        })
    });

    if (response.ok) {
        const data = await response.json();
        console.log("SUCCESS! API Key is good and V1 works.");
        console.log(JSON.stringify(data, null, 2));
    } else {
        console.error("FAILED.");
        console.error("Status:", response.status);
        const text = await response.text();
        console.error("Response:", text);
    }
}

testRest();
