# Validation — Phase 3: Fight

This slice is done and mergeable when all of the following hold.

## Functional — raccoon opponent

- [ ] A fixed raccoon opponent constant exists with `speed: 55`, `bark: 85`,
      `chomp: 80` (or the final tuned values, if adjusted during
      implementation) and is never re-rolled or randomized between fights.
- [ ] The raccoon has a static portrait rendered in `FightStep` (no AI call
      made for it).

## Functional — battle resolution

- [ ] `resolveBattle(dog, raccoon)` is a pure function: calling it twice with
      the same dog produces the same outcome, `statDeltas`, `swing`, and
      `total` every time (no `Math.random()`/`Date.now()` involved).
- [ ] Resolving with a handful of different generated dogs (e.g. a
      strong-stat roll and a weak-stat roll) produces both `'win'` and
      `'lose'` outcomes at least once each — confirms the swing isn't
      swamping the base stat comparison or vice versa.
- [ ] `outcome` is derived consistently from `total` (`> 0` → win, otherwise
      lose) with no unhandled tie case.

## Functional — UI flow

- [ ] `FightStep` receives the current `Dog` via props (same pattern as
      `MintStep`) and shows both dog and raccoon before the fight starts.
- [ ] Clicking "Fight!" (or equivalent trigger) starts the animation
      sequence; the trigger is disabled/hidden once started so it can't be
      double-fired.
- [ ] The outcome is not visible until the animation sequence completes — no
      instant win/lose flash on click.
- [ ] Battle outcome (`'win' | 'lose'`) is lifted to `page.tsx` state via a
      callback and available for later use by `ResultStep`.
- [ ] The "Next" control to advance to Result only appears once the sequence
      has finished playing, not before.

## UI / polish

- [ ] The animation plays multiple distinct beats: charge-in, clash, stat
      comparisons revealed one at a time (Speed, Bark, Chomp), then an
      outcome banner — not a single instant transition.
- [ ] Win and lose outcomes are styled distinctly from each other (not just
      differing text on the same banner).
- [ ] Visual style (colors, spacing, typography) matches the established
      look from `GenerateStep`'s Stats Card and existing buttons.
- [ ] Dark mode: raccoon portrait, stat comparison rows, and outcome banner
      all render correctly with `dark:` classes, no unstyled/invisible
      elements.

## Code health

- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.

## Explicitly not required for this slice

- `/api/battle`, AI-generated outcome line, ElevenLabs narration — Phase 4.
- `ResultStep` implementation beyond its current placeholder.
- Automated tests — manual click-through per tech-stack.md's testing note.
- Replay/rematch controls — one resolved fight per playthrough only.
