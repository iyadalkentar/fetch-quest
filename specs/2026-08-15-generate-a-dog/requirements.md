# Requirements — Phase 1: Generate a dog

## Scope

Implement the first vertical slice from [roadmap.md](../roadmap.md): rolling a
dog's stats and personality, generating its portrait + bio/taunt via Google
AI, and revealing it in the UI with a polish pass. This slice ends at the
"generate" step — minting, fighting, and results stay out of scope (existing
`MintStep`/`FightStep`/`ResultStep` placeholders are untouched).

## Decisions

### Stat rolling — personality-weighted

- Roll the personality tag first, then roll Speed/Bark/Chomp with ranges
  biased by that tag (e.g. Territorial skews Chomp/Bark higher, Nervous skews
  Speed higher). Exact bias table is an implementation detail for
  `plan.md`/code, not fixed here, but every tag must bias at least one stat
  so the tag is legible in the numbers.
- Stats are integers. Base range and bias magnitude are implementation
  details, but the roll must stay deterministic-per-seed (no external
  randomness source) so later phases (battle resolution) can reason about it.

### Personality tags — small expanded set

Pool of ~6-8 tags: **Territorial, Nervous, Good Boy, Goofy, Grumpy, Sneaky,
Loyal**, plus one more if needed to round out the set. One tag is chosen per
generated dog.

### Google AI integration

- `POST /api/generate-dog`: rolls stats + personality server-side, calls
  Google AI (Gemini) for a portrait image and a short bio/taunt line, returns
  the combined dog data + image to the client.
- Called server-side only via `GOOGLE_AI_API_KEY` (already in
  `.env.local.example`). No key or direct Gemini SDK call from the browser.
- Portrait: single static image per dog (no animation/video). Image returned
  as a data URI or accessible URL — final storage approach matches
  tech-stack.md's "start simple" guidance (data URI unless minting later
  requires otherwise).
- Bio/taunt: short text (1-2 sentences), generated from the dog's stats and
  personality tag so it's flavor-consistent with the roll.

### Failure handling — fallback placeholder

- If the Google AI call for portrait or bio/taunt fails or times out, the
  route does not hard-fail the whole request: it returns the rolled stats +
  personality with a generic placeholder portrait and a generic placeholder
  bio/taunt line.
- The API response includes a flag indicating generation failed for
  portrait/bio (e.g. `generationFailed: true`) so the UI can show a subtle
  "AI generation unavailable, showing placeholder" indicator and a manual
  retry action.
- Retry: client-triggered only (user clicks retry), no automatic background
  retry loop.

### UI

- `GenerateStep` gets a "Generate" button (replacing today's static
  "Next" placeholder) that calls `/api/generate-dog`, shows a loading state
  while waiting, then reveals the stats card + portrait + bio/taunt with an
  animation (Framer Motion, per tech-stack.md).
- Only after a successful (or placeholder-fallback) generation does the
  "Next" control to advance to the Mint step appear.
- Re-rolling before advancing (generate a different dog) is in scope if
  cheap — a "Generate another" affordance — since mission.md's non-goal is
  only "editing or re-rolling a **minted** dog," not a pre-mint reroll.

## Out of scope for this slice

- Minting, wallet connect, fight resolution, result narration — later phases.
- Any persistence beyond in-memory client state for the current playthrough.
- Multiple simultaneous dogs / roster.
