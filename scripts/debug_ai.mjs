
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

const apiKey = process.env.GOOGLE_API_KEY;
console.log(`API Key present: ${!!apiKey}`);

const genAI = new GoogleGenerativeAI(apiKey);


const logFile = path.resolve(process.cwd(), 'debug_output.txt');
const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

async function testModel(modelName) {
    log(`\n--- Testing ${modelName} ---`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("hello");
        log("Success! Response: " + result.response.text());
    } catch (e) {
        log("FAILED.");
        log("Error Message: " + e.message);
        if (e.response) {
            log("Error Details: " + JSON.stringify(e.response, null, 2));
        }
    }
}

async function run() {
    fs.writeFileSync(logFile, ''); // Clear file
    await testModel('gemini-1.5-flash');
    await testModel('gemini-pro');
}


run();
