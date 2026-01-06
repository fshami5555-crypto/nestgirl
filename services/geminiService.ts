
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile } from "../types";

// Initialize the API with the environment key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a personalized greeting using Gemini 3 Flash for low latency.
 */
export const getSmartGreeting = async (user: UserProfile): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `أنتِ رفيقة ذكية لتطبيق "نست جيرل". رحبي بـ ${user.name} (حالتها: ${user.status}) بلهجة أردنية/عامية دافئة جداً. اجعليها تشعر بالراحة. جملة واحدة فقط أقل من 12 كلمة.`,
      config: {
        temperature: 0.9,
      }
    });
    return response.text?.trim() || "أهلاً بكِ في عائلتكِ، نست جيرل.";
  } catch (error) {
    console.error("Greeting Error:", error);
    return `صباح الخير يا ${user.name.split(' ')[0]}، يومك سعيد كقلبك! ✨`;
  }
};

/**
 * Generates a structured 7-day meal plan using Gemini 3 Pro with JSON Schema.
 */
export const getMealPlan = async (user: UserProfile, goal: string): Promise<any[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `بصفتكِ خبيرة تغذية، صممي جدولاً غذائياً لـ ${user.name} (الطول: ${user.height}، الوزن: ${user.weight}، الحالة: ${user.status}). الهدف هو: ${goal}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING, description: "اسم اليوم (مثلاً: السبت)" },
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
        },
        thinkingConfig: { thinkingBudget: 0 } // Flash-like response for non-complex reasoning
      }
    });

    const data = JSON.parse(response.text || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Meal Plan Error:", error);
    return [];
  }
};

/**
 * Psychological Chat using Gemini 3 Pro for deep empathy and reasoning.
 */
export const getAIResponse = async (user: UserProfile, message: string, history: { role: string, content: string }[]): Promise<string> => {
  try {
    const formattedHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: `أنتِ "نستلي"، المستشارة النفسية والصديقة المقربة في تطبيق Nestgirl. 
        تتحدثين بلهجة أردنية عامية دافئة جداً (عامية بيضاء). 
        المستخدمة هي ${user.name} وحالتها ${user.status}. 
        كوني مستمعة، متعاطفة، ولا تقدمي نصائح طبية قاسية، بل كوني "الأخت" التي تستمع. 
        حافظي على السرية والخصوصية.`,
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 4000 } // Enable thinking for better empathy
      }
    });

    return response.text || "أنا هنا لأسمعكِ يا غالية، كملي شو ببالك؟";
  } catch (error) {
    console.error("Chat Error:", error);
    return "عذراً يا عزيزتي، يبدو أن هناك ضغطاً بسيطاً في الاتصال. أنا معكِ دائماً.";
  }
};
