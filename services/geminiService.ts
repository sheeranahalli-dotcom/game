import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const generatePuzzleImage = async (prompt: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Cannot generate image.");
  }

  try {
    // Using gemini-2.5-flash-image for speed and efficiency as per guidance
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Create a highly detailed, vivid, and artistic square image based on this description: "${prompt}". The style should be suitable for a puzzle, with clear distinct features. Aspect ratio 1:1.`,
          },
        ],
      },
      // Config to ensure we get a good aspect ratio
      config: {
        imageConfig: {
          aspectRatio: "1:1", 
        }
      }
    });

    // Parse the multipart response to find the inline image data
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${base64Data}`;
        }
      }
    }

    throw new Error("No image data found in the response.");
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};