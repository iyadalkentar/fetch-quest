import { NextResponse } from 'next/server';
import { rollDog, Dog } from '@/lib/dog';
import { generatePortrait, generateBioTaunt } from '@/lib/googleAi';
import { generatePlaceholderPortrait } from '@/lib/placeholderPortrait';

export async function POST(request: Request) {
  try {
    // Manual QA hook for testing the failure/fallback path without needing a bad API key.
    // Can be exercised via curl: POST /api/generate-dog?simulateFailure=true
    const url = new URL(request.url);
    const simulateFailure = url.searchParams.get('simulateFailure') === 'true';

    // Roll the dog's stats and personality
    const rolledDog = rollDog();

    // Generate portrait and bio/taunt via Google AI
    let portraitUrl: string;
    let bio: string;
    let generationFailed = false;

    try {
      if (simulateFailure) {
        throw new Error('Simulated failure for QA testing');
      }
      portraitUrl = await generatePortrait(rolledDog);
    } catch (error) {
      console.error('Failed to generate portrait:', error);
      // Fallback to a stats-driven procedural portrait (e.g. when the AI
      // key's tier doesn't support image generation)
      portraitUrl = generatePlaceholderPortrait(rolledDog);
      generationFailed = true;
    }

    try {
      bio = await generateBioTaunt(rolledDog);
    } catch (error) {
      console.error('Failed to generate bio/taunt:', error);
      // Fallback to a simple placeholder
      bio = 'A fearless pup ready to take on any challenge.';
      generationFailed = true;
    }

    const dog: Dog = {
      ...rolledDog,
      portraitUrl,
      bio,
      generationFailed,
    };

    return NextResponse.json(dog, { status: 200 });
  } catch (error) {
    console.error('Error in /api/generate-dog:', error);
    return NextResponse.json(
      { error: 'Failed to generate dog' },
      { status: 500 }
    );
  }
}
