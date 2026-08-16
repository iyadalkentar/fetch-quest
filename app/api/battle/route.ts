import { NextResponse } from 'next/server';
import { generateOutcomeLine, DogInput } from '@/lib/googleAi';
import { getFallbackLine } from '@/lib/fallbackLines';
import { RaccoonStats } from '@/lib/raccoon';
import { narrate } from '@/lib/elevenLabs';

interface BattleRequestBody {
  dog: DogInput;
  raccoon: RaccoonStats;
  outcome: 'win' | 'lose';
}

interface BattleResponse {
  line: string;
  audioDataUri: string | null;
}

export async function POST(request: Request): Promise<NextResponse<BattleResponse | { error: string }>> {
  try {
    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { dog, raccoon, outcome } = body as BattleRequestBody;

    // Validate required fields
    if (!dog || typeof dog !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid dog field' },
        { status: 400 }
      );
    }

    if (!raccoon || typeof raccoon !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid raccoon field' },
        { status: 400 }
      );
    }

    if (!outcome || (outcome !== 'win' && outcome !== 'lose')) {
      return NextResponse.json(
        { error: 'Missing or invalid outcome field' },
        { status: 400 }
      );
    }

    // Validate dog fields
    if (
      typeof dog.speed !== 'number' ||
      typeof dog.bark !== 'number' ||
      typeof dog.chomp !== 'number' ||
      typeof dog.personality !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Invalid dog stats or personality' },
        { status: 400 }
      );
    }

    // Validate raccoon fields
    if (
      typeof raccoon.speed !== 'number' ||
      typeof raccoon.bark !== 'number' ||
      typeof raccoon.chomp !== 'number' ||
      typeof raccoon.label !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Invalid raccoon stats or label' },
        { status: 400 }
      );
    }

    // Generate outcome line (with fallback)
    let line: string;
    try {
      line = await generateOutcomeLine(dog, raccoon, outcome);
    } catch (error) {
      console.error('Failed to generate outcome line:', error);
      line = getFallbackLine(outcome);
    }

    // Generate audio narration (best-effort, audio can be null on failure)
    let audioDataUri: string | null = null;
    try {
      const audioBuffer = await narrate(line);
      const base64Audio = audioBuffer.toString('base64');
      audioDataUri = `data:audio/mpeg;base64,${base64Audio}`;
    } catch (error) {
      console.error('Failed to narrate line:', error);
      // audioDataUri stays null, but don't fail the whole response
    }

    return NextResponse.json(
      {
        line,
        audioDataUri,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/battle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
