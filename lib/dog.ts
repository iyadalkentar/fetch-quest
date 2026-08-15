export const PERSONALITY_TAGS = [
  'Territorial',
  'Nervous',
  'Good Boy',
  'Goofy',
  'Grumpy',
  'Sneaky',
  'Loyal',
  'Reckless',
] as const;

export type PersonalityTag = (typeof PERSONALITY_TAGS)[number];

export interface Dog {
  speed: number;
  bark: number;
  chomp: number;
  personality: PersonalityTag;
  portraitUrl: string;
  bio: string;
  generationFailed: boolean;
}

interface BiasTable {
  speed: number;
  bark: number;
  chomp: number;
}

const PERSONALITY_BIAS: Record<PersonalityTag, BiasTable> = {
  Territorial: { speed: -1, bark: 2, chomp: 2 },
  Nervous: { speed: 3, bark: -1, chomp: -2 },
  'Good Boy': { speed: 0, bark: 1, chomp: -1 },
  Goofy: { speed: 2, bark: 1, chomp: 0 },
  Grumpy: { speed: -1, bark: 2, chomp: 1 },
  Sneaky: { speed: 2, bark: -2, chomp: 1 },
  Loyal: { speed: 1, bark: 1, chomp: 1 },
  Reckless: { speed: 2, bark: 2, chomp: 2 },
};

const BASE_STAT_RANGE = { min: 50, max: 95 };

export function rollDog(): Omit<Dog, 'portraitUrl' | 'bio' | 'generationFailed'> {
  // Pick a random personality tag
  const personality =
    PERSONALITY_TAGS[Math.floor(Math.random() * PERSONALITY_TAGS.length)];

  // Get the bias table for this personality
  const bias = PERSONALITY_BIAS[personality];

  // Roll stats with personality bias applied
  const speed = rollStat(bias.speed);
  const bark = rollStat(bias.bark);
  const chomp = rollStat(bias.chomp);

  return {
    speed,
    bark,
    chomp,
    personality,
  };
}

function rollStat(biasModifier: number): number {
  // Apply bias: each bias point shifts the stat by ±3
  const bias = biasModifier * 3;

  // Shrink the sampling window in the opposite direction of the bias
  // so that after adding the bias, the result naturally spans [50, 95] without clipping.
  // For positive bias: shrink the upper bound. For negative bias: shrink the lower bound.
  const minBase = BASE_STAT_RANGE.min - Math.min(0, bias);
  const maxBase = BASE_STAT_RANGE.max - Math.max(0, bias);

  // Roll a base value over the adjusted range
  const baseRoll =
    minBase + Math.floor(Math.random() * (maxBase - minBase + 1));

  // Apply bias to get the final stat
  const biasedStat = baseRoll + bias;

  // Clamp to the base range as a safety net (should rarely be needed now)
  return Math.max(
    BASE_STAT_RANGE.min,
    Math.min(BASE_STAT_RANGE.max, biasedStat)
  );
}
