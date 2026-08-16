# Requirements — Phase 3: Fight

## Scope

Implement the third vertical slice from [roadmap.md](../roadmap.md): resolve a
single battle between the currently-generated (and minted) dog and a fixed
raccoon opponent, using a deterministic function of stats, and play it back as
a multi-beat fight animation. This slice starts once a dog exists in
`page.tsx` state (`Dog` from `lib/dog.ts`, already carried through Phase 1/2)
and ends with a battle outcome (win/lose) held in state and passed forward —
the result narration screen (`ResultStep`) stays a placeholder, this phase
only needs to display the outcome inline at the end of the fight sequence.

## Decisions

### Raccoon opponent — fixed "scrappy" archetype

- A single hardcoded `Dog`-shaped opponent (no roll, no randomness), defined
  as a constant, e.g. in `lib/dog.ts` or a new `lib/raccoon.ts`:
  - `speed: 55` (raccoons are cornered, not fast in a straight fight)
  - `bark: 85` (loud hissing/screeching)
  - `chomp: 80` (sharp claws/teeth, scrappy fighter)
  - No `personality` tag needed (or a fixed flavor label like "Feral" used
    only for display, not battle math).
  - Static portrait: a simple placeholder image/SVG (reuse the
    procedural-SVG approach from `lib/placeholderPortrait.ts` if it can take
    fixed stats, or a hand-authored static raccoon SVG/asset) — no AI
    generation for the raccoon, this is out of scope for Google AI usage.
- These exact numbers may be tuned once a few dogs are tested through the
  formula below, but must stay fixed (not re-rolled) once chosen.

### Battle resolution — deterministic seeded roll

- Compute a base differential: `(dog.speed + dog.bark + dog.chomp) -
  (raccoon.speed + raccoon.bark + raccoon.chomp)`.
- Derive a deterministic seed from the dog's own stats + personality (e.g. a
  small string/number hash of `speed`, `bark`, `chomp`, `personality` — not
  `Math.random()` and not wall-clock time), so the same generated dog always
  produces the same fight outcome against the fixed raccoon.
- Feed that seed into a simple deterministic PRNG (e.g. a small mulberry32-
  style function) to produce one bounded "swing" value (e.g. ±15), added to
  the base differential.
- Outcome: dog wins if the final signed total is `> 0`, raccoon wins
  otherwise (define and document the tie-breaking direction explicitly — no
  literal ties given the swing range chosen).
- The whole computation is a pure function of `(dog, raccoon)` — no
  server round-trip needed for this phase; it can run client-side, since
  Phase 4 is what adds the `/api/battle` call for the AI-generated outcome
  line. Implement it as a pure, unit-testable-shaped function even though no
  test suite exists yet (tech-stack.md's manual-verification note still
  applies).
- Expose enough of the intermediate result (per-stat deltas or similar) for
  the animation to have something to reveal beat-by-beat, per the animation
  decision below.

### UI flow — auto-resolve behind a multi-beat animation

- `FightStep` receives the `Dog` (and raccoon constant) as props, same
  pattern as `MintStep` receiving `dog`.
- On entering the step (or on a "Fight!" button press — pick whichever reads
  better paced; a button press matches the existing Generate/Mint
  click-to-advance pattern, so prefer a button over auto-triggering on
  mount), run the resolution function immediately (it's synchronous/pure),
  but don't reveal the outcome instantly — play a Framer Motion sequence with
  distinct beats before showing the result:
  1. Charge-in: dog and raccoon portraits animate toward each other from
     opposite sides.
  2. Clash: an impact beat (screen shake / flash / icon burst) at the
     midpoint.
  3. Stat comparisons revealed one at a time (Speed, then Bark, then Chomp —
     matching the Stats Card order from `GenerateStep`), each showing
     dog-vs-raccoon side by side.
  4. Outcome reveal: win/lose banner, styled distinctly from a plain flash
     (matches roadmap's "not just an instant win/lose flash" polish note).
- Battle outcome (`'win' | 'lose'`) is lifted to `page.tsx` state via a
  callback (mirrors `onDogGenerated`), so it's available for `ResultStep` in
  a later phase.
- "Next" control to advance to Result only appears once the full sequence
  has played out (no skipping ahead of the animation).
- No replay/rematch control in this phase — mission.md's "no multi-round
  battles" non-goal applies; a single resolved fight per playthrough.

## Out of scope for this slice

- `/api/battle` route, AI-generated outcome line, ElevenLabs narration —
  Phase 4.
- `ResultStep` implementation beyond what already exists (placeholder stays).
- Any outcome persistence beyond current playthrough React state.
- Automated tests — manual click-through per tech-stack.md's testing note;
  verify the fight with a few different generated dogs (favorable and
  unfavorable stat rolls) to confirm both win and lose paths render
  correctly.
