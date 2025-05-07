import { PrismaClient } from '@prisma/client';
// Change this import to match the one in chat.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateGigEmbeddings, embedToPostgresVector } from '../utils/embeddings.js';

const prisma = new PrismaClient();
// Change how you initialize it - pass API key directly, not as an object
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
/**
 * Process a chat message and provide an AI response with profile recommendations
 */
export const handleProfileSearchChat = async (req, res) => {
    try {
        const { message, chatHistory } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, message: 'Chat message is required' });
        }

        // Initialize Gemini model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        
        // Format chat history for Gemini
        let formattedHistory = chatHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: typeof msg.text === 'string' ? msg.text : 'Message content' }]
        }));

        // Filter history to ensure it starts with a user message
        if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
            // Remove bot messages until we find a user message
            let userMessageIndex = formattedHistory.findIndex(msg => msg.role === 'user');
            
            if (userMessageIndex === -1) {
                // If no user messages found, don't use any history
                formattedHistory = [];
            } else {
                // Start history from the first user message
                formattedHistory = formattedHistory.slice(userMessageIndex);
            }
        }

        // Start a chat session
        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 800,
            },
        });
        
        // First, ask Gemini to analyze the user's intent
        const intentResponse = await chat.sendMessage(`
            I'm a profile search assistant. The user said: "${message}"
            
            1. Is this a search for freelancer profiles? Answer YES or NO.
            2. If YES, what skills or expertise is the user looking for? Extract keywords.
            3. Format the response as JSON: {"isProfileSearch": true/false, "searchTerms": ["keyword1", "keyword2"]}
        `);
        
        const intentText = intentResponse.response.text();
        let intent;
        try {
            // Extract the JSON from the response
            const jsonMatch = intentText.match(/\{[\s\S]*\}/);
            intent = jsonMatch ? JSON.parse(jsonMatch[0]) : { isProfileSearch: false };
        } catch (error) {
            console.error("Error parsing intent JSON:", error);
            intent = { isProfileSearch: false };
        }
        
        // If this is a profile search, perform vector search
        let searchResults = [];
        if (intent.isProfileSearch && intent.searchTerms?.length > 0) {
            // Generate embeddings for the search terms
            const searchQuery = intent.searchTerms.join(" ");
            const queryEmbedding = await generateGigEmbeddings({ 
                skills: intent.searchTerms,
                codingLanguages: [],
                certificates: [],
                yearsOfExperience: 0
            });
            
            const queryVector = embedToPostgresVector(queryEmbedding);
            
            // Perform vector similarity search
            const results = await prisma.$queryRaw`
                SELECT 
                    g.id, 
                    g.skills, 
                    g."codingLanguages",
                    g.certificates,
                    g."yearsOfExperience",
                    g."hourlyRate",
                    u.id as "userId",
                    u.username,
                    u."fullName",
                    (g.embedding <=> ${queryVector}::vector) as distance
                FROM "Gigs" g
                JOIN "User" u ON g."userId" = u.id
                WHERE g."isProfileGig" = true
                ORDER BY distance ASC
                LIMIT 5
            `;
            
            // Format results
            searchResults = results.map(result => ({
                id: result.id,
                userId: result.userId,
                username: result.username,
                fullName: result.fullName,
                skills: result.skills,
                codingLanguages: result.codingLanguages,
                yearsOfExperience: result.yearsOfExperience,
                hourlyRate: result.hourlyRate,
                profileUrl: `/freelancer/${result.userId}`
            }));
        }
        
        // Generate a response based on search results
        let prompt = "";
        if (searchResults.length > 0) {
            prompt = `
                Here are the profiles I found that match the user's query:
                ${JSON.stringify(searchResults, null, 2)}
                
                Based on these results, provide a helpful response to the user's message: "${message}"
                First, mention how many matches we found and briefly describe the most relevant ones.
                For each profile, mention their name, key skills, experience level, and hourly rate.
                End with an encouragement to check out the profiles and offer to refine the search if needed.
                DO NOT include the full URLs or profile links - I'll handle that separately.
            `;
        } else {
            prompt = `
                I didn't find any freelancer profiles that match the user's query: "${message}"
                
                If this was a search query, apologize that we couldn't find matching profiles and suggest:
                1. Trying broader keywords
                2. Using different skill terms
                3. Asking about different expertise areas
                
                If this wasn't a search query, respond naturally as a helpful freelancer profile search assistant.
                Suggest that you can help find freelancers based on skills, programming languages, experience level, etc.
            `;
        }
        
        const finalResponse = await chat.sendMessage(prompt);
        
        // Return both the AI response and the search results
        return res.status(200).json({
            success: true,
            aiResponse: finalResponse.response.text(),
            searchResults: searchResults,
            isProfileSearch: intent.isProfileSearch
        });
    } catch (error) {
        console.error("Error in handleProfileSearchChat:", error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error processing chat message', 
            error: error.message 
        });
    }
};