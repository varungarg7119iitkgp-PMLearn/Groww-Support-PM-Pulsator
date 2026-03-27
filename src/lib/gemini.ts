import { GoogleGenerativeAI } from "@google/generative-ai";

let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (_genAI) return _genAI;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY not configured. Set it in .env.local"
    );
  }

  _genAI = new GoogleGenerativeAI(apiKey);
  return _genAI;
}

export async function generateContent(
  prompt: string,
  model: string = "gemini-2.5-flash"
): Promise<string> {
  const genAI = getGenAI();
  const genModel = genAI.getGenerativeModel({ model });

  const result = await genModel.generateContent(prompt);
  const response = result.response;
  return response.text();
}
