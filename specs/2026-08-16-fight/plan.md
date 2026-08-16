# Plan — Phase 3: Fight

## 1. Raccoon opponent constant

1. Add the fixed raccoon opponent — either as a new `lib/raccoon.ts` or a
   constant in `lib/dog.ts` — with `speed: 55`, `bark: 85`, `chomp: 80`, a
   display label (e.g. `"Feral"`), and a static portrait (reuse/extend
   `lib/placeholderPortrait.ts`'s procedural SVG generator with the raccoon's
   fixed stats, or hand-author a static SVG/asset — no AI generation call).
2. Shape it close enough to `Dog` (`speed`/`bark`/`chomp` at minimum) that
   the resolution function and stat-comparison UI can treat dog and raccoon
   uniformly.
3. Manual test: import the constant somewhere temporary (or a quick console
   check) to confirm the portrait renders as a valid image/SVG.

## 2. `lib/battle.ts` — deterministic resolution function

1. Add a small seeded PRNG helper (e.g. mulberry32) taking a numeric seed and
   returning a 0–1 float generator.
2. Add a `hashDog(dog: Dog): number` (or similar) that derives a stable
   numeric seed from `speed`, `bark`, `chomp`, `personality` (e.g. sum stats
   + a string hash of personality) — deterministic per dog, no
   `Math.random()`/`Date.now()`.
3. Add `resolveBattle(dog: Dog, raccoon: RaccoonStats): BattleResult` where
   `BattleResult` includes at least:
   - `outcome: 'win' | 'lose'`
   - `statDeltas: { speed: number; bark: number; chomp: number }` (dog minus
     raccoon, per stat, for the beat-by-beat reveal)
   - `swing: number` (the seeded roll applied)
   - `total: number` (final signed differential used for the outcome)
4. Logic: `total = (dog.speed+dog.bark+dog.chomp) -
   (raccoon.speed+raccoon.bark+raccoon.chomp) + swing`; `swing` bounded to
   e.g. `[-15, 15]` via the seeded PRNG; `outcome = total > 0 ? 'win' :
   'lose'`.
5. Manual test: call `resolveBattle` with a handful of hand-constructed `Dog`
   objects (strong roll, weak roll, borderline roll) from a scratch script or
   temporary log in `FightStep`, confirm outcomes match expectations and stay
   stable across repeated calls with the same dog.

## 3. `FightStep` — props + trigger

1. Update `FightStepProps` to accept `dog: Dog` and `onBattleResolved:
   (outcome: 'win' | 'lose') => void` (mirroring `MintStep`'s `dog` prop and
   `GenerateStep`'s `onDogGenerated` pattern).
2. Update `app/page.tsx`: add `battleOutcome` state, pass `generatedDog` and
   a `setBattleOutcome` callback into `FightStep`.
3. Replace the placeholder body: show dog vs. raccoon portraits + a "Fight!"
   button (matching the Generate/Mint click-to-advance pattern) instead of
   auto-resolving on mount.
4. On click, call `resolveBattle` synchronously (it's pure/instant) but hold
   the result in local state without displaying it yet — the animation
   sequence (step 4) is what reveals it.
5. Manual test: click through and confirm the button disables/hides once the
   sequence starts (no double-trigger).

## 4. Battle animation sequence

1. Framer Motion sequence, staged via `AnimationControls`/`useAnimate` or
   chained `variants` with `delayChildren`/`when`, matching `GenerateStep`'s
   existing variant patterns:
   1. Charge-in: dog portrait slides in from left, raccoon portrait from
      right, meeting at center.
   2. Clash: a brief impact effect (scale pulse / flash overlay / shake) at
      the point they meet.
   3. Stat comparison rows revealed in sequence (Speed → Bark → Chomp),
      each row showing dog value vs. raccoon value, consistent styling with
      `GenerateStep`'s Stats Card (blue/orange/red per-stat coloring).
   4. Outcome banner: distinct win/lose styling (not a bare flash) — e.g.
      color-coded card with a headline ("Victory!" / "Defeated...").
2. Wire sequence completion to call `onBattleResolved(result.outcome)` and
   reveal the "Next" button only at that point.
3. Manual test: run the full sequence a few times with different dogs,
   confirm timing feels like a beat-by-beat fight (not instant), both
   win and lose paths render distinctly, and "Next" doesn't appear early.

## 5. Polish pass

1. Tune animation timings/easing so the sequence reads well at a glance
   (roadmap's "not just an instant win/lose flash" bar).
2. Dark mode check: verify raccoon portrait, stat rows, and outcome banner
   all have dark-mode-appropriate styling (matching existing
   `dark:` classes elsewhere in the codebase).
3. Click through the full slice end-to-end: generate → mint → fight (both a
   winning and a losing dog, by testing with a couple of different generated
   dogs since the raccoon is fixed) → outcome banner → Next → Result
   placeholder.

## 6. Wrap-up

1. Confirm `npm run lint` / `npm run typecheck` pass.
2. Mark Phase 3 complete in [roadmap.md](../roadmap.md) once
   validation.md's checklist passes.
