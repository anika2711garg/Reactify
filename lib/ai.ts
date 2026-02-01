import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export const MODEL_NAME = 'gemini-1.5-flash';

export default genAI;
