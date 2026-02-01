
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
let apiKey = '';
for (const line of envContent.split('\n')) {
    const [key, value] = line.split('=');
    if (key.trim() === 'GOOGLE_API_KEY') {
        apiKey = value.trim().replace(/^["']|["']$/g, '');
    }
}

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    fs.writeFileSync('model_list.txt', JSON.stringify(data, null, 2));
    console.log("Model list saved to model_list.txt");
}

listModels();
