import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const GeminiService = {
  /**
   * Generates a list of actionable sub-steps for a given task.
   */
  generateSubsteps: async (title: string, description?: string): Promise<string[]> => {
    if (!apiKey) {
      console.warn("No API Key found for Gemini.");
      return ["Check API Key Configuration", "Manually add steps"];
    }

    try {
      const prompt = `
        Task: ${title}
        ${description ? `Context: ${description}` : ''}
        
        You are an expert Project Manager. Break down this task into 3-5 concrete, actionable steps.
        Keep them concise (under 10 words each).
        Return ONLY a JSON array of strings.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            }
          }
        }
      });

      const text = response.text;
      if (!text) return [];

      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];

    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
};