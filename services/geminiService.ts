
import { GoogleGenAI, Type } from "@google/genai";
import { DonationItem } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export interface DonationSuggestion {
    id: string;
    reason: string;
}

export const getDonationSuggestions = async (donations: DonationItem[]): Promise<DonationSuggestion[]> => {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        return [];
    }
    
    if (donations.length === 0) {
        return [];
    }

    const prompt = `
        You are an AI assistant for a charity platform called 'Need Feeder'. Your task is to identify the most urgent donation requests.
        I will provide you with a list of current pending donations in JSON format.
        Please analyze them based on their description and type, and identify the top 3 most critical needs.
        Return your response ONLY as a valid JSON array. Each object in the array should contain the 'id' of the donation and a brief 'reason' for its urgency.

        Example response format:
        [
            {"id": "don-123", "reason": "Urgent need for baby formula, which is critical for infant health."},
            {"id": "don-456", "reason": "Request for warm blankets during a cold snap, essential for preventing hypothermia."}
        ]
        
        Current pending donations:
        ${JSON.stringify(donations, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const text = response.text.trim();
        const suggestions: DonationSuggestion[] = JSON.parse(text);
        return suggestions;

    } catch (error) {
        console.error("Error fetching donation suggestions from Gemini:", error);
        return [];
    }
};
