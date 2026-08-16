/**
 * Fixed raccoon opponent for the fight step.
 * These stats are hardcoded and never re-rolled.
 */

// Hand-authored raccoon SVG portrait as a data URI
const RACCOON_PORTRAIT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#f5e6d3"/>

  <!-- Tail (visible behind body) -->
  <path d="M 160 140 Q 180 120 185 80 Q 190 60 175 55 Q 170 75 160 95 Z" fill="#4a3728" stroke="#2a2114" stroke-width="1"/>

  <!-- Body -->
  <ellipse cx="100" cy="130" rx="45" ry="50" fill="#6b5344"/>

  <!-- Head -->
  <circle cx="100" cy="90" r="50" fill="#7a6352"/>

  <!-- Ears -->
  <path d="M 60 55 Q 50 35 65 40 Q 70 50 65 65 Z" fill="#7a6352"/>
  <path d="M 65 45 Q 60 40 63 50 Z" fill="#f5e6d3"/>
  <path d="M 140 55 Q 150 35 135 40 Q 130 50 135 65 Z" fill="#7a6352"/>
  <path d="M 135 45 Q 140 40 137 50 Z" fill="#f5e6d3"/>

  <!-- Black mask/stripe across face -->
  <ellipse cx="80" cy="85" rx="12" ry="16" fill="#1a1a1a"/>
  <ellipse cx="120" cy="85" rx="12" ry="16" fill="#1a1a1a"/>
  <path d="M 75 90 Q 100 95 125 90" fill="none" stroke="#1a1a1a" stroke-width="8"/>

  <!-- Eye whites -->
  <circle cx="78" cy="82" r="6" fill="white"/>
  <circle cx="122" cy="82" r="6" fill="white"/>

  <!-- Eye pupils -->
  <circle cx="78" cy="82" r="3" fill="#000"/>
  <circle cx="122" cy="82" r="3" fill="#000"/>

  <!-- Eye shine -->
  <circle cx="79" cy="80" r="1.5" fill="white"/>
  <circle cx="123" cy="80" r="1.5" fill="white"/>

  <!-- Nose -->
  <ellipse cx="100" cy="105" rx="6" ry="5" fill="#1a1a1a"/>

  <!-- Mouth -->
  <path d="M 100 105 Q 95 115 90 115" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
  <path d="M 100 105 Q 105 115 110 115" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>

  <!-- Whiskers -->
  <line x1="65" y1="95" x2="45" y2="93" stroke="#8a7354" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="65" y1="105" x2="45" y2="108" stroke="#8a7354" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="135" y1="95" x2="155" y2="93" stroke="#8a7354" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="135" y1="105" x2="155" y2="108" stroke="#8a7354" stroke-width="1.5" stroke-linecap="round"/>

  <!-- Personality label -->
  <text x="100" y="192" text-anchor="middle" font-size="11" fill="#8a7354" font-family="sans-serif" font-weight="bold">Feral</text>
</svg>
`.trim();

const encoded = encodeURIComponent(RACCOON_PORTRAIT_SVG)
  .replace(/'/g, '%27')
  .replace(/"/g, '%22');

export const RACCOON_PORTRAIT_URL = `data:image/svg+xml,${encoded}`;

export interface RaccoonStats {
  speed: number;
  bark: number;
  chomp: number;
  label: string;
  portraitUrl: string;
}

export const RACCOON: RaccoonStats = {
  speed: 55,
  bark: 85,
  chomp: 80,
  label: 'Feral',
  portraitUrl: RACCOON_PORTRAIT_URL,
};
