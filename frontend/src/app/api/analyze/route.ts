import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const text_message = formData.get('text_message') as string;
    const image = formData.get('image') as File | null;

    let deepfake_score = 0;
    let extortion_score = 0;
    let reasoning = "No threat detected.";

    // 1. Image processing (Mocked for demo)
    if (image && image.name) {
      deepfake_score = 92;
    }

    // 2. Text processing using Gemini API
    if (text_message) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "your_api_key_here") {
        // Fallback to mock logic if API key isn't provided
        const lowerText = text_message.toLowerCase();
        if (lowerText.includes("pay") || lowerText.includes("leak") || lowerText.includes("bitcoin")) {
          extortion_score = 98;
          reasoning = "Message contains obvious extortion keywords (Mock Logic).";
        } else if (lowerText.includes("please")) {
          extortion_score = 10;
        } else {
          extortion_score = 50;
        }
      } else {
        try {
          const ai = new GoogleGenAI({ apiKey: apiKey });
          
          const prompt = `
            You are a cybercrime forensic analyst. Your job is to analyze incoming messages for deepfake sextortion or blackmail attempts.
            Analyze this message and determine the probability (0 to 100) that it is an extortion attempt.
            Provide a 1-sentence reasoning for your score. 
            
            Message: "${text_message}"
          `;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  extortion_score: { type: 'INTEGER' },
                  reasoning: { type: 'STRING' }
                }
              }
            }
          });

          if (response.text) {
            const analysis = JSON.parse(response.text);
            extortion_score = analysis.extortion_score;
            reasoning = analysis.reasoning;
          }
        } catch (e) {
          console.error("Gemini API Error:", e);
          extortion_score = 85;
          reasoning = "Failed to reach AI provider, flagged for caution.";
        }
      }
    }

    // Calculate composite risk score
    const base_score = (deepfake_score * 0.6) + (extortion_score * 0.4);
    let risk_score = base_score;
    if (extortion_score > 80 && deepfake_score > 50) {
      risk_score = Math.min(100, base_score * 1.2);
    }

    return NextResponse.json({
      deepfake_score,
      extortion_score,
      risk_score: Math.round(risk_score * 10) / 10,
      reasoning,
      message: "Analysis complete."
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
