import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API with the Google Generative AI key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generates embeddings for gig data using Gemini
 * @param {Object} gigData - The gig data to generate embeddings for
 * @returns {Promise<Float64Array>} The generated embeddings
 */
export async function generateGigEmbeddings(gigData) {
    try {
        // Combine relevant gig data into a single text
        const textToEmbed = [
            ...(gigData.skills || []),
            ...(gigData.codingLanguages || []),
            ...(gigData.certificates || []),
            `${gigData.yearsOfExperience} years of experience`
        ].filter(Boolean).join(" ");

        console.log("Text to embed:", textToEmbed);

        // Generate embeddings using the latest model
        const response = await ai.models.embedContent({
            model: 'embedding-001',
            contents: textToEmbed,
            config: {
                taskType: "SEMANTIC_SIMILARITY",
            }
        });

        // Log the raw API response
        console.log("Raw Gemini API response:", JSON.stringify(response, null, 2));

        // Extract the values from the response
        // Response format is { embeddings: [ { values: number[] } ] }
        const embeddingObject = response.embeddings?.[0];
        if (!embeddingObject || !Array.isArray(embeddingObject.values)) {
            console.error("Could not find embeddings[0].values in the response:", response);
            throw new Error('Invalid embedding format received from API');
        }

        const embeddingValues = embeddingObject.values;
        console.log("Successfully extracted embedding values:", embeddingValues.length);
        return embeddingValues;
    } catch (error) {
        console.error("Error in generateGigEmbeddings:", error);
        throw error;
    }
}

/**
 * Converts embeddings array to Postgres vector format
 * @param {Array<number>} embeddings - The embeddings array
 * @returns {string} Postgres vector format
 */
export function embedToPostgresVector(embeddings) {
    if (!Array.isArray(embeddings)) {
        throw new Error('Embeddings must be an array of numbers');
    }
    return `[${embeddings.join(',')}]`;
} 