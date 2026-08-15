import { Dog } from './dog';

type DogInput = Pick<Dog, 'speed' | 'bark' | 'chomp' | 'personality'>;

interface Palette {
  bg: string;
  fur: string;
  accent: string;
}

const PERSONALITY_PALETTE: Record<DogInput['personality'], Palette> = {
  Territorial: { bg: '#fee2e2', fur: '#b45309', accent: '#7c2d12' },
  Nervous: { bg: '#e0e7ff', fur: '#a8a29e', accent: '#57534e' },
  'Good Boy': { bg: '#fef3c7', fur: '#d97706', accent: '#78350f' },
  Goofy: { bg: '#fce7f3', fur: '#f472b6', accent: '#9d174d' },
  Grumpy: { bg: '#e5e7eb', fur: '#4b5563', accent: '#1f2937' },
  Sneaky: { bg: '#ecfccb', fur: '#4d7c0f', accent: '#1a2e05' },
  Loyal: { bg: '#dbeafe', fur: '#1d4ed8', accent: '#1e3a8a' },
  Reckless: { bg: '#ffedd5', fur: '#ea580c', accent: '#7c2d12' },
};

/**
 * Builds a deterministic cartoon dog-face portrait from stats/personality,
 * as an SVG data URI. Used when AI portrait generation is unavailable
 * (e.g. the API key's tier doesn't support image generation).
 */
export function generatePlaceholderPortrait(dog: DogInput): string {
  const palette = PERSONALITY_PALETTE[dog.personality];

  // Map stats (roughly 50-95) into visual proportions.
  const earFlop = 10 + (dog.speed / 95) * 20; // faster dogs -> perkier/shorter ears
  const mouthWidth = 20 + (dog.bark / 95) * 30; // louder bark -> wider open mouth
  const fangSize = 4 + (dog.chomp / 95) * 10; // bigger chomp -> bigger fangs

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="${palette.bg}"/>
  <g>
    <path d="M 55 70 Q 30 ${70 - earFlop} 40 100 Q 55 90 65 75 Z" fill="${palette.fur}"/>
    <path d="M 145 70 Q 170 ${70 - earFlop} 160 100 Q 145 90 135 75 Z" fill="${palette.fur}"/>
    <circle cx="100" cy="110" r="55" fill="${palette.fur}"/>
    <circle cx="80" cy="105" r="8" fill="white"/>
    <circle cx="80" cy="105" r="4" fill="${palette.accent}"/>
    <circle cx="120" cy="105" r="8" fill="white"/>
    <circle cx="120" cy="105" r="4" fill="${palette.accent}"/>
    <ellipse cx="100" cy="130" rx="14" ry="10" fill="${palette.accent}"/>
    <path d="M 100 140 Q 100 150 ${100 - mouthWidth / 2} 155 Q 100 165 ${100 + mouthWidth / 2} 155 Q 100 150 100 140 Z" fill="${palette.accent}"/>
    <path d="M ${100 - mouthWidth / 2 + 4} 152 L ${100 - mouthWidth / 2 + 4} ${152 + fangSize} L ${100 - mouthWidth / 2 + 9} 152 Z" fill="white"/>
    <path d="M ${100 + mouthWidth / 2 - 4} 152 L ${100 + mouthWidth / 2 - 4} ${152 + fangSize} L ${100 + mouthWidth / 2 - 9} 152 Z" fill="white"/>
  </g>
  <text x="100" y="192" text-anchor="middle" font-size="11" fill="${palette.accent}" font-family="sans-serif" font-weight="bold">${dog.personality}</text>
</svg>`.trim();

  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');

  return `data:image/svg+xml,${encoded}`;
}
