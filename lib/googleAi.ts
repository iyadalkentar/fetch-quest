import { GoogleGenAI } from '@google/genai';
import { Dog } from './dog';

type DogInput = Pick<Dog, 'speed' | 'bark' | 'chomp' | 'personality'>;

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (client) return client;

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY is not set');
  }

  client = new GoogleGenAI({ apiKey });
  return client;
}

function describeDog(dog: DogInput): string {
  return `Speed ${dog.speed}, Bark ${dog.bark}, Chomp ${dog.chomp}, personality "${dog.personality}"`;
}

/**
 * Generates a dog portrait via Google AI (Gemini image generation),
 * returned as a data URI.
 */
export async function generatePortrait(dog: DogInput): Promise<string> {
  const ai = getClient();

  const prompt =
    `A single portrait illustration of a scrappy cartoon battle dog for a game, ` +
    `full body, plain background. Its personality is "${dog.personality}" and its ` +
    `stats are ${describeDog(dog)} — let the pose and expression reflect those ` +
    `stats and personality. Vibrant colors, simple flat illustration style.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: prompt,
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((part) => part.inlineData?.data);
  if (!imagePart?.inlineData?.data) {
    throw new Error('Google AI returned no image data');
  }

  const mimeType = imagePart.inlineData.mimeType ?? 'image/png';
  return `data:${mimeType};base64,${imagePart.inlineData.data}`;
}

/**
 * Generates a short bio/taunt line for the dog via Google AI (Gemini), based
 * on its rolled stats and personality tag so the flavor text stays
 * consistent with the roll.
 */
export async function generateBioTaunt(dog: DogInput): Promise<string> {
  const ai = getClient();

  const prompt =
    `Write a single short, punchy bio/taunt line (1-2 sentences max) for a ` +
    `battle dog in a lighthearted dog-vs-raccoon fighting game. ` +
    `Personality tag: "${dog.personality}". Stats: ${describeDog(dog)}. ` +
    `The line should reflect the personality and stats. ` +
    `Respond with only the line itself, no quotes, no extra commentary.`;

  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: prompt,
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error('Google AI returned no bio/taunt text');
  }

  return text;
}
