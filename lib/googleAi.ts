import { Dog } from './dog';

type DogInput = Pick<Dog, 'speed' | 'bark' | 'chomp' | 'personality'>;

/**
 * Stub function for generating a dog portrait via Google AI (Gemini).
 * Currently returns a placeholder image data URI.
 * TODO: Wire in real Gemini API call via GOOGLE_AI_API_KEY when ready.
 */
export async function generatePortrait(dog: DogInput): Promise<string> {
  // Stub: return a simple placeholder SVG data URI
  const svgString = `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="80" fill="#FFA500" />
      <circle cx="70" cy="80" r="15" fill="#2C3E50" />
      <circle cx="130" cy="80" r="15" fill="#2C3E50" />
      <ellipse cx="100" cy="120" rx="30" ry="40" fill="#8B6F47" />
      <text x="100" y="180" font-size="12" text-anchor="middle" fill="#666">
        ${dog.personality}
      </text>
    </svg>
  `;

  const encoded = Buffer.from(svgString).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

/**
 * Stub function for generating a dog bio/taunt via Google AI (Gemini).
 * Currently returns a simple placeholder text built from the dog's stats.
 * TODO: Wire in real Gemini API call via GOOGLE_AI_API_KEY when ready.
 */
export async function generateBioTaunt(dog: DogInput): Promise<string> {
  // Stub: build a simple placeholder bio from the dog's stats and personality
  const traits: string[] = [];

  if (dog.speed > 80) traits.push('lightning-fast');
  if (dog.bark > 80) traits.push('loud');
  if (dog.chomp > 80) traits.push('fierce');

  if (dog.speed < 60) traits.push('steady');
  if (dog.bark < 60) traits.push('quiet');
  if (dog.chomp < 60) traits.push('gentle');

  const traitString =
    traits.length > 0 ? traits.join(', ') : 'balanced and determined';

  return `A ${dog.personality} pup with a ${traitString} demeanor. Ready to face any challenge with unwavering spirit!`;
}
