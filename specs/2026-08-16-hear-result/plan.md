# Plan — Phase 4: Hear the result

## 1. ElevenLabs client module

- Add `lib/elevenLabs.ts`: server-only client wrapping the ElevenLabs
  text-to-speech REST API.
  - `getClient()`/config guard reading `ELEVENLABS_API_KEY` from env,
    throwing if unset (mirror `lib/googleAi.ts`'s `getClient()` pattern).
  - `narrate(text: string): Promise<Buffer>` — calls ElevenLabs TTS with a
    fixed voice ID (`ELEVENLABS_VOICE_ID` env var, fallback to a hardcoded
    default constant), returns raw MP3 bytes.
- Add `ELEVENLABS_VOICE_ID=` to `.env.local.example` with a comment.

## 2. Google AI outcome line

- Add `generateOutcomeLine(dog: DogInput, raccoon: RaccoonStats, outcome:
  'win' | 'lose'): Promise<string>` to `lib/googleAi.ts`, following
  `generateBioTaunt`'s shape (same text model, similar prompt structure, trim
  + validate non-empty response).
- Add a local fallback line generator (e.g. `lib/fallbackLines.ts` or inline
  in the API route) — a small array of win lines and lose lines, pick
  deterministically or randomly, no network call.

## 3. `/api/battle` route

- Add `app/api/battle/route.ts`, `POST` handler:
  1. Parse/validate request body: `dog` (stats + personality), `raccoon`
     (label + stats), `outcome`.
  2. Try `generateOutcomeLine(...)`; on failure, use the local fallback line
     for the given outcome.
  3. Try `narrate(line)` via `lib/elevenLabs.ts`; on failure, leave audio out.
  4. Respond `200` with `{ line, audioDataUri }` (`audioDataUri` is `null` on
     narration failure). Never respond with a 5xx for AI/TTS failures — only
     for malformed input.

## 4. Wire up `FightStep` → `page.tsx`

- In `FightStep.tsx`, in `handleFightClick` (or the effect that enters
  `charging`), after computing `battleResult`, fire
  `fetch('/api/battle', { method: 'POST', body: JSON.stringify({ dog,
  raccoon, outcome: battleResult.outcome }) })` without awaiting the
  animation — store the promise/result in local state and call a new
  `onNarrationReady({ line, audioDataUri } | { error: true })` prop once it
  settles (also handle fetch-level failure with the same local fallback line
  used server-side, or a generic client-side fallback string, so the UI
  never has nothing to show).
- Add `onNarrationReady` prop to `FightStepProps`.
- In `page.tsx`, replace/extend `battleOutcome` state with a small shape
  carrying `outcome`, `line`, and `audioDataUri` (e.g. `BattleNarration |
  null`), updated first by `onBattleResolved` (outcome only, immediately)
  then patched by `onNarrationReady` (line/audio, once ready). Pass the
  combined state to `ResultStep`.

## 5. `ResultStep` implementation

- Replace the placeholder with:
  - Dog portrait + personality (reuse layout patterns from `FightStep`'s
    idle-state portrait block).
  - Win/lose badge, same visual language as `FightStep`'s outcome banner
    (green/red themed card).
  - Line text area: skeleton/"writing the story..." state while
    `line` is not yet available, then fade in the text once set.
  - `<audio>` element (native, styled minimally) when `audioDataUri` is
    present: autoplay on mount/when the src becomes available, with a
    replay/mute button overlay. No player UI at all if `audioDataUri` stays
    `null` after narration settles — line text still shows.
  - Keep existing "refresh to start again" copy.

## 6. Manual verification pass

- Run through the full flow (see [validation.md](validation.md)) for both a
  favorable-stat dog (win) and an unfavorable one (lose), confirming line +
  audio in both branches, and confirming the API-failure fallback path (e.g.
  temporarily unset `ELEVENLABS_API_KEY` or `GOOGLE_AI_API_KEY` locally) still
  renders a usable Result screen.
