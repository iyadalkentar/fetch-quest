# Requirements — Phase 4: Hear the result

## Scope

Implement the fourth vertical slice from [roadmap.md](../roadmap.md): once a
battle is resolved (Phase 3's `resolveBattle` in `lib/battle.ts`, driven from
`FightStep`), call a new `/api/battle` route that generates a short AI outcome
line (Google AI) and narrates it (ElevenLabs), and surface both the line and
playable audio on `ResultStep`. This phase starts once `BattleResult` exists
in `FightStep` state and ends with `ResultStep` showing the outcome, the
generated line, and working audio playback.

## Decisions

### API shape — extend, don't replace, the client-side resolution

- `POST /api/battle` request body: the already-resolved `BattleResult` outcome
  plus enough dog/raccoon context for the prompt — `dog` (stats +
  personality), `raccoon` label/stats, and `outcome: 'win' | 'lose'`. The
  route does **not** re-resolve the fight; Phase 3's deterministic
  `resolveBattle` stays the single source of truth for win/lose.
- Response JSON: `{ line: string, audioDataUri: string | null }`.
  - `line` — the Google AI-generated outcome sentence.
  - `audioDataUri` — `data:audio/mpeg;base64,...` from ElevenLabs, or `null`
    if narration failed/was skipped (see fallback behavior below). Same data
    URI pattern already used for the portrait in `lib/googleAi.ts`.
- Keys (`GOOGLE_AI_API_KEY`, `ELEVENLABS_API_KEY`) stay server-only, called
  only from this route, consistent with tech-stack.md.

### Call timing — fire from FightStep, consume on ResultStep

- `FightStep` fires the `/api/battle` request as soon as `resolveBattle()`
  produces a result (start of the `charging` phase, alongside setting
  `result` state) — not gated behind the animation finishing. This hides
  Google AI + ElevenLabs latency behind the ~2.3s charge/clash/stats
  animation sequence that already plays.
- The in-flight promise's resolution (line + audio) is lifted to `page.tsx`
  state via a new callback, e.g. `onNarrationReady`, mirroring the existing
  `onBattleResolved` / `onDogGenerated` pattern. `battleOutcome` in
  `page.tsx` becomes a richer shape (or a sibling piece of state) that also
  carries `line` and `audioDataUri` once the fetch resolves.
- If the user reaches `ResultStep` before the fetch resolves, `ResultStep`
  shows a lightweight loading state (outcome banner can still render
  immediately since that's already known synchronously; only the line/audio
  area waits).

### Google AI prompt — outcome line

- New function in `lib/googleAi.ts`, e.g. `generateOutcomeLine(dog, raccoon,
  outcome)`, using the same `gemini-flash-latest` text model as
  `generateBioTaunt`. Prompt: short, punchy 1-2 sentence line describing the
  dog's win or loss against the raccoon, reflecting personality and stats,
  in-character with the existing bio/taunt tone.

### ElevenLabs narration

- New `lib/elevenLabs.ts` module, server-only, called only from
  `/api/battle`. Single fixed voice ID (env var `ELEVENLABS_VOICE_ID` with a
  documented default, or hardcoded constant) used for every narration
  regardless of outcome/personality — no per-outcome voice switching in this
  phase.
- Add `ELEVENLABS_VOICE_ID` to `.env.local.example` if made configurable.
- Converts the Google AI line to speech, returns raw audio bytes, converted
  to a base64 data URI in the API route response.

### Failure handling — text survives, audio is optional

- If Google AI's outcome-line call fails, fall back to a small set of
  locally-templated win/lose lines (no network call) so the result screen
  never shows nothing — matches Phase 5's later "API failures" scope, but a
  minimal fallback belongs here since audio depends on having *some* line.
- If ElevenLabs fails (or is skipped because the line came from the local
  fallback — still attempt narration of the fallback line, only skip if the
  ElevenLabs call itself errors), `audioDataUri` is `null` and `ResultStep`
  renders the line as text only, no player/replay controls shown.
- The route itself should not throw on partial failure — always return a
  `line` (real or fallback) with best-effort `audioDataUri`.

### UI — ResultStep

- Show: portrait of the dog, win/lose badge (same visual language as
  `FightStep`'s outcome banner), the generated `line` as flavor text, and an
  audio player when `audioDataUri` is present.
- Audio autoplays once available with a visible mute/replay control (a play
  icon that toggles/replays), per roadmap's "audio sync with reveal, replay
  control" polish note. Browsers generally allow this since it follows the
  Fight button click (a prior user gesture) earlier in the same session.
- Loading state (before narration resolves): outcome badge + portrait shown
  immediately (already known), with a subtle "writing the story..." /
  skeleton state for the line+audio area.
- No "Next" control needed — Result is the last step (existing behavior:
  "refresh to start again" copy stays).

## Out of scope for this slice

- Any change to `resolveBattle` / battle math — Phase 3's function is
  untouched.
- Per-outcome or per-personality voice variation.
- Persisting results beyond the current playthrough.
- Full error-state polish across all four steps (wallet/devnet-balance
  errors etc.) — that's Phase 5. Only `/api/battle`'s own failure fallback
  is in scope here.
- Automated tests — manual click-through per tech-stack.md; verify both win
  and lose paths produce a line and (when ElevenLabs succeeds) audio.
