import { GoogleGenAI } from "@google/genai";
import { AccessLog } from "../types";

export const generateAiInsights = async (logs: AccessLog[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not configured. AI insights unavailable.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare a summary to reduce token usage
    const recentLogs = logs.slice(0, 50); // Analyze last 50 logs
    const summary = JSON.stringify(recentLogs.map(l => ({
      type: l.type,
      time: l.timestamp,
      status: l.status,
      block: l.block
    })));

    const prompt = `
      Analyze these hostel entry/exit logs for a student monitoring system.
      Current time is ${new Date().toLocaleTimeString()}.
      
      Logs (JSON): ${summary}

      Identify 3 key insights regarding:
      1. Late entry patterns.
      2. Unusual activity (e.g. many exits at night).
      3. Block-wise comparison.

      Keep it concise, bullet points, professional tone for a Warden.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate AI insights. Please try again later.";
  }
};
