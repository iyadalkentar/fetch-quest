# Validation — Phase 1: Generate a dog

This slice is done and mergeable when all of the following hold.

## Functional

- [ ] Clicking "Generate" on the Generate step calls `/api/generate-dog` and
      shows a loading state while the request is in flight.
- [ ] On success, the revealed dog shows Speed, Bark, Chomp (integers),
      a personality tag from the 6-8 tag pool, a generated portrait image,
      and a generated bio/taunt line.
- [ ] Rolling several dogs in a row shows visibly different stat spreads per
      personality tag (e.g. Territorial dogs consistently skew Chomp/Bark
      higher than Nervous dogs) — confirms the bias table is wired up, not
      just flat random.
- [ ] `GOOGLE_AI_API_KEY` is never sent to or readable from the browser
      (check network tab / client bundle).

## Failure handling

- [ ] Temporarily breaking the Google AI call (bad key or forced error)
      still returns a 200 with placeholder portrait + bio and
      `generationFailed: true`, rather than a hard error screen.
- [ ] The UI shows the "AI generation unavailable" notice and a working
      Retry button when `generationFailed` is true.
- [ ] Retry re-calls the endpoint and clears the notice on a subsequent
      success.

## UI / polish

- [ ] The reveal (stats card + portrait + bio) animates in (Framer Motion),
      not an instant pop-in.
- [ ] "Generate another" re-rolls without navigating away from the step.
- [ ] The "Next" control to advance to Mint only appears once a dog
      (real or placeholder) is loaded, not before.
- [ ] Visual style matches the existing gradient theme in `page.tsx`.

## Code health

- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] No API keys or secrets committed (`.env.local` stays untracked).

## Explicitly not required for this slice

- Mint/Fight/Result functionality — those steps remain placeholders.
- Automated tests — manual click-through per tech-stack.md's testing note.
