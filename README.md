# FetchQuest 🐕

A tiny dog-vs-raccoon battler built for the **DEV Weekend Challenge: Dog Days Edition**.

Generate a dog, watch it come to life with an AI-drawn portrait and voiced battle
narration, mint it as an on-chain Solana devnet NFT, and send it into a single
fight against a raccoon.

## Prize categories

- **Best use of Solana** — every generated dog is minted as a real devnet NFT.
- **Best use of Google AI** — each dog gets a generated portrait and a short
  bio/taunt based on its stats and personality.
- **Best use of ElevenLabs** — the battle result is narrated out loud using a
  generated voice line.

## Core loop

1. **Generate a dog** — random stats (Speed, Bark, Chomp) and a personality tag
   (e.g. Territorial, Nervous, Good Boy).
2. **Bring it to life** — Google AI generates a portrait image and a short
   bio/taunt line for the dog based on its stats and personality.
3. **Mint it** — the dog is minted as an NFT on Solana devnet, owned by the
   connected wallet.
4. **Fight** — the dog is auto-resolved in a single battle against a fixed
   raccoon opponent, based on stats.
5. **Hear the result** — an AI-written line describing the outcome is voiced
   with ElevenLabs and played on the result screen.

That's the entire scope for this submission — one dog, one fight, one result.

## Tech stack

- **Next.js + React** — app and UI
- **Solana devnet** — NFT minting for each generated dog
- **Google AI** — portrait image generation + bio/taunt text generation
- **ElevenLabs** — text-to-speech for battle narration

## Demo video

https://github.com/user-attachments/assets/21b6a8a7-e470-4e16-8623-4ead4e7a6236

[View Mint on Solana Explorer](https://explorer.solana.com/address/9C4ascegRCRoUZ7KmLBvoWyB3g1bkJofSt1yaqHjg6B6?cluster=devnet)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Solana devnet wallet

You need a Solana wallet with devnet SOL to mint dogs.

```bash
# Install the Solana CLI if you don't have it
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Create a devnet keypair
solana-keygen new --outfile ./devnet-keypair.json

# Point the CLI at devnet and airdrop some test SOL
solana config set --url https://api.devnet.solana.com
solana airdrop 2 $(solana-keygen pubkey ./devnet-keypair.json)
```

Alternatively, install [Phantom](https://phantom.app/) or
[Solflare](https://solflare.com/), switch the wallet to **Devnet** in
settings, and use its built-in faucet.

### 3. API keys

Create a `.env.local` file in the project root:

```bash
# Google AI (portrait + bio/taunt generation)
GOOGLE_AI_API_KEY=your_key_here

# ElevenLabs (battle narration voice)
ELEVENLABS_API_KEY=your_key_here

# Solana devnet RPC
SOLANA_RPC_URL=https://api.devnet.solana.com
```

- Get a Google AI key from [Google AI Studio](https://aistudio.google.com/).
- Get an ElevenLabs key from your [ElevenLabs account settings](https://elevenlabs.io/).

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
