# Mission

FetchQuest is a tiny dog-vs-raccoon battler built for the **DEV Weekend Challenge: Dog Days Edition**.

## Success criteria: polish over breadth

The bar for this submission is that the core loop *feels great* — smooth pacing,
satisfying reveals, good animation and sound — even if that means trimming scope
on one integration rather than shipping three integrations that feel clunky.

If a trade-off arises between "add another feature" and "make the existing steps
feel better," choose the latter.

## Scope

One dog. One fight. One result. No roster, no PvP, no multi-round battles, no
persistence beyond a single playthrough unless it directly supports polish
(e.g. viewing your minted dog after the fact).

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

## Prize categories

- **Best use of Solana** — every generated dog is minted as a real devnet NFT.
- **Best use of Google AI** — each dog gets a generated portrait and a short
  bio/taunt based on its stats and personality.
- **Best use of ElevenLabs** — the battle result is narrated out loud using a
  generated voice line.

## Non-goals

- Multiplayer, matchmaking, leaderboards
- Mainnet deployment
- Account systems / auth beyond wallet connection
- Editing or re-rolling a minted dog
