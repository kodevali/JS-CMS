
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateNewsDraft = async (prompt: string, department: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Draft a professional internal news article for JS Bank's ${department} department based on this request: ${prompt}. 
               Maintain a corporate, high-trust tone suitable for a major financial institution.
               Format the response as JSON with title, summary (short), and content (full article).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          content: { type: Type.STRING }
        },
        required: ["title", "summary", "content"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return null;
  }
};

export const refineContent = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Refine and improve the professional tone of this internal JS Bank memo: ${text}. Return just the improved text.`,
  });
  return response.text;
};
