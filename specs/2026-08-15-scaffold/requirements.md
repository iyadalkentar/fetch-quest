# Requirements — Scaffold

## Context

This is Phase 0 of [roadmap.md](../roadmap.md). Nothing has been built yet —
the repo currently contains only `README.md` and `specs/`. This phase lays
the foundation that Phases 1-4 (the vertical slices for generate/mint/fight/
narrate) will build on.

Per [mission.md](../mission.md), the priority is polish over breadth, so this
phase should leave the project in a state where later phases can focus on
their slice's UX rather than fighting missing tooling or structure.

## Scope: Skeleton + tooling

In scope:

- `create-next-app` project with TypeScript + Tailwind CSS, App Router.
- Base layout (`app/layout.tsx`) and a single-page shell (`app/page.tsx`)
  with four step placeholders: Generate, Mint, Fight, Result — no logic,
  just structural components that later phases fill in.
- `.env.local.example` documenting the three keys from the top-level
  [README.md](../../README.md): `GOOGLE_AI_API_KEY`, `ELEVENLABS_API_KEY`,
  `SOLANA_RPC_URL`.
- ESLint + Prettier configured and passing on the scaffold.
- Framer Motion installed (per [tech-stack.md](../tech-stack.md)) but not
  necessarily used yet — later phases add the actual animations.
- `package.json` scripts: `dev`, `build`, `lint`, `typecheck`.

Out of scope (explicitly deferred to later phases):

- API routes (`/api/generate-dog`, `/api/mint`, `/api/battle`) — Phase 1-4
  each wire their own route as part of their vertical slice.
- Wallet adapter / Solana packages — Phase 2.
- Any actual Google AI / ElevenLabs calls — Phases 1 and 4.
- Global state/context beyond what's needed to switch between the four
  step placeholders.

## Decisions

- **Package manager:** npm, matching the existing README instructions
  (`npm install`, `npm run dev`).
- **Routing:** single page with in-page step state (not four separate
  Next.js routes) — matches the "one dog, one fight, one result" linear
  flow described in mission.md.
- **Styling baseline:** Tailwind defaults, no custom design tokens yet —
  visual identity is a Phase 5 polish concern, not a scaffold concern.
- **No tests added in this phase** — per tech-stack.md, this is a weekend
  build with manual click-through verification per slice.

## Open questions

None currently — flag here if one comes up during implementation.
