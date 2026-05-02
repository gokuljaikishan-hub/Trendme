import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export interface OutfitSuggestion {
  id: string;
  name: string;
  description: string;
  styleNotes: string;
  colors: string[];
  shoppingSearchTerms: {
    site: string;
    query: string;
    url: string;
  }[];
}

export async function analyzeAndSuggestOutfits(
  base64Image: string,
  occasion: string
): Promise<OutfitSuggestion[]> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze the uploaded photo of the person and suggest exactly 5 outfits suitable for the occasion: "${occasion}".
    The suggestions should match the person's physique and skin tone seen in the photo.
    For each outfit, provide:
    1. A catchy name.
    2. A detailed description.
    3. Specific style notes.
    4. Primary colors.
    5. Search terms for Indian shopping sites (Myntra, Ajio, Amazon.in, Flipkart).
    
    Ensure the color and style are consistent. Return the data in valid JSON format.
  `;

  try {
    const response = await getAI().models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Image.split(',')[1] || base64Image,
                mimeType: "image/jpeg"
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              styleNotes: { type: Type.STRING },
              colors: { type: Type.ARRAY, items: { type: Type.STRING } },
              shoppingSearchTerms: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    site: { type: Type.STRING },
                    query: { type: Type.STRING },
                    url: { type: Type.STRING, description: "A search URL for the item on the specific site (e.g. https://www.myntra.com/search?q=...)" }
                  },
                  required: ["site", "query", "url"]
                }
              }
            },
            required: ["id", "name", "description", "styleNotes", "colors", "shoppingSearchTerms"]
          }
        }
      }
    });

    const text = response.text || "[]";
    const result = JSON.parse(text);
    
    // Ensure URLs are properly formatted for Indian sites if model returned placeholders
    const finalResult = result.map((outfit: any) => ({
      ...outfit,
      shoppingSearchTerms: outfit.shoppingSearchTerms.map((term: any) => {
        const query = encodeURIComponent(term.query);
        let url = term.url;
        if (term.site.toLowerCase().includes('myntra')) url = `https://www.myntra.com/search?q=${query}`;
        if (term.site.toLowerCase().includes('amazon')) url = `https://www.amazon.in/s?k=${query}`;
        if (term.site.toLowerCase().includes('ajio')) url = `https://www.ajio.com/search/?text=${query}`;
        if (term.site.toLowerCase().includes('flipkart')) url = `https://www.flipkart.com/search?q=${query}`;
        return { ...term, url };
      })
    }));

    return finalResult;
  } catch (error) {
    console.error("Error suggesting outfits:", error);
    throw error;
  }
}

export async function generateTryOnPreview(
  originalBase64: string,
  outfitDescription: string
): Promise<string> {
  const model = "gemini-2.5-flash-image";
  
  // Note: We are using the original image as context and asking specifically for outfit replacement
  // while keeping the face and person's characteristics consistent.
  const prompt = `
    VIRTUAL TRY-ON REQUEST:
    Take the person from the provided image and replace their Current outfit with this new outfit: "${outfitDescription}".
    CRITICAL REQUIREMENTS:
    1. DO NOT change the person's face, features, or skin tone.
    2. Keep the person in the same pose and position.
    3. The new outfit must exactly match the description in terms of color and style.
    4. Ensure the lighting and integration look photorealistic.
    5. No other changes to the environment or the person's body.
  `;

  try {
    const response = await getAI().models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: originalBase64.split(',')[1] || originalBase64,
              mimeType: "image/jpeg"
            }
          },
          { text: prompt }
        ]
      }
    });

    // Iterate through parts to find the image
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated by the AI");
  } catch (error) {
    console.error("Error generating try-on preview:", error);
    throw error;
  }
}
