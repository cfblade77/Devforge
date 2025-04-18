// pages/api/chat.js

import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import cookie from 'cookie';

// In-memory storage (note: this will be lost on server restart or in serverless environments)
const chatSessions = {};        // { sessionId: { model, history: [...] } }
const resumeDataSessions = {};  // { sessionId: { skills, codingLanguages, yearsOfExperience, certificates } }

export default async function handler(req, res) {
  // Parse cookies from the request header
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  
  // Use GET to initialize session
  if (req.method === 'GET') {
    let sessionId = cookies.sessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      res.setHeader('Set-Cookie', cookie.serialize('sessionId', sessionId, { httpOnly: true, path: '/' }));
    }
  
    if (!chatSessions[sessionId]) {
      console.log(`Initializing a new chat session for sessionId: ${sessionId}`);
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        console.error("API key is missing");
        return res.status(500).json({ error: 'API key is not configured' });
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
      const systemMessage = `
        You are an interactive, helpful assistant that extracts profile information for a developer’s profile. Focus only on these keys: "skills", "codingLanguages", "yearsOfExperience", and "certificates". Please always include any detected information in a JSON block formatted as follows (only include keys if relevant data is found):
        \`\`\`json
        {
          "skills": [...],
          "codingLanguages": [...],
          "yearsOfExperience": number,
          "certificates": [...]
        }
        \`\`\`
        Respond conversationally and do not reveal that you are maintaining this JSON data behind the scenes.
      `;
  
      // Initialize session state
      chatSessions[sessionId] = {
        model,
        history: [systemMessage],
      };
      resumeDataSessions[sessionId] = {
        skills: null,
        codingLanguages: null,
        yearsOfExperience: null,
        certificates: null,
      };
      console.log(`Chat session and resume data initialized for sessionId ${sessionId}`);
    }
    return res.status(200).json({ message: "Session initialized", sessionId });
  }
  
  // POST: Process a chat message
  if (req.method === 'POST') {
    const sessionId = await cookies.sessionId || req.body.sessionId;
    console.log(`Chat session for sessionId ${sessionId}`);
    if (!sessionId || !chatSessions[sessionId]) {
      console.error(`Session ID ${sessionId} not found in chatSessions`);
      return res.status(400).json({ error: "Session not found; please initialize your session." });
    }
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: "Message is required." });
    }
  
    console.log(`Session ${sessionId} received user message: ${userMessage}`);
  
    chatSessions[sessionId].history.push(userMessage);
    const prompt = `${chatSessions[sessionId].history.join("\n")}\nUser: ${userMessage}\nAssistant:`;
    console.log("Constructed prompt for AI:");
    console.log(prompt);
  
    try {
      const result = await chatSessions[sessionId].model.generateContent(prompt);
      if (!result.response || typeof result.response.text !== "function") {
        console.error("Invalid response format from generateContent:", result.response);
        throw new Error("Invalid response format from generateContent");
      }
  
      const responseText = result.response.text();
      console.log("Received AI response text:");
      console.log(responseText);
  
      chatSessions[sessionId].history.push(responseText);
  
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          const extractedData = JSON.parse(jsonMatch[1].trim());
          console.log("Extracted JSON data:", extractedData);
          const allowedKeys = ["skills", "codingLanguages", "yearsOfExperience", "certificates"];
          const currentData = resumeDataSessions[sessionId];
          allowedKeys.forEach(key => {
            if (extractedData[key] !== undefined && extractedData[key] !== null) {
              console.log(`Updating key '${key}' with value:`, extractedData[key]);
              currentData[key] = extractedData[key];
            }
          });
          resumeDataSessions[sessionId] = currentData;
  
          const cleanResponse = responseText.replace(/```json\s*([\s\S]*?)\s*```/, '').trim();
          return res.status(200).json({ response: cleanResponse, resumeData: currentData });
        } catch (e) {
          console.error("Error parsing JSON from AI response:", e);
          return res.status(500).json({ error: "Error parsing JSON", message: e.message });
        }
      }
  
      return res.status(200).json({ response: responseText, resumeData: resumeDataSessions[sessionId] });
  
    } catch (err) {
      console.error("Chatbot error during generateContent call:", err);
      return res.status(500).json({ error: "Chatbot error", message: err.message });
    }
  }
  
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
