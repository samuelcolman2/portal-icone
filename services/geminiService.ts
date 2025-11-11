
import { GoogleGenAI } from "@google/genai";
import type { GeminiSearchResult, SearchResultSource } from '../types';

// Ensure the API key is available in the environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Missing VITE_GEMINI_API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Sends a prompt to the Gemini API and returns the text response.
 * @param prompt - The user's question or prompt.
 * @returns The generated text from the model.
 */
export async function askGemini(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Contexto: Você é um assistente de IA para a intranet de uma empresa. Responda às perguntas dos funcionários de forma concisa e profissional. Pergunta: "${prompt}"`,
    });
    
    // Using the recommended .text property to get the response
    const text = response.text;
    if (!text) {
        return "Não consegui encontrar uma resposta.";
    }
    
    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get response from Gemini API.");
  }
}

/**
 * Performs a Google search using Gemini's grounding tool.
 * @param query - The search query.
 * @returns The generated summary and a list of sources.
 */
export async function searchGoogleWithGemini(query: string): Promise<GeminiSearchResult> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const summary = response.text;
    if (!summary) {
      return { summary: "Não foi possível gerar um resumo.", sources: [] };
    }

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: SearchResultSource[] = groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        uri: chunk.web?.uri || '',
        title: chunk.web?.title || 'Fonte desconhecida',
      }))
      .filter((source: SearchResultSource) => source.uri) || [];
      
    // Deduplicate sources based on URI
    const uniqueSources = Array.from(new Map(sources.map(item => [item['uri'], item])).values());

    return { summary, sources: uniqueSources };

  } catch (error) {
    console.error("Error calling Gemini API for search:", error);
    throw new Error("Failed to get search results from Gemini API.");
  }
}
