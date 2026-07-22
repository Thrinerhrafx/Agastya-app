import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is missing on the server.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Agastya System Prompt - Defines its persona and task behavior
    const systemInstruction = `
      You are Agastya, an intuitive, highly proactive personal AI assistant and daily productivity companion.
      Your job is to help the user manage their day, track tasks, stay organized, and remain motivated.
      Be concise, warm, helpful, clear, and proactive.
      Ask relevant follow-up questions to help structure their daily tasks.
    `;

    // Convert chat history into standard structure
    const contents = (history || []).map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.content }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return res.status(200).json({ reply: response.text });
  } catch (error) {
    console.error('Error generating content:', error);
    return res.status(500).json({ error: 'Failed to communicate with Agastya.' });
  }
}
