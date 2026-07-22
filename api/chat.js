import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const systemInstruction = `You are Agastya, an intuitive, highly proactive personal AI assistant and daily productivity companion.
Your job is to help the user manage their day, track tasks, stay organized, and remain motivated.
Be concise, warm, helpful, clear, and proactive. Ask relevant follow-up questions to help structure their daily tasks.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction 
    });

    // Format history for Gemini API
    const formattedHistory = (history || []).map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.content }]
    }));

    const chat = model.startChat({
      history: formattedHistory
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error('Error generating content:', error);
    return res.status(500).json({ error: 'Failed to communicate with Agastya.' });
  }
}
