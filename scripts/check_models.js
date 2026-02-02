
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const keyLine = lines.find(l => l.trim().startsWith('GOOGLE_API_KEY='));
const key = keyLine ? keyLine.split('=')[1].trim() : null;

if (!key) {
    console.error('No key found');
    process.exit(1);
}

async function listModels() {
    console.log('Key prefix:', key.substring(0, 5));
    const genAI = new GoogleGenerativeAI(key);
    // There isn't a direct "listModels" in the simplified SDK usage, 
    // but usually checking the generic 'gemini-pro' is a good sanity check.

    // Attempt standard models
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro'];

    for (const m of models) {
        console.log(`Testing model: ${m}`);
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent('Hi');
            const response = await result.response;
            console.log(`✅ ${m} WORKS!`);
            return; // Found one
        } catch (e) {
            console.log(`❌ ${m} Failed: ${e.message}`);
        }
    }
}

listModels();
