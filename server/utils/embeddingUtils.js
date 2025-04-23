import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure your API key is set in environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

/**
 * Generates text embedding using the Gemini API.
 * @param {string} text The text to embed.
 * @returns {Promise<number[] | null>} The embedding vector or null if an error occurs.
 */
export const generateEmbedding = async (text) => {
    if (!text || typeof text !== 'string') {
        console.error('Invalid text provided for embedding.');
        return null;
    }
    try {
        console.log(`Generating embedding for text starting with: "${text.substring(0, 50)}..."`);
        const result = await model.embedContent(text);
        const embedding = result.embedding;
        if (!embedding || !embedding.values) {
            console.error('Failed to generate embedding: Invalid response structure from API.');
            return null;
        }
        console.log(`Embedding generated successfully. Dimension: ${embedding.values.length}`);
        return embedding.values;
    } catch (error) {
        console.error("Error generating embedding:", error);
        return null;
    }
};

/**
 * Prepares the text content from Gig data for embedding.
 * @param {object} gigData Data relevant to the gig (skills, languages, experience, description).
 * @returns {string} A formatted string for embedding.
 */
export const prepareGigContentForEmbedding = (gigData) => {
    const { skills, codingLanguages, yearsOfExperience, description } = gigData;

    let content = "";
    if (description) content += `Description: ${description}. `;
    if (skills && skills.length > 0) content += `Skills: ${skills.join(', ')}. `;
    if (codingLanguages && codingLanguages.length > 0) content += `Languages: ${codingLanguages.join(', ')}. `;
    if (yearsOfExperience !== undefined) content += `Experience: ${yearsOfExperience} years. `;

    return content.trim();
}; 