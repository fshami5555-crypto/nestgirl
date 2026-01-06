
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, UserStatus } from "../types";

// Always initialize with an object containing the apiKey from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartGreeting = async (user: UserProfile): Promise<string> => {
  try {
    // Using gemini-3-flash-preview for a basic greeting task
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a warm, supportive female companion. Generate a short, encouraging daily greeting in a warm Arabic dialect (Levantine/Jordanian) for a user named ${user.name} who is ${user.status}. Keep it under 15 words.`,
      config: {
        systemInstruction: "You are a warm, friendly female assistant for a women's wellness app called Nestgirl.",
      }
    });
    // Use .text property directly
    return response.text || "أهلاً بكِ في عائلتكِ، نست جيرل.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return `صباح الخير يا ${user.name}، يومك سعيد!`;
  }
};

export const getMealPlan = async (user: UserProfile, goal: string): Promise<any> => {
  try {
    // Using gemini-3-pro-preview for complex reasoning tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a 7-day healthy meal plan for ${user.name} (Height: ${user.height}cm, Weight: ${user.weight}kg, Status: ${user.status}). Her goal is: ${goal}. Include Breakfast, Lunch, Snack, and Dinner for each day. Return in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              meals: {
                type: Type.OBJECT,
                properties: {
                  breakfast: { type: Type.STRING },
                  lunch: { type: Type.STRING },
                  snack: { type: Type.STRING },
                  dinner: { type: Type.STRING }
                },
                required: ["breakfast", "lunch", "snack", "dinner"]
              }
            },
            required: ["day", "meals"]
          }
        }
      }
    });
    // Use .text property directly
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const getAIResponse = async (user: UserProfile, message: string, history: { role: string, content: string }[]): Promise<string> => {
  try {
    const contents = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));
    
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Using gemini-3-pro-preview for psychological counseling
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents as any,
      config: {
        systemInstruction: `You are a supportive, warm psychological counselor and best friend for women. Your name is 'Nestly'. Speak in a warm, empathetic Jordanian/Levantine dialect (عامية دافئة). The user is ${user.name}, she is ${user.status}. Always be respectful, confidential, and focus on her emotional well-being.`,
      }
    });
    // Use .text property directly
    return response.text || "أنا هنا لأسمعكِ، أخبريني المزيد.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "عذراً يا عزيزتي، حدث خطأ بسيط. أنا معكِ دائماً.";
  }
};
