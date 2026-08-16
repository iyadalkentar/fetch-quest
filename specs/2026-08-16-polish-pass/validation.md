# Validation — Phase 5: End-to-end polish pass

No automated test suite (per tech-stack.md). Validation is a manual
click-through checklist, run against devnet with a real wallet
(Phantom or Solflare), covering the happy path and every edge case this
phase addresses. All items must pass before merging.

## Happy path

- [ ] Generate → dog stats/personality/portrait/bio render with the new
      transition/reveal, no layout shift or flash of unstyled content.
- [ ] Step indicator (Task 2) accurately reflects the current step at each
      of the four stages.
- [ ] Mint → wallet connects, balance shows, mint succeeds, Explorer link
      opens the correct devnet mint address.
- [ ] Fight → battle animation plays through all phases (charging → clash
      → stats → outcome) without stalling, narration line + audio arrive
      and autoplay (or are playable) on the result screen.
- [ ] Result → audio play/pause/replay controls work; portrait, outcome
      badge, and line render correctly for both a win and a loss (force
      both at least once — stats are randomized, so regenerate until you
      hit each outcome, or note both were observed across the pass).
- [ ] Transitions between all four steps feel continuous — no jarring cut,
      no flash of the wrong step's content.
- [ ] Dark mode: repeat the full flow with OS dark mode on; every step,
      banner, and new shared primitive renders with correct contrast.

## Error / edge states

- [ ] Generate: simulate a Google AI failure (e.g. temporarily invalid
      `GOOGLE_AI_API_KEY`) — placeholder dog + visible warning banner +
      working "Retry" button.
- [ ] Mint: attempt mint with no wallet connected — "Connect Wallet" CTA
      shown, "Skip minting" still works and advances the flow.
- [ ] Mint: attempt mint with insufficient devnet SOL — low-balance banner
      shown, "Request Devnet SOL" airdrop button works and updates balance.
- [ ] Mint: simulate a mint failure (e.g. reject the wallet signature
      prompt) — error banner with working "Retry" button, does not lose the
      generated dog.
- [ ] Fight: simulate `/api/battle` failure (e.g. temporarily invalid
      `ELEVENLABS_API_KEY` or `GOOGLE_AI_API_KEY`) — visible retry
      affordance appears (Task 3), retry succeeds once the key is restored.
- [ ] Result: narration line present but audio missing (ElevenLabs failed
      server-side only) — "narration unavailable" note shown instead of a
      silently missing audio player.
- [ ] Refresh mid-flow at each step — app returns to a sane state (Generate
      step, per current no-persistence design); no crash or blank screen.

## Visual/regression check

- [ ] No step shows visibly mismatched card padding, shadow, or button
      styling relative to the others (shared primitives applied
      consistently — Task 1/5).
- [ ] `npm run build` completes with no new TypeScript or lint errors.
- [ ] `npm run lint` passes.

## Sign-off

Merge only once every box above is checked on a single continuous
walkthrough (or explicitly re-verified after a fix), per this phase's
"manual click-through checklist" validation decision in requirements.md.
