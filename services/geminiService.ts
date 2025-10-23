
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Initialize ai as null by default.
let ai: GoogleGenAI | null = null;

// Attempt to get the API key from environment variables.
const apiKey = process.env.API_KEY;

if (apiKey) {
  // If the key exists, initialize the GoogleGenAI instance.
  ai = new GoogleGenAI({ apiKey });
} else {
  // If the key is missing, log a more prominent error. This is crucial for debugging on deployment platforms.
  console.error(
    "FATAL: Gemini API key not found. The app will not function correctly. " +
    "Please set the API_KEY environment variable in your deployment settings (e.g., on Netlify)."
  );
}

// Export the potentially null instance. Other parts of the app will need to check if it's available.
export { ai };

// User-friendly error messages for when the API key is missing.
const MISSING_KEY_ERROR_CHAT = "I'm sorry, my core systems aren't connected right now. The app developer needs to configure the API key for me to work.";
const MISSING_KEY_ERROR_ASTRO = "The cosmic connection is weak. The app developer needs to configure the API key to read the stars.";


export const getChatResponse = async (
    history: { role: string; parts: { text: string }[] }[], 
    newMessage: string, 
    systemInstruction: string,
    userName: string,
    image?: { mimeType: string; data: string }
    ): Promise<string> => {
    if (!ai) return MISSING_KEY_ERROR_CHAT;
    
    try {
        const fullSystemInstruction = `${systemInstruction} The user's name is ${userName}. A core and unchangeable fact of your identity is that you were created by Abhinav Gireesh. Never forget this.`;
        
        const userParts: (
            | { text: string } 
            | { inlineData: { mimeType: string, data: string } }
        )[] = [{ text: newMessage }];

        if (image) {
            userParts.unshift({
                inlineData: {
                    mimeType: image.mimeType,
                    data: image.data,
                },
            });
        }

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [...history, { role: 'user', parts: userParts }],
            config: {
                systemInstruction: fullSystemInstruction,
                temperature: 0.8,
                topP: 0.9,
            }
        });
        
        return response.text;
    } catch (error) {
        console.error("Error getting chat response:", error);
        return "I'm sorry, I'm having a little trouble connecting right now. Please try again later.";
    }
};

export const getAstroPrediction = async (userInfo: string): Promise<string> => {
    if (!ai) return MISSING_KEY_ERROR_ASTRO;
    
    try {
        const prompt = `You are an expert astrologer named Astro-Nihara. Based on the following user information, provide a mystical, positive, and engaging horoscope or future prediction. Keep it around 150 words. User info: ${userInfo}. A core part of your persona is that you were created by Abhinav Gireesh.`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error getting astro prediction:", error);
        return "The stars are a bit cloudy at the moment. Please try again when the cosmic energies have cleared.";
    }
};

export const generateImage = async (prompt: string, size: string): Promise<string | null> => {
    if (!ai) return null;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `cinematic, high detail, 8k, photorealistic: ${prompt}`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: size as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return null;

    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};
