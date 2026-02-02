
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

async function testFetch() {
    console.log('Testing raw fetch to Google OpenAI endpoint...');

    const url = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

    const body = {
        model: 'gemini-1.5-flash',
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Hello!' }
        ],
        temperature: 0.2,
        max_tokens: 100
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${googleKey}`
            },
            body: JSON.stringify(body)
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);

    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testFetch();
