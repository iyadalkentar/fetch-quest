# Requirements — Phase 5: End-to-end polish pass

## Scope

Per [roadmap.md](../roadmap.md) Phase 5, this is a cross-cutting pass over the
already-complete generate → mint → fight → result flow. No new features, no
new API routes, no new third-party integrations. In scope:

1. **Step-to-step transitions** — the handoff between steps (`app/page.tsx`
   swaps components by `currentStep` with no exit/enter transition today)
   should read as one continuous flow rather than four hard cuts.
2. **Error/edge states** — every external call (Google AI generate, Google AI
   battle line, ElevenLabs TTS, Solana mint, devnet airdrop, wallet connect)
   should degrade gracefully and let the user retry without losing progress.
3. **Visual consistency** — shared theming (color roles, card styles,
   spacing, button variants) across all four step components, which today
   independently repeat the same Tailwind utility strings with minor drift.
4. **Loading/performance polish** — perceived-wait improvements for the
   slower calls (portrait generation, minting, TTS) beyond the spinners/
   skeletons that already exist in some steps.

Explicitly out of scope (per [mission.md](../mission.md) non-goals and
roadmap.md's "do not pull deferred items forward"): any new gameplay feature,
persistence, multiplayer, mainnet, or additional AI/Solana calls.

## Current state (as of this phase's start)

- `app/page.tsx` — single-page step switch, no transition wrapper between
  steps, no top-level error boundary.
- `GenerateStep`, `MintStep` — already have inline error banners + retry
  buttons (established pattern to extend, not invent).
- `FightStep` — no error UI; narration fetch failure already falls back
  client-side to a generic line with no audio (see `FightStep.tsx`), but the
  battle resolution itself has no failure mode to handle (deterministic,
  client-side).
- `ResultStep` — no error state; assumes `narration` arrives eventually.
- Theming: Tailwind utility classes duplicated per-component (e.g. card =
  `bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6/8 border ...`,
  primary button = `bg-blue-600 ... hover:bg-blue-700`), with small
  inconsistent variations (padding `p-6` vs `p-8`, shadow variants) already
  visible across steps.

## Decisions

- **Error fallback strategy: inline retry.** Every failure surfaces a
  friendly message in place with a "Try again" button that re-runs the same
  action, keeping the user on the current step (no forced restart of the
  whole flow). This matches the pattern already established in
  `GenerateStep` and `MintStep`; this phase extends it to `FightStep`'s
  narration fetch (already has a silent fallback — add a visible retry
  affordance) and any other ungated call.
- **No new global state/error-boundary library.** Continue the existing
  per-component local-state error pattern (`useState<string | null>`) rather
  than introducing React Error Boundaries or a state library — consistent
  with tech-stack.md's "no global state library" decision.
- **Shared visual primitives, not a design system.** Extract the repeated
  card/button/banner class strings into small shared constants or a couple
  of tiny presentational components (e.g. `Card`, `Button` variants) under
  `app/components/`, scoped to what these four steps already use — not a
  general component library.
- **Transitions via Framer Motion**, consistent with tech-stack.md's existing
  choice — wrap the step switch in `app/page.tsx` with
  `AnimatePresence`/exit-enter transitions rather than introducing routing
  or a separate animation library.
- **Validation is manual**, no automated test suite added (per
  tech-stack.md and this phase's `validation.md`).

## Non-goals for this phase

- Changing battle resolution logic, stat rolls, or minting logic.
- Adding tests/CI.
- Redesigning the visual language from scratch — this is a consistency and
  polish pass on the existing look, not a rebrand.
