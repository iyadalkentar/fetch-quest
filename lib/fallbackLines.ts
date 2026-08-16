/**
 * Local fallback outcome lines for when Google AI is unavailable.
 * Used as a last resort if generateOutcomeLine fails.
 */

const WIN_LINES = [
  "Your dog outsmarted and overpowered the raccoon!",
  "Against all odds, your pup emerged victorious!",
  "The raccoon didn't stand a chance against your battle-ready dog!",
  "Your dog's courage and strength carried the day!",
  "An impressive performance by your canine warrior!",
  "The raccoon retreats in defeat—your dog reigns supreme!",
];

const LOSE_LINES = [
  "The raccoon's cunning and ferocity proved too much.",
  "Your dog fought bravely, but the raccoon was stronger.",
  "The raccoon's speed and strategy won the day.",
  "Tough loss, but your pup will train and return stronger!",
  "The raccoon's raw power overwhelmed your dog.",
  "A valiant effort, but the raccoon emerged victorious.",
];

export function getFallbackLine(outcome: 'win' | 'lose'): string {
  const lines = outcome === 'win' ? WIN_LINES : LOSE_LINES;
  return lines[Math.floor(Math.random() * lines.length)];
}
