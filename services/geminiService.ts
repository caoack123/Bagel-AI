import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Author, JournalEntry, ChatMessage } from '../types';

// FIX: Removed non-null assertion for API key to align with coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const structuredEntrySchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A concise, evocative title for the entry based on its content.",
        },
        rewrittenContent: {
            type: Type.STRING,
            description: "The original content, rewritten in the author's distinct style. Maintain the original language.",
        },
        summary: {
            type: Type.STRING,
            description: "A concise, one-sentence summary of the entry.",
        },
        mood: {
            type: Type.STRING,
            description: "A single word describing the primary mood (e.g., Joyful, Reflective, Anxious).",
        },
        tags: {
            type: Type.ARRAY,
            description: "A list of 3-5 relevant keywords or tags.",
            items: { type: Type.STRING },
        },
        highlights: {
            type: Type.ARRAY,
            description: "A list of 2-3 key points from the entry, phrased as bullet points.",
            items: { type: Type.STRING },
        },
    },
    required: ["title", "rewrittenContent", "summary", "mood", "tags", "highlights"],
};


export const generateStructuredEntry = async (title: string, content: string, author: Author): Promise<Omit<JournalEntry, 'id' | 'timestamp' | 'originalContent' | 'author'>> => {
    const prompt = `
        You are an expert literary analyst. Your task is to analyze a journal entry and transform it based on the persona of a famous author.
        You must also extract structured data from the entry.
        The user's entry is written in a specific language. Your response, including the rewritten content and all structured data, MUST be in that same language.

        Author Persona: ${author}
        Journal Entry Title: "${title}"
        Journal Entry Content: "${content}"

        Analyze the content and respond with a JSON object containing all the required fields. If the provided Journal Entry Title is empty, create a new one based on the content.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: structuredEntrySchema,
            },
        });
        const jsonString = response.text;
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error generating structured entry from Gemini:", error);
        throw new Error("Failed to enhance entry with AI. Please try again.");
    }
};

export const getChatResponseStream = async (entries: JournalEntry[], conversationHistory: ChatMessage[]): Promise<AsyncGenerator<GenerateContentResponse>> => {
  const journalContext = entries.map(dot => `Date: ${new Date(dot.timestamp).toISOString()}\nTitle: ${dot.title}\nContent: ${dot.originalContent}\n---`).join('\n');
  
  const systemInstruction = `You are a helpful and empathetic AI assistant. The user has provided their journal entries for context. Use them to answer their questions and facilitate a conversation about their thoughts and experiences. Ground your insights in the provided entries, but feel free to be conversational and explore related ideas.`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: `Here are my journal entries for context:\n\n${journalContext}` }]
    },
    {
      role: 'model',
      parts: [{ text: 'Thank you. I have reviewed your journal entries. I am ready to discuss them with you.' }]
    },
    ...conversationHistory.map(message => ({
        role: message.role,
        parts: [{ text: message.content }]
    }))
  ];

  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response;
  } catch (error) {
    console.error("Error getting chat response from Gemini:", error);
    throw new Error("I'm sorry, I encountered an issue trying to respond. Please try again.");
  }
};