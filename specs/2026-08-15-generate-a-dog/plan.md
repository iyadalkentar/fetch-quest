# Plan — Phase 1: Generate a dog

## 1. Stat + personality roll logic

1. Add a `lib/dog.ts` (or similar) module with:
   - `PERSONALITY_TAGS` list: Territorial, Nervous, Good Boy, Goofy, Grumpy,
     Sneaky, Loyal (+1 to round to 8 if needed).
   - A per-tag bias table mapping each tag to which stat(s) skew up/down.
   - `rollDog()` → picks a random personality tag, then rolls
     Speed/Bark/Chomp as integers within a base range, applying that tag's
     bias.
2. Define the `Dog` TypeScript type: `{ speed, bark, chomp, personality,
   portraitUrl, bio, generationFailed }`.
3. Sanity-check the roll distribution manually (log a handful of rolls per
   tag) to confirm the bias is visible in the numbers.

## 2. `/api/generate-dog` route

1. Scaffold `app/api/generate-dog/route.ts` (POST handler).
2. Call `rollDog()` for stats + personality.
3. Add a Google AI client helper (`lib/googleAi.ts`) wrapping the Gemini API
   using `GOOGLE_AI_API_KEY`:
   - `generatePortrait(dog)` → image (data URI).
   - `generateBioTaunt(dog)` → short text.
4. Call both; on failure/timeout of either, catch and fall back to a static
   placeholder image + placeholder bio string, and set
   `generationFailed: true` on the response.
5. Return the combined `Dog` JSON to the client.
6. Manual test: hit the route directly (e.g. via curl/Thunder Client) with a
   valid key, and again with a bad key to confirm the fallback path works.

## 3. UI: Generate button + reveal

1. Update `GenerateStep`:
   - Replace the static button with a "Generate" button that POSTs to
     `/api/generate-dog`.
   - Add loading state (spinner/skeleton) while awaiting the response.
   - On success, render the stats card (Speed/Bark/Chomp), personality tag,
     portrait, and bio/taunt.
   - If `generationFailed` is true, show a subtle inline notice ("AI
     generation unavailable — showing a placeholder") with a "Retry" button
     that re-calls the endpoint.
   - Add a "Generate another" affordance to re-roll before advancing.
   - Show the "Next" control (to `onNext`/Mint step) only once a dog is
     loaded (real or placeholder).
2. Lift the generated `Dog` into `page.tsx` state (or a small context) so
   later phases (Mint) can read it.

## 4. Polish pass

1. Framer Motion: animate the reveal (stats card + portrait + bio) with a
   staggered entrance once generation completes.
2. Loading state polish: an on-brand loading animation, not just a bare
   spinner, consistent with the gradient theme already in `page.tsx`.
3. Click-through the full slice manually: generate → loading → reveal →
   retry-on-failure (simulate by temporarily breaking the API key) →
   generate another → advance to Mint step placeholder.

## 5. Wrap-up

1. Update `.env.local` (local, untracked) with a real `GOOGLE_AI_API_KEY` for
   manual testing.
2. Confirm `npm run lint` / `npm run typecheck` pass.
3. Mark Phase 1 complete in [roadmap.md](../roadmap.md) once validation.md's
   checklist passes.
