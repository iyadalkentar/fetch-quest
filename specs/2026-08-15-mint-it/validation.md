# Validation — Phase 2: Mint it

This slice is done and mergeable when all of the following hold.

## Functional — wallet

- [ ] `MintStep` shows a "Connect Wallet" control when no wallet is
      connected; clicking it opens the wallet-adapter modal with Phantom and
      Solflare as options.
- [ ] No `autoConnect` — reloading the page does not silently reconnect a
      previously-authorized wallet without a user click.
- [ ] Once connected, the wallet's public key (or a truncated form) is
      visibly shown, and the current SOL balance (devnet) is displayed or
      checked.

## Functional — balance / airdrop

- [ ] A wallet with balance below the minting threshold shows a "Request
      devnet SOL" button; clicking it requests an airdrop and the balance
      display updates on success.
- [ ] If the airdrop request fails or times out, an inline error appears
      with a working link to `https://faucet.solana.com`.
- [ ] The "Mint" button is disabled while balance is insufficient or an
      airdrop is in flight.

## Functional — mint

- [ ] Clicking "Mint" with sufficient balance calls `/api/mint`, transitions
      through pending → confirming → minted states.
- [ ] The resulting NFT's on-chain metadata (verified via Explorer or
      `getAsset`/`getAccountInfo`) has the dog's `name`, portrait as `image`,
      and `Speed`/`Bark`/`Chomp`/`Personality` as attributes.
- [ ] The minted NFT's owner is the connected wallet's public key, not the
      server's mint-authority keypair.
- [ ] `SOLANA_MINT_AUTHORITY_SECRET` is never sent to or readable from the
      browser (check network tab / client bundle).
- [ ] On success, a Solana Explorer devnet link is shown and resolves to the
      correct NFT with correct image + attributes.
- [ ] The "Next" control to advance to Fight only appears once minted, not
      before.

## Failure handling

- [ ] Rejecting the wallet's signature prompt shows an inline error state
      (not a crash) with a "Retry" button that re-attempts the mint flow.
- [ ] Simulating an upload failure (e.g. temporarily breaking the Umi
      uploader config) surfaces an inline error rather than a hard failure,
      with retry available.
- [ ] Malformed/missing `ownerPublicKey` in a direct `/api/mint` request
      returns a 400, not a 500 or silent failure.

## UI / polish

- [ ] State transitions (connect → balance check → pending → confirming →
      minted) animate with Framer Motion, not instant jumps.
- [ ] Minting shows an on-brand in-progress indicator during pending/
      confirming, consistent with the existing gradient theme.
- [ ] Visual style matches Phase 1's established look (buttons, spacing,
      dark mode support).

## Code health

- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] No secrets committed (`SOLANA_MINT_AUTHORITY_SECRET` stays in
      untracked `.env.local`; `.env.local.example` only documents the var
      name).

## Explicitly not required for this slice

- Fight/Result functionality — those steps remain placeholders.
- Automated tests — manual click-through per tech-stack.md's testing note.
- A "my minted dogs" history/gallery view.
