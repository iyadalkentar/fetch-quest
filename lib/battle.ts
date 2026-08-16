import { Dog } from './dog';
import { RaccoonStats } from './raccoon';

export interface BattleResult {
  outcome: 'win' | 'lose';
  statDeltas: {
    speed: number;
    bark: number;
    chomp: number;
  };
  swing: number;
  total: number;
}

/**
 * Seeded PRNG using mulberry32 algorithm.
 * Returns a function that generates deterministic 0-1 floats for a given seed.
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Simple string hash for personality tags.
 * Converts a string to a numeric hash value.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Derive a stable numeric seed from a dog's stats and personality.
 * Same dog always produces the same seed.
 */
export function hashDog(dog: Dog): number {
  // Combine stats: sum them together
  const statSum = dog.speed + dog.bark + dog.chomp;

  // Hash the personality string
  const personalityHash = hashString(dog.personality);

  // Combine both into a final seed
  // Use a large multiplier to spread out the values across the numeric range
  const seed = (statSum * 73856093) ^ (personalityHash * 19349663);

  return Math.abs(seed);
}

/**
 * Resolve a battle between a dog and the raccoon opponent.
 * Deterministic: same dog always produces the same result.
 *
 * Logic:
 * - Compute base differential: (dog stats) - (raccoon stats)
 * - Add a seeded "swing" roll (±15) based on the dog's hash
 * - Outcome: dog wins if total > 0, otherwise loses
 */
export function resolveBattle(
  dog: Dog,
  raccoon: RaccoonStats
): BattleResult {
  // Compute per-stat deltas
  const speedDelta = dog.speed - raccoon.speed;
  const barkDelta = dog.bark - raccoon.bark;
  const chompDelta = dog.chomp - raccoon.chomp;

  // Base differential (sum of all deltas)
  const baseDifferential = speedDelta + barkDelta + chompDelta;

  // Derive a stable seed from the dog
  const seed = hashDog(dog);

  // Use seeded PRNG to generate a swing value in range [-15, 15]
  const rng = mulberry32(seed);
  const randomFactor = rng(); // 0-1
  const swing = Math.floor(randomFactor * 31) - 15; // -15 to 15

  // Total: base differential + swing
  const total = baseDifferential + swing;

  // Outcome: dog wins if total > 0, otherwise (including ties) raccoon wins
  const outcome = total > 0 ? 'win' : 'lose';

  return {
    outcome,
    statDeltas: {
      speed: speedDelta,
      bark: barkDelta,
      chomp: chompDelta,
    },
    swing,
    total,
  };
}
