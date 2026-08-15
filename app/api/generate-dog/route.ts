import { NextResponse } from 'next/server';
import { rollDog, Dog } from '@/lib/dog';
import { generatePortrait, generateBioTaunt } from '@/lib/googleAi';

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
      // Fallback to a simple placeholder
      portraitUrl = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%22100%22 y=%22100%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2214%22 fill=%22%23999%22%3ENo portrait%3C/text%3E%3C/svg%3E';
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
