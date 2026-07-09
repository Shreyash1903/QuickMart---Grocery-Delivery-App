import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const askGemini = async (query, categories) => {
  try {
    const prompt = `
You are an AI Shopping Assistant.

The available product categories are:

${categories.join("\n")}

Rules:

1. Choose ONLY ONE category from the above list.
2. If no category matches, return an empty string.
3. Extract maximum price if mentioned.
4. Extract useful keywords.
5. Return ONLY valid JSON.

Example:

{
  "category":"Dairy, Bread & Eggs",
  "maxPrice":50,
  "keywords":["milk"]
}

User Query:
${query}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawText = response.text || "";
    const cleanedText = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```/g, "")
      .trim();

    const jsonStart = cleanedText.indexOf("{");
    const jsonEnd = cleanedText.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Gemini response did not contain valid JSON");
    }

    const jsonText = cleanedText.slice(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonText);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
