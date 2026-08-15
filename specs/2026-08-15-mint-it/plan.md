# Plan — Phase 2: Mint it

## 1. Dependencies + env setup

1. Install wallet-adapter packages: `@solana/wallet-adapter-react`,
   `@solana/wallet-adapter-react-ui`, `@solana/wallet-adapter-wallets`,
   `@solana/wallet-adapter-base`, `@solana/web3.js`.
2. Install Metaplex/Umi packages: `@metaplex-foundation/umi`,
   `@metaplex-foundation/umi-bundle-defaults`,
   `@metaplex-foundation/mpl-token-metadata`,
   `@metaplex-foundation/umi-uploader-irys`.
3. Add `SOLANA_MINT_AUTHORITY_SECRET` (base58 or JSON array secret key, server
   only) to `.env.local.example` with a comment explaining it only pays for
   Arweave uploads. Generate a local devnet keypair for testing and fund it
   via `solana airdrop` / faucet.
4. Confirm `SOLANA_RPC_URL` (already present) points at devnet.

## 2. Wallet connect UI

1. Add a `WalletContextProvider` (client component) wrapping
   `ConnectionProvider` (using `SOLANA_RPC_URL`... but this is a server env
   var — expose a public `NEXT_PUBLIC_SOLANA_RPC_URL` or hardcode
   `clusterApiUrl('devnet')` client-side; reconcile with `SOLANA_RPC_URL`'s
   intent) → `WalletProvider` (`wallets: [PhantomWalletAdapter,
   SolflareWalletAdapter]`, `autoConnect={false}`) → `WalletModalProvider`.
2. Mount this provider in `app/layout.tsx` (or a client-only wrapper) so
   `useWallet()`/`useConnection()` are available in `MintStep`.
3. Import wallet-adapter-react-ui's default CSS and override the button
   styling to match the existing gradient theme (Tailwind + a small CSS
   override layer, since the stock button isn't Tailwind-native).
4. In `MintStep`, add a connect/disconnect button using `useWallet()`
   (`connected`, `publicKey`, `connect`/`disconnect` or `WalletMultiButton`).
5. Manual test: connect/disconnect with both Phantom and Solflare browser
   extensions (devnet network selected in the wallet itself).

## 3. Balance check + airdrop affordance

1. On wallet connect, call `connection.getBalance(publicKey)` and store SOL
   balance in `MintStep` state; re-check after airdrop or after mint.
2. Define a minting threshold constant (e.g. `MIN_SOL_TO_MINT = 0.05`).
3. If balance < threshold, render a "Request devnet SOL" button calling
   `connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL * 1)`, then poll
   `getBalance` (short interval, capped retries) until it rises or times out.
4. On airdrop failure/timeout, show inline error + link to
   `https://faucet.solana.com` (`target="_blank"`).
5. Disable the "Mint" button while balance is insufficient or an airdrop is
   in flight.
6. Manual test: use a fresh devnet keypair with 0 SOL, confirm the airdrop
   button works; simulate faucet failure (e.g. rapid repeated requests to
   trigger rate limit) and confirm the fallback link appears.

## 4. `lib/solana.ts` — Umi client + upload helper

1. Add `lib/solana.ts`:
   - `getUmi()` — creates a Umi instance via
     `createUmi(SOLANA_RPC_URL).use(irysUploader()).use(mplTokenMetadata())`,
     with the identity set from `SOLANA_MINT_AUTHORITY_SECRET`.
   - `uploadDogAssets(dog: Dog, mintAddress: string)` — uploads the portrait
     (decode the data URI to bytes, wrap as a Umi `createGenericFile`) then
     uploads the metadata JSON (per requirements.md's shape) referencing the
     uploaded image URI; returns the metadata URI.
2. Manual test: call `uploadDogAssets` against a sample `Dog` object from a
   Node script or temporary API route, confirm both Arweave URIs resolve in
   a browser.

## 5. `/api/mint` route

1. Scaffold `app/api/mint/route.ts` (POST handler) accepting `{ dog: Dog,
   ownerPublicKey: string }`.
2. Validate `ownerPublicKey` parses as a valid `PublicKey`; reject malformed
   input with 400.
3. Call `uploadDogAssets` to get the metadata URI.
4. Build the mint transaction via `mpl-token-metadata`'s `createNft` (or
   equivalent Umi builder), generating a new mint keypair, setting
   `tokenOwner`/`updateAuthority` to `ownerPublicKey`, `uri` to the metadata
   URI, `name`/`symbol` per requirements.md.
5. Serialize the unsigned transaction (base64) for the client, alongside the
   new mint address.
6. Manual test: hit the route with a valid dog payload + a real devnet
   public key, confirm it returns a serialized tx and mint address without
   throwing.

## 6. Client-side sign + send

1. In `MintStep`, on "Mint" click: POST to `/api/mint` with the current
   `Dog` and `publicKey.toBase58()`.
2. Deserialize the returned transaction, use `sendTransaction` from
   `useWallet()` to have the connected wallet sign + submit it via
   `useConnection()`'s `connection`.
3. Await confirmation (`connection.confirmTransaction`), transitioning UI
   state: pending (request in flight) → confirming (submitted, awaiting
   confirmation) → minted (confirmed).
4. On success, store the mint address in `page.tsx` state (or local to
   `MintStep`) for the Explorer link and to pass along to later phases if
   needed.
5. On any failure (upload error, tx build error, user rejects in wallet, RPC
   timeout), show an inline error state with a "Retry" button that re-runs
   the mint flow from the top.
6. Manual test: full happy path with a funded devnet wallet; also test
   rejecting the wallet signature prompt to confirm the error state renders
   without crashing.

## 7. Minted state + Explorer link

1. On `minted`, render a success state: mint address (truncated), a link to
   `https://explorer.solana.com/address/<mint>?cluster=devnet` (new tab),
   and the "Next" control to advance to Fight (only shown now).
2. Manual test: click the Explorer link, confirm the NFT page loads on
   devnet and shows the correct image + attributes.

## 8. Polish pass

1. Framer Motion: animate state transitions (connect → balance check → mint
   pending → confirming → minted) consistent with Phase 1's reveal style.
2. Minting animation/feedback: a visible in-progress indicator during
   pending/confirming (not just a disabled button), on-brand with the
   gradient theme.
3. Error state polish: airdrop failure and mint failure both get a clear,
   non-jarring inline treatment (not a raw error dump).
4. Click through the full slice manually end-to-end: connect → (airdrop if
   needed) → mint → minted → Explorer link → advance to Fight placeholder.

## 9. Wrap-up

1. Update `.env.local` (local, untracked) with a real funded devnet
   `SOLANA_MINT_AUTHORITY_SECRET` for manual testing.
2. Confirm `npm run lint` / `npm run typecheck` pass.
3. Mark Phase 2 complete in [roadmap.md](../roadmap.md) once validation.md's
   checklist passes.
