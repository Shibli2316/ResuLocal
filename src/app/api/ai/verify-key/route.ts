import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const userApiKey = req.headers.get('x-user-api-key');
    if (!userApiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: userApiKey });
    
    // Perform a lightweight check call to verify key viability
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Write the word "OK".',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Key Verification Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Verification failed. Please check your API key.' 
    }, { status: 400 });
  }
}
