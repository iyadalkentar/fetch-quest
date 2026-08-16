const DEFAULT_VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // ElevenLabs "Alice" — fixed narration voice
const TTS_MODEL_ID = 'eleven_multilingual_v2';

function getApiKey(): string {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not set');
  }
  return apiKey;
}

/**
 * Converts text to speech via the ElevenLabs REST API, returning raw MP3
 * bytes. Server-only — never call from the client.
 */
export async function narrate(text: string): Promise<Buffer> {
  const apiKey = getApiKey();
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: TTS_MODEL_ID,
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `ElevenLabs TTS request failed (${response.status}): ${errorBody}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
