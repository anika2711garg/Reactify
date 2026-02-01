import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = (process.env.GOOGLE_API_KEY || '').trim().replace(/^["']|["']$/g, '');
const genAI = new GoogleGenerativeAI(apiKey);

export const MODEL_NAME = 'gemini-2.5-flash';

export default genAI;
