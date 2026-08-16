# Plan — Phase 5: End-to-end polish pass

## 1. Shared visual primitives

- Add small presentational building blocks under `app/components/ui/`
  (e.g. `Card.tsx`, `Button.tsx`, `Banner.tsx` for error/warning/success
  variants) that wrap the class strings already repeated across
  `GenerateStep`, `MintStep`, `FightStep`, `ResultStep`.
- Replace the duplicated inline class strings in all four step components
  with these primitives. No visual change intended in this task — it's a
  consistency pass to normalize the drift already present (padding, shadow,
  border variants) before other tasks build on top of it.

## 2. Step-to-step transitions

- Wrap the `currentStep` switch in `app/page.tsx` with Framer Motion
  `AnimatePresence` so leaving/entering steps animate (fade + slight
  slide) instead of hard-cutting.
- Add a lightweight step indicator/progress marker (e.g. 4 dots or a
  labeled breadcrumb) near the top of `main` so the user always knows
  where they are in generate → mint → fight → result — this also softens
  the transition since the indicator itself animates step-to-step.
- Keep each step component's own internal phase animations (already
  present in `FightStep`, `GenerateStep`, `MintStep`) as-is; this task is
  only about the outer step-switch boundary.

## 3. Error/edge states — fill the gaps

- `FightStep`: add a visible inline error banner + "Retry narration"
  button for when the `/api/battle` fetch fails, using the shared
  `Banner`/`Button` primitives from Task 1. Currently this failure is
  silently swallowed into a generic fallback line with no way to retry for
  real audio.
- `ResultStep`: handle the case where `narration` is present but
  `audioDataUri` is null (ElevenLabs failed server-side) — show a small
  "narration unavailable" note instead of just omitting the audio player
  silently.
- `MintStep`: verify existing error states (wallet not connected, low
  balance, airdrop timeout/failure, mint failure) render correctly through
  the new shared primitives; no new logic expected here, just wiring.
- `GenerateStep`: same verification pass — wire existing error/retry logic
  through shared primitives.
- Audit `app/page.tsx` for the one un-gated failure mode: if
  `generatedDog` is somehow null when `MintStep`/`FightStep` render (e.g.
  user manually navigates state some way) — confirm existing null-guards
  in those components are sufficient; add a guard only if a gap is found.

## 4. Loading/performance polish

- `GenerateStep`: while `loading`, show a skeleton of the stats
  card/portrait/bio layout (matching `ResultStep`'s existing skeleton
  pattern) instead of just a spinner-in-button, so the wait feels shorter.
- `MintStep`: add a subtle progress affordance for the `pending` →
  `confirming` states (e.g. a 2-step progress bar/label) instead of only
  swapping button text.
- `FightStep`: confirm the narration fetch (which runs in parallel with
  the ~2.3s animation sequence) doesn't cause a visible pop when it
  resolves early or late — add a brief crossfade if needed.
- Spot-check bundle impact: confirm the `WalletContextProvider` dynamic
  import (already lazy) is still the only heavy deferred chunk; no other
  changes in this phase should add first-paint weight.

## 5. Visual consistency pass

- Walk all four steps side by side and align: heading sizes/weights,
  button color roles (primary/secondary/danger/warning consistently
  mapped), card padding/shadow, spacing rhythm between sections.
- Confirm dark mode parity for every new/changed element introduced in
  Tasks 1-4.

## 6. Manual validation

- Run the full checklist in [validation.md](validation.md) end to end on
  devnet with a real wallet before merging.
