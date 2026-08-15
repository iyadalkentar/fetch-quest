# Validation — Scaffold

This phase is done and mergeable when all of the following hold.

## Runs + renders

- [ ] `npm install` completes with no errors.
- [ ] `npm run dev` starts the dev server with no errors in the terminal.
- [ ] `http://localhost:3000` loads and displays the Generate step
      placeholder by default.
- [ ] Clicking through Generate → Mint → Fight → Result (via each
      placeholder's "Next" button) renders all four step placeholders
      correctly, in order, with no console errors.

## Typecheck / lint clean

- [ ] `npm run lint` exits 0 with no warnings or errors.
- [ ] `npm run typecheck` exits 0 with no type errors.
- [ ] `npm run build` completes successfully (production build).

## Structural checks

- [ ] `.env.local.example` exists and lists `GOOGLE_AI_API_KEY`,
      `ELEVENLABS_API_KEY`, `SOLANA_RPC_URL`.
- [ ] `.env.local` is listed in `.gitignore`.
- [ ] `framer-motion` is present in `package.json` dependencies.
- [ ] No Solana or Google AI / ElevenLabs SDK packages installed yet
      (confirms scope was held to skeleton + tooling, not pulled forward).

## Sign-off

Once every box above is checked, merge `feat/scaffold` into the base branch
and move to Phase 1 ([specs/roadmap.md](../roadmap.md)) — create its own
dated feature spec directory following this same requirements/plan/
validation pattern.
