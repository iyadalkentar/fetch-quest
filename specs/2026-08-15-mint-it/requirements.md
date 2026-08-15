# Requirements — Phase 2: Mint it

## Scope

Implement the second vertical slice from [roadmap.md](../roadmap.md): connect
a Solana devnet wallet, mint the currently-generated dog (from Phase 1) as an
NFT with its portrait + stats/personality as metadata, and show
pending/confirming/minted states with a polish pass. This slice starts once a
dog exists in `page.tsx` state (`Dog` from `lib/dog.ts`) and ends at a minted
NFT with an Explorer link — fight/result stay out of scope (`FightStep`/
`ResultStep` placeholders untouched).

## Decisions

### Wallet connect — Phantom + Solflare, no autoConnect

- `@solana/wallet-adapter-react` + `@solana/wallet-adapter-wallets`, configured
  with `PhantomWalletAdapter` and `SolflareWalletAdapter` only.
- `WalletProvider` `autoConnect` is **off** — user must click "Connect Wallet"
  explicitly each visit. No silent reconnect popups.
- Network: devnet only, `SOLANA_RPC_URL` from `.env.local` (already in
  `.env.local.example`) feeds the `Connection`/`ConnectionProvider`.
- Wallet UI: `WalletModalProvider` + `WalletMultiButton` (or a minimal custom
  button wrapping `useWallet()`) for connect/disconnect — pick whichever is
  faster to theme consistently with the existing gradient UI; the stock
  adapter CSS is expected to need overriding to match.

### Asset + metadata storage — Arweave via Metaplex Umi uploader

- Use Umi (`@metaplex-foundation/umi` + `@metaplex-foundation/umi-bundle-defaults`)
  with `@metaplex-foundation/umi-uploader-irys` (or `irysUploader`) to upload
  two things at mint time, server-side:
  1. The dog's portrait (currently a data URI from Phase 1) as an image file.
  2. A metadata JSON object (see below) referencing that image's Arweave URI.
- Upload cost is paid by the mint authority keypair used server-side (devnet —
  negligible, but the server needs a funded devnet keypair; see "Server
  signing key" below).
- No IPFS/Pinata, no custom storage bucket — Umi's uploader is the only asset
  pipeline for this phase.

### Metadata shape

- Standard Metaplex NFT JSON: `name`, `symbol` (e.g. `FETCH`), `description`
  (use the dog's `bio`), `image` (Arweave URI), and an `attributes` array with:
  - `Speed`, `Bark`, `Chomp` (as number-valued attributes)
  - `Personality` (string-valued, the personality tag)
- On-chain metadata (Token Metadata program): `name`, `symbol`, `uri` (the
  Arweave metadata JSON URI), seller fee basis points `0`, no creators royalty
  logic needed for a devnet demo mint.

### Mint flow — server builds unsigned tx, client (wallet) signs

- `POST /api/mint` receives the `Dog` payload (stats, personality, portrait
  data URI, bio) and the connected wallet's public key.
- Server-side, the route:
  1. Uploads image + metadata JSON to Arweave via Umi (using the server's
     funded devnet keypair as the Umi identity/payer for the upload step).
  2. Builds the mint transaction (generate a new mint keypair, construct the
     `createNft`-style instruction set via Umi/mpl-token-metadata) with the
     **connected wallet's public key as the token owner and update
     authority**, and the server's keypair only covering the Arweave upload
     and (if needed) partially signing as the new mint's temporary authority
     during construction.
  3. Returns the serialized unsigned transaction (plus the new mint address)
     to the client.
- Client: wallet-adapter's `sendTransaction` (or `signTransaction` +
  `connection.sendRawTransaction`) signs and submits using the connected
  wallet, so the mint transaction's fee payer is the user's wallet and the
  resulting NFT is genuinely owned by them.
- Server keypair (`SOLANA_MINT_AUTHORITY_SECRET` or similar, new env var) is
  used **only** to pay for/authorize the Arweave upload step, never to hold
  or transfer the NFT itself. Document this as a new required env var in
  `.env.local.example`.

### Insufficient balance — in-app airdrop button

- Before/after connecting, check the wallet's devnet SOL balance
  (`connection.getBalance`).
- If balance is below a minting threshold (rough estimate: mint tx +
  headroom, e.g. < 0.05 SOL), show a "Request devnet SOL" button that calls
  `connection.requestAirdrop(publicKey, amount)`, then polls/re-checks balance
  and clears the warning on success.
- If the airdrop call itself fails (rate-limited, faucet down — common on
  public devnet), show an inline error with a manual fallback: a link to
  `https://faucet.solana.com` opened in a new tab, so the user isn't stuck.
- The "Mint" button stays disabled while balance is insufficient and no
  airdrop is in flight.

### UI states

- `MintStep` replaces its static placeholder with:
  - Wallet connect button (if not connected).
  - Once connected: balance check → low-balance airdrop affordance if needed.
  - "Mint" button → pending (building unsigned tx) → confirming (submitted,
    awaiting confirmation) → minted (confirmed) states, each visually
    distinct.
  - On minted: show a link to view the NFT on Solana Explorer, devnet cluster
    (`https://explorer.solana.com/address/<mint>?cluster=devnet`).
  - Error state: mint tx failure (rejected by user, RPC error, upload
    failure) shown inline with a retry action, not a hard crash.
  - "Next" control to advance to Fight only appears once minted.

## Out of scope for this slice

- Fight resolution, result narration — later phases.
- Mainnet, multiple simultaneous mints, re-minting/editing a minted dog.
- Persisting mint history beyond the current playthrough's React state (no
  "my minted dogs" list/gallery).
- Automated tests — manual click-through per tech-stack.md's testing note.
