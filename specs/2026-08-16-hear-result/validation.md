# Validation — Phase 4: Hear the result

This phase has no automated test suite (per tech-stack.md) — verify by
manual click-through. All checks below should be run against a real
`.env.local` with valid `GOOGLE_AI_API_KEY` and `ELEVENLABS_API_KEY`, plus at
least one deliberate failure run for the fallback checks.

## Happy path — win

1. Generate a dog with stats likely to beat the raccoon (Speed+Bark+Chomp
   comfortably above 220, the raccoon's total).
2. Mint (or skip if wallet unavailable — Result should still be reachable).
3. Fight. Confirm the existing Phase 3 animation sequence (charge → clash →
   stats → outcome) still plays unchanged and ends in a win banner.
4. Advance to Result. Confirm:
   - Win badge and dog portrait render immediately.
   - Outcome line appears within a few seconds (network-dependent) —
     skeleton/loading state shown until then, not a blank area.
   - Audio autoplays once available; a visible replay/mute control is
     present and functional (pause/replay works).
   - The line text is on-tone (references the dog's personality/stats, wins
     against the raccoon).

## Happy path — lose

1. Generate a dog with weak stats (or retry until a lose roll — resolution
   is deterministic per dog, so a given dog always produces the same
   outcome).
2. Repeat steps 2-4 above, confirming the lose badge, a lose-flavored line,
   and audio narration all work the same way.

## Timing / latency behavior

- Confirm the `/api/battle` request is observably fired during the fight
  animation (Network tab timestamp lines up with the `charging` phase
  start, not with navigation to Result) — the intent is to hide latency
  behind the ~2.3s animation, not add a new wait on the Result screen for a
  fast connection.
- Artificially throttle network (devtools) and confirm reaching Result
  before the fetch resolves shows the loading/skeleton state, not an error
  or blank line, and that it fills in correctly once the response lands.

## Failure fallback

1. Temporarily rename/unset `GOOGLE_AI_API_KEY` in `.env.local`, restart
   dev server, run the flow to Result. Confirm a local fallback line
   appears (not an error page, not a blank line) and — if
   `ELEVENLABS_API_KEY` is still valid — that fallback line is still
   narrated as audio.
2. Restore `GOOGLE_AI_API_KEY`, temporarily unset `ELEVENLABS_API_KEY`
   instead, restart, run the flow to Result. Confirm the (real) outcome
   line renders as text with no audio player shown, and no console error
   crashes the page.
3. Restore both keys afterward and confirm the happy path still works.

## Regression check

- Confirm Phase 1-3 flows (generate, mint, fight) are visually and
  functionally unchanged — this phase should only add behavior at the
  fight→result boundary and inside `ResultStep`.

## Merge bar

All of the above pass, `npm run build` succeeds with no new type errors, and
`.env.local.example` documents any new env var(s) introduced
(`ELEVENLABS_VOICE_ID` if added).
