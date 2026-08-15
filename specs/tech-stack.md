# Tech Stack

## Framework

- **Next.js (App Router) + TypeScript** — single deployable app, UI and API
  routes together.
- **Tailwind CSS** — utility styling, fast to iterate on polish (animations,
  transitions) without hand-rolling CSS files.
- **Framer Motion** — for the reveal/mint/fight/result transitions that the
  "polish over breadth" mission depends on.

## Backend

Thin backend via **Next.js API routes** — external API keys (Google AI,
ElevenLabs, Solana minting authority) must never be exposed client-side.

- `POST /api/generate-dog` — rolls stats + personality, calls Google AI for
  portrait + bio/taunt, returns dog data + image.
- `POST /api/mint` — mints the generated dog as a Solana devnet NFT.
- `POST /api/battle` — resolves the fight against the fixed raccoon, calls
  Google AI for the outcome line, calls ElevenLabs for narration audio,
  returns result + audio.

Client stays dumb: it calls these routes and renders what comes back. No
API keys, no minting keypairs, no direct third-party SDK calls from the browser
except wallet connection itself.

## Solana

- **@solana/web3.js** for RPC/transactions.
- **Metaplex (mpl-token-metadata / umi)** for NFT minting with metadata
  (image URI, stats, personality as on-chain attributes).
- **@solana/wallet-adapter-react** (+ wallet-adapter-wallets) for connecting
  Phantom/Solflare in the browser.
- Devnet only, per `SOLANA_RPC_URL` in `.env.local`.
- NFT image itself: upload the Google AI-generated portrait to a hosted
  location (start with a simple approach — e.g. data URI or a basic storage
  bucket — revisit only if minting requires a public URL Metaplex can't take
  otherwise).

## Google AI

- Google AI Studio / Gemini API for:
  - Portrait image generation from stats + personality.
  - Short bio/taunt text generation.
  - Post-battle result line generation.
- Called server-side only, via `GOOGLE_AI_API_KEY`.

## ElevenLabs

- Text-to-speech for the battle result line, called server-side via
  `ELEVENLABS_API_KEY`.
- Audio returned to the client as a playable URL/blob for the result screen.

## State management

- No global state library. Local component state / React context for the
  single-playthrough flow (dog → mint → fight → result) is enough given the
  scope is intentionally linear and non-persistent.

## Testing

- Minimal for a weekend build: no dedicated test suite planned. Manual
  click-through verification per vertical slice (see roadmap.md) is the
  primary correctness check.
