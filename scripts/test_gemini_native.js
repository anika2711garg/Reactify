
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const googleKeyMatch = envContent.match(/GOOGLE_API_KEY=(.+)/);
const googleKey = googleKeyMatch ? googleKeyMatch[1].trim() : null;

if (!googleKey) {
    console.error('No Google Key found');
    process.exit(1);
}

async function testNative() {
    console.log('Testing Gemini Native SDK...');
    try {
        const genAI = new GoogleGenerativeAI(googleKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent('Say hello!');
        const response = await result.response;
        console.log('Success:', response.text());
    } catch (error) {
        console.error('Native SDK Error:', error);
    }
}

testNative();
