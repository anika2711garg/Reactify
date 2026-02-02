
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const googleKeyMatch = envContent.match(/GOOGLE_API_KEY=(.+)/);
const googleKey = googleKeyMatch ? googleKeyMatch[1].trim() : null;

console.log('Google Key found:', !!googleKey);
if (googleKey) console.log('Google Key starts with:', googleKey.substring(0, 5));

if (!googleKey) {
    console.error('No Google Key found in .env.local');
    process.exit(1);
}

const client = new OpenAI({
    apiKey: googleKey,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
});

async function test() {
    console.log('Testing Gemini 1.5 Flash...');
    try {
        const completion = await client.chat.completions.create({
            model: 'gemini-1.5-flash',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Hello, say hi!' }
            ],
            temperature: 0.2,
            max_tokens: 100, // Small limit for test
        });
        console.log('Success:', completion.choices[0].message.content);
    } catch (error) {
        console.error('Error:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
    }
}

test();
