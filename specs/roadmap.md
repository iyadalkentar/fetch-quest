# Roadmap

Sequenced as **vertical slices**: each phase takes one step of the core loop
fully end-to-end (UI + API route + polish) before moving to the next. This
keeps something demoable at every checkpoint instead of a big-bang integration
at the end, and matches the "polish over breadth" mission — each slice gets
its animation/transition pass before we move on, not as a final catch-up step.

## Phase 0 — Scaffold ✅ Complete

- Next.js + TypeScript + Tailwind project init.
- `.env.local.example` with the three key placeholders from the README.
- Base layout, routing shell for the single-page flow (generate → mint →
  fight → result as views/steps within one page, not separate routes).

## Phase 1 — Slice: Generate a dog ✅ Complete

- Stat/personality roll logic (Speed, Bark, Chomp, personality tag).
- `/api/generate-dog` calling Google AI for portrait + bio/taunt.
- UI: "Generate" button → animated reveal of stats card + portrait + taunt.
- Polish pass: loading state while Google AI responds, reveal animation.

## Phase 2 — Slice: Mint it ✅ Complete

- Wallet connect (Phantom/Solflare via wallet-adapter), devnet.
- `/api/mint` — Metaplex mint with the dog's image + stats/personality as
  metadata attributes.
- UI: "Mint" button → pending/confirming/minted states, link to view on
  Solana Explorer (devnet).
- Polish pass: minting animation/feedback, error state if airdrop/balance
  insufficient.

## Phase 3 — Slice: Fight ✅ Complete

- Fixed raccoon opponent stats.
- Battle resolution logic (deterministic function of dog stats vs raccoon
  stats).
- UI: "Fight" button → battle animation sequence.
- Polish pass: make the resolution feel like an actual fight beat (not just
  an instant win/lose flash).

## Phase 4 — Slice: Hear the result

- `/api/battle` (or extend Phase 3's endpoint) — Google AI generates the
  outcome line, ElevenLabs narrates it.
- UI: result screen with generated line, audio playback (autoplay or
  play button), portrait + outcome badge.
- Polish pass: audio sync with reveal, replay control.

## Phase 5 — End-to-end polish pass

- Walk the full flow start to finish, tighten transitions between phases.
- Error/edge states: no wallet, insufficient devnet SOL, API failures.
- Visual pass: consistent theming across all four steps.

## Explicitly deferred

Anything not needed for the single dog/single fight loop — see
[mission.md](mission.md) non-goals. Do not pull these forward even if there's
spare time; spend spare time on Phase 5 polish instead.
